<?php
    $client = new SoapClient(null, [
        "location" => "http://localhost/SAMS/server.php",
        "uri" => "http://localhost/SAMS/server.php"
    ]);

    $loginResponse = $client->__soapCall('LogIn', [[
        "Email" => '2022ajkamachi@live.mcl.edu.ph',
        "Password" => 1
    ]]);

    $token = $loginResponse['Token'];

    // Future call: Authenticated with token
    $auth = new stdClass();
    $auth->Token = $token;
    $header = new SoapHeader('http://localhost/SAMS/server.php', 'AuthHeader', $auth);

   $client->__setSoapHeaders($header);
    $response = $client->__soapCall('GetCurrentUser', []);
    echo "Hello, " . $response;
?>