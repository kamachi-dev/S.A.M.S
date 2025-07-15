<?php
require __DIR__ . '/../general.php';

# END OF HEADER

$email = $user["email"];

$cred = getID($email);

if ($cred['role'] != 'admin') {
    echo json_encode(['credential_error' => 'you are not an admin']);
    exit;
}

try {
    $res = pg_query($con, "SELECT
        base.firstname,
        base.lastname,
        base.email,
        base.phone,
        base.pfp
        FROM parent
        JOIN base ON parent.base = base.id
        ORDER BY base.lastname, base.firstname");
    
    if (!$res) {
        echo json_encode(['error' => 'Database query failed: ' . pg_last_error($con)]);
        exit;
    }
    
    $parents = pg_fetch_all($res);
    
    if ($parents === false) {
        echo json_encode([]);
    } else {
        echo json_encode($parents);
    }
    
} catch (Exception $e) {
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
}
?>