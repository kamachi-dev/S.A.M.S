<?php
    // CORS security
    $allowed_origin = 'http://127.0.0.1:5500';

    if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowed_origin) {
        header("Access-Control-Allow-Origin: $allowed_origin");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, SOAPAction");
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    class Server {
        private $con = null;
        public function Register($params) {
            $email = $params['Email'];
            $password = $params['Password'];
            $first_name = $params['FirstName'];
            $last_name = $params['LastName'];
            $role = $params['Role'];

            // Check if email already exists
            $sql = "SELECT * FROM `teacher` WHERE `Email` = '$email'
                    UNION ALL
                    SELECT * FROM `admin` WHERE `Email` = '$email'
                    UNION ALL
                    SELECT * FROM `parent` WHERE `Email` = '$email'";
            $qry = mysqli_query($this->con, $sql);
            if (mysqli_num_rows($qry) > 0) return new SoapFault('Server', 'Email already registered');

            // Insert new user
            $sql = "INSERT INTO `$role` (`Email`, `Password`, `First name`, `Last name`) VALUES ('$email', '$password', '$first_name', '$last_name')";
            if (mysqli_query($this->con, $sql)) return ['Status' => 'Success'];
            else return new SoapFault('Server', 'Database error: '.mysqli_error($this->con));
        }
        public function Login($email, $password) {
            #rate limiting
            $main_ip = $_SERVER['REMOTE_ADDR'];
            $ratelimit = json_decode(file_get_contents("./tmp/ratelimit"), true);
            $last_update = $ratelimit['last_update'];

            foreach ($ratelimit['ip_list'] as $ip => $attempts) {
                $ratelimit['ip_list'][$ip] -= (time() - $last_update) / 20;
                if ($ratelimit['ip_list'][$ip] < 1) unset($ratelimit['ip_list'][$ip]);
            }

            if (!isset($ratelimit['ip_list'][$ip])) $ratelimit['ip_list'][$main_ip] = 1;
            else $ratelimit['ip_list'][$ip]++;

            if ($ratelimit['ip_list'][$main_ip] > 5) return new SoapFault('Server', 'Rate limit exceeded. Try again in '.(20 - (time() - $last_update)).' seconds');
            $ratelimit['last_update'] = time();
            file_put_contents("./tmp/ratelimit", json_encode($ratelimit));

            #verify credentials
            $sql = "SELECT * FROM `base` WHERE `Email` = '$email' AND `Password` = '$password'";
            $qry = mysqli_query($this->con, $sql);
            $res = mysqli_fetch_array($qry);
            if ($res == null) return new SoapFault('Server', 'Invalid credentials');

            #get info
            $sql = "SELECT 
                COALESCE(admin.ID, parent.ID, teacher.ID) AS ID,
                role.Type
                FROM `base`
                INNER JOIN `role` ON `role`.`ID` = `base`.`Role`
                LEFT JOIN `admin` ON `role`.`ID` = `admin`.`Base`
                LEFT JOIN `parent` ON `role`.`ID` = `parent`.`Base`
                LEFT JOIN `teacher` ON `role`.`ID` = `teacher`.`Base`
                WHERE `base`.`Email` = '$email'";
            $qry = mysqli_query($this->con, $sql);
            $res = mysqli_fetch_array($qry);
            $role_info = $res["ID"];
            $role_type = $res["Type"];

            #generate token
            $token = bin2hex(random_bytes(10));
            $data = json_encode([
                'email' => $email,
                'role_info' => $role_info,
                'role_type' => $role_type,
                'created' => time()
            ]);
            file_put_contents("./tmp/token_$token", $data);
            $this->cleanupTokens();
            return ['Token' => $token];
        }

        private function cleanupTokens() {
            $dir = "./tmp";
            foreach (glob("$dir/token_*") as $file) {
                $data = json_decode(file_get_contents($file), true);
                if (!$data || time() - $data['created'] > 300) unlink($file);
            }
        }

        public function GetCurrentUser() {
            // Extract SOAP header token
            $headers = file_get_contents("php://input");
            preg_match('/<Token>(.*?)<\/Token>/', $headers, $match);
            $token = $match[1] ?? null;

            if ($token && file_exists("./tmp/token_$token")) $token_content = json_decode(file_get_contents("./tmp/token_$token"), true);
            else throw new SoapFault('Server', 'Invalid or missing token');
            
            $role_info = $token_content['role_info'];
            $role_type = $token_content['role_type'];

            $sql = "SELECT * FROM `$role_type` WHERE `ID` = '$role_info'";
            $qry = mysqli_query($this->con, $sql);
            $res = mysqli_fetch_array($qry);
            return $res["First name"];
        }

        public function __construct() {
            if (is_null($this->con)) $this->con = $this->connect();
        }

        public static function connect() {
            $con = mysqli_connect("127.0.0.1", "root", "");
            $db = mysqli_select_db($con, "SAMS");
            return $con;
        }
    }

    $params = [
        'uri' => 'http://127.0.0.1/SAMS/index.php',
        'content-type' => 'text/xml; charset=utf-8'
    ];

    $server = new SoapServer(null, $params);
    $server->setClass('Server');
    $server->handle();
?>