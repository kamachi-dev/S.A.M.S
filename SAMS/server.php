<?php
    class Server {
        private $con = null;
        public function Login($params) {
            #rate limiting
            $main_ip = $_SERVER['REMOTE_ADDR'];
            $ratelimit = json_decode(file_get_contents("./tmp/ratelimit"), true);
            $last_update = $ratelimit['last_update'];

            $i = 0;
            foreach ($ratelimit['ip_list'] as $ip => $attempts) {
                $ratelimit['ip_list'][$ip] -= (time() - $last_update) / 10;
                if ($ratelimit['ip_list'][$ip] < 1) unset($ratelimit['ip_list'][$ip]);
            }

            if (!isset($ratelimit['ip_list'][$ip])) $ratelimit['ip_list'][$main_ip] = 1;
            else $ratelimit['ip_list'][$ip]++;

            if ($ratelimit['ip_list'][$main_ip] > 5) {
                throw new SoapFault('Server', 'Rate limit exceeded. Try again later.');
            }
            $ratelimit['last_update'] = time();
            file_put_contents("./tmp/ratelimit", json_encode($ratelimit));


            #verify credentials
            $username = $params['Username'];
            $password = $params['Password'];
            if ($username === 'root' && $password === 'root' || true) {
                $token = bin2hex(random_bytes(10));
                $data = json_encode([
                    'username' => $username,
                    'created' => time()
                ]);
                file_put_contents("./tmp/token_$token", $data);
                $this->cleanupTokens();
                return ['Token' => $token];
            } else {
                throw new SoapFault('Server', 'Invalid credentials');
            }
        }

        private function cleanupTokens() {
            $dir = "./tmp";
            foreach (glob("$dir/token_*") as $file) {
                $data = json_decode(file_get_contents($file), true);
                if (!$data || time() - $data['created'] > 300) {
                    unlink($file);
                }
            }
        }

        public function GetCurrentUser() {
            // Extract SOAP header token
            $headers = file_get_contents("php://input");
            preg_match('/<Token>(.*?)<\/Token>/', $headers, $match);
            $token = $match[1] ?? null;

            if ($token && file_exists("./tmp/token_$token")) $token_content = json_decode(file_get_contents("./tmp/token_$token"), true);
            else throw new SoapFault('Server', 'Invalid or missing token');
            
            $username = $token_content['username'];

            $sql = "SELECT * FROM parent WHERE `Last name` = '$username'";
            $qry = mysqli_query($this->con, $sql);
            $res = mysqli_fetch_array($qry);
            return "ITS " . $res["First name"] . "!";
        }

        public function __construct() {
            if (is_null($this->con)) $this->con = $this->connect();
        }

        public static function connect() {
            $con = mysqli_connect("localhost", "root", "");
            $db = mysqli_select_db($con, "SAMS");
            return $con;
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