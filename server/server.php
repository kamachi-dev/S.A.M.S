<?php
    class Server {
        private $con = null;
        public function __construct() {
            if (is_null($this->con)) $this->con = $this->connect();
        }
        public static function authenticate($header_params) {
            // Here you would typically check the credentials against a database
            if ($header_params->username != 'root') throw new SoapFault("Authentication Failed", "Account not found.");
            if ($header_params->password != 'root') throw new SoapFault("Authentication Failed", "Invalid password.");
            return true;
        }
        public static function connect() {
            $con = mysqli_connect("localhost", "root", "");
            $db = mysqli_select_db($con, "SAMS");
            return $con;
        }
        public function getUser($id) {
            $sql = "SELECT * FROM parent WHERE ID = $id";
            $qry = mysqli_query($this->con, $sql);
            $res = mysqli_fetch_array($qry);
            return "ITS " . $_SERVER["PHP_AUTH_USER"] . "!";
        }
    }

    $params = [
        'uri' => 'http://localhost:8080/SAMS/index.php',
        'content-type' => 'text/xml; charset=utf-8'
    ];

    $server = new SoapServer(null, $params);
    $server->setClass('Server');
    $server->handle();
?>