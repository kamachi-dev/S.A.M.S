<?php
require __DIR__ . '/../general.php';

// Verify admin credentials
$email = $user["email"];
$cred = getID($email);
if ($cred['role'] != 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Admin access required']);
    exit;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Only POST method allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
        exit;
    }

    // Accept teacher id or email for lookup
    $teacherId = $input['id'] ?? null;
    $originalEmail = $input['original_email'] ?? null;
    if (!$teacherId && !$originalEmail) {
        echo json_encode(['success' => false, 'error' => 'Teacher id or original_email is required']);
        exit;
    }

    // Start transaction
    pg_query($con, "BEGIN");

    // Lookup teacher and base info
    if ($teacherId) {
        $lookupQuery = "SELECT teacher.id as teacher_id, base.id as base_id FROM teacher JOIN base ON teacher.base = base.id WHERE teacher.id = $1";
        $lookupResult = pg_query_params($con, $lookupQuery, [$teacherId]);
    } else {
        $lookupQuery = "SELECT teacher.id as teacher_id, base.id as base_id FROM base JOIN teacher ON base.id = teacher.base WHERE base.email = $1";
        $lookupResult = pg_query_params($con, $lookupQuery, [$originalEmail]);
    }
    
    if (!$lookupResult || pg_num_rows($lookupResult) === 0) {
        pg_query($con, "ROLLBACK");
        echo json_encode(['success' => false, 'error' => 'Teacher not found']);
        exit;
    }
    
    $lookupRow = pg_fetch_assoc($lookupResult);
    $baseId = $lookupRow['base_id'];
    $actualTeacherId = $lookupRow['teacher_id'];

    // Build update fields for base table
    $fields = [];
    $params = [];
    $paramIdx = 1;
    foreach (["firstname", "lastname", "email", "phone", "pfp"] as $field) {
        if (isset($input[$field]) && $input[$field] !== '') {
            $fields[] = "$field = $$paramIdx";
            $params[] = $input[$field];
            $paramIdx++;
        }
    }
    
    if (count($fields) > 0) {
        $params[] = $baseId;
        $updateBaseQuery = "UPDATE base SET ".implode(", ", $fields)." WHERE id = $$paramIdx";
        $updateBaseResult = pg_query_params($con, $updateBaseQuery, $params);
        if (!$updateBaseResult) {
            pg_query($con, "ROLLBACK");
            echo json_encode(['success' => false, 'error' => 'Failed to update base record', 'pg_error' => pg_last_error($con)]);
            exit;
        }
    }

    // Handle department update
    $departmentId = null;
    if (isset($input['department']) && $input['department'] !== '') {
        // Check if department exists
        $deptCheckQuery = "SELECT id FROM department WHERE name = $1";
        $deptCheckResult = pg_query_params($con, $deptCheckQuery, [$input['department']]);
        if (pg_num_rows($deptCheckResult) > 0) {
            $departmentId = pg_fetch_result($deptCheckResult, 0, 'id');
        } else {
            // Create new department
            $deptInsertQuery = "INSERT INTO department (name) VALUES ($1) RETURNING id";
            $deptInsertResult = pg_query_params($con, $deptInsertQuery, [$input['department']]);
            if ($deptInsertResult) {
                $departmentId = pg_fetch_result($deptInsertResult, 0, 'id');
            }
        }
    }

    // Handle course assignment/update
    if (isset($input['selected_course_id']) && $input['selected_course_id'] !== '') {
        $selectedCourseId = $input['selected_course_id'];
        
        // First, unassign any current courses from this teacher
        $unassignQuery = "UPDATE course SET teacher = NULL WHERE teacher = $1";
        $unassignResult = pg_query_params($con, $unassignQuery, [$actualTeacherId]);
        
        if (!$unassignResult) {
            pg_query($con, "ROLLBACK");
            echo json_encode(['success' => false, 'error' => 'Failed to unassign current courses', 'pg_error' => pg_last_error($con)]);
            exit;
        }
        
        // Assign the selected course to this teacher
        $assignCourseQuery = "UPDATE course SET teacher = $1";
        $assignParams = [$actualTeacherId];
        $paramIdx = 2;
        
        // Update department if provided
        if ($departmentId) {
            $assignCourseQuery .= ", department = $$paramIdx";
            $assignParams[] = $departmentId;
            $paramIdx++;
        }
        
        $assignCourseQuery .= " WHERE id = $$paramIdx";
        $assignParams[] = $selectedCourseId;
        
        $assignResult = pg_query_params($con, $assignCourseQuery, $assignParams);
        
        if (!$assignResult) {
            pg_query($con, "ROLLBACK");
            echo json_encode(['success' => false, 'error' => 'Failed to assign selected course', 'pg_error' => pg_last_error($con)]);
            exit;
        }
    } else {
        // Handle manual course name/code update for existing courses OR create new course for unassigned teachers
        if ((isset($input['course_name']) && $input['course_name'] !== '') || 
            (isset($input['course_code']) && $input['course_code'] !== '')) {
            
            // Find the teacher's current course
            $findCourseQuery = "SELECT id FROM course WHERE teacher = $1 LIMIT 1";
            $findCourseResult = pg_query_params($con, $findCourseQuery, [$actualTeacherId]);
            
            if ($findCourseResult && pg_num_rows($findCourseResult) > 0) {
                // Teacher has existing course - update it
                $courseId = pg_fetch_result($findCourseResult, 0, 'id');
                $courseFields = [];
                $courseParams = [];
                $courseParamIdx = 1;
                
                if (isset($input['course_name']) && $input['course_name'] !== '') {
                    $courseFields[] = "name = $$courseParamIdx";
                    $courseParams[] = $input['course_name'];
                    $courseParamIdx++;
                }
                
                if (isset($input['course_code']) && $input['course_code'] !== '') {
                    $courseFields[] = "code = $$courseParamIdx";
                    $courseParams[] = $input['course_code'];
                    $courseParamIdx++;
                }
                
                if ($departmentId) {
                    $courseFields[] = "department = $$courseParamIdx";
                    $courseParams[] = $departmentId;
                    $courseParamIdx++;
                }
                
                if (count($courseFields) > 0) {
                    $courseParams[] = $courseId;
                    $updateCourseQuery = "UPDATE course SET ".implode(", ", $courseFields)." WHERE id = $$courseParamIdx";
                    $updateCourseResult = pg_query_params($con, $updateCourseQuery, $courseParams);
                    
                    if (!$updateCourseResult) {
                        pg_query($con, "ROLLBACK");
                        echo json_encode(['success' => false, 'error' => 'Failed to update course record', 'pg_error' => pg_last_error($con)]);
                        exit;
                    }
                }
            } else {
                // Teacher has no existing course - create new one
                $courseName = $input['course_name'] ?? 'Unassigned';
                $courseCode = $input['course_code'] ?? 'Unassigned';
                
                // Prepare insert parameters
                $insertParams = [$courseName, $courseCode, $actualTeacherId];
                $insertQuery = "INSERT INTO course (name, code, teacher";
                $valuesClause = "VALUES ($1, $2, $3";
                $paramIdx = 4;
                
                if ($departmentId) {
                    $insertQuery .= ", department";
                    $valuesClause .= ", $$paramIdx";
                    $insertParams[] = $departmentId;
                    $paramIdx++;
                }
                
                $insertQuery .= ") " . $valuesClause . ")";
                
                $insertCourseResult = pg_query_params($con, $insertQuery, $insertParams);
                
                if (!$insertCourseResult) {
                    pg_query($con, "ROLLBACK");
                    echo json_encode(['success' => false, 'error' => 'Failed to create new course record', 'pg_error' => pg_last_error($con)]);
                    exit;
                }
            }
        }
    }

    pg_query($con, "COMMIT");
    echo json_encode(['success' => true, 'message' => 'Teacher information updated successfully']);

} catch (Exception $e) {
    pg_query($con, "ROLLBACK");
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while updating teacher',
        'details' => $e->getMessage()
    ]);
}
?>