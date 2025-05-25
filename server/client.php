<?php
    $client = new SoapClient(null, [
        "location" => "http://localhost:8080/SAMS/server.php",
        "uri" => "http://localhost:8080/SAMS/server.php"
    ]);

    $loginResponse = $client->__soapCall('Login', [[
        'Username' => 'Kamachi',
        'Password' => 'root'
    ]]);

    $token = $loginResponse['Token'];

    // Future call: Authenticated with token
    $auth = new stdClass();
    $auth->Token = $token;
    $header = new SoapHeader('http://localhost:8080/SAMS/server.php', 'AuthHeader', $auth);

    $client->__setSoapHeaders($header);
    $response = $client->__soapCall('GetCurrentUser', []);
    echo "Hello, " . $response;
?>