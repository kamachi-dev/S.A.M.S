<?php
    $client = new SoapClient(null, [
        "location" => "https://sams-backend-c6b7.onrender.com/index.php",
        "uri" => "https://sams-backend-c6b7.onrender.com/index.php"
    ]);

    $loginResponse = $client->__soapCall('LogIn', [[
        "Email" => '2022ajkamachi@live.mcl.edu.ph',
        "Password" => 1
    ]]);

    $token = $loginResponse['Token'];

    // Future call: Authenticated with token
    $auth = new stdClass();
    $auth->Token = $token;
    $header = new SoapHeader('https://sams-backend-c6b7.onrender.com/index.php', 'AuthHeader', $auth);

   $client->__setSoapHeaders($header);
    $response = $client->__soapCall('GetCurrentUser', []);
    echo "Hello, " . $response;
?>