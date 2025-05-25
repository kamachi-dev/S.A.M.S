<?php
    class client {
        private $instance;
        public function __construct() {
            $params = array(
                "username" => "root",
                "password" => "root",
                "location" => "http://localhost:8080/SAMS/server.php",
                "uri" => "http://localhost:8080/SAMS/server.php",
                "trace" => 1,
            );
            $this->instance = new SoapClient(null, $params);

            $auth_params = new stdClass();
            $auth_params->username = "root";
            $auth_params->password = "root";
            $header_params = new SoapVar(
                $auth_params,
                SOAP_ENC_OBJECT
            );
            $header = new SoapHeader(
                "SAMS",
                "authenticate",
                $header_params
            );
            $this->instance->__setSoapHeaders([$header]);
        }
        public function getUser($id_params) {
            return $this->instance->__soapCall("getUser", [$id_params]);
        }
    }
    $client = new client();
?>