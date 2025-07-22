<?php
require __DIR__ . '/../general.php';

// Verify teacher credentials
$email = $user["email"];
$cred = getID($email);

if ($cred['role'] != 'teacher') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized: Teacher access required']);
    exit;
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Only allow GET method
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode(['success' => false, 'error' => 'Only GET method allowed']);
    exit;
}

try {
    // Get teacher ID from email
    $teacherQuery = "
        SELECT teacher.id as teacher_id 
        FROM base 
        JOIN teacher ON base.id = teacher.base 
        WHERE base.email = $1
    ";
    $teacherResult = pg_query_params($con, $teacherQuery, [$email]);
    
    if (!$teacherResult || pg_num_rows($teacherResult) === 0) {
        echo json_encode(['success' => false, 'error' => 'Teacher not found']);
        exit;
    }
    
    $teacherRow = pg_fetch_assoc($teacherResult);
    $teacherId = $teacherRow['teacher_id'];
    
    // Get attendance data with student grade levels
    $attendanceQuery = "
        SELECT 
            r.id,
            r.student as student_id,
            r.date as sent,
            r.confidence,
            r.distance,
            c.attendance,
            c.course,
            course.name,
            course.code,
            s.firstname,
            s.lastname,
            s.grade_level,
            d.name as department_name
        FROM record r
        JOIN class c ON r.id = c.record
        JOIN course ON c.course = course.id
        JOIN student s ON r.student = s.id
        LEFT JOIN department d ON course.department = d.id
        WHERE course.teacher = $1
        ORDER BY r.date DESC
    ";
    
    $attendanceResult = pg_query_params($con, $attendanceQuery, [$teacherId]);
    
    if (!$attendanceResult) {
        echo json_encode([
            'success' => false, 
            'error' => 'Failed to fetch attendance data',
            'pg_error' => pg_last_error($con)
        ]);
        exit;
    }
    
    $attendanceData = [];
    while ($row = pg_fetch_assoc($attendanceResult)) {
        $attendanceData[] = $row;
    }
    
    // Get enrolled students data for this teacher
    $studentsQuery = "
        SELECT DISTINCT
            s.id,
            s.firstname,
            s.lastname,
            s.grade_level,
            course.name as course_name,
            course.code as course_code,
            d.name as department_name
        FROM student s
        JOIN enrolled e ON s.id = e.student
        JOIN course ON e.course = course.id
        LEFT JOIN department d ON course.department = d.id
        WHERE course.teacher = $1
        ORDER BY s.lastname, s.firstname
    ";
    
    $studentsResult = pg_query_params($con, $studentsQuery, [$teacherId]);
    
    if (!$studentsResult) {
        echo json_encode([
            'success' => false, 
            'error' => 'Failed to fetch students data',
            'pg_error' => pg_last_error($con)
        ]);
        exit;
    }
    
    $studentsData = [];
    while ($row = pg_fetch_assoc($studentsResult)) {
        $studentsData[] = $row;
    }
    
    // Return combined data
    echo json_encode([
        'success' => true,
        'attendance' => $attendanceData,
        'students' => $studentsData,
        'teacher_id' => $teacherId,
        'total_attendance_records' => count($attendanceData),
        'total_enrolled_students' => count($studentsData)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while fetching dashboard data',
        'details' => $e->getMessage()
    ]);
}
?>