<?php
class Database {
    private $host;
    private $database_name;
    private $username;
    private $password;
    private $charset = 'utf8mb4';
    public $conn;

    public function __construct() {
        $this->host = 'localhost';
        $this->database_name = 'food_ordering';
        $this->username = 'root';
        $this->password = '';
    }

    public function getConnection() {
        try {
            $this->conn = null;
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->database_name . ";charset=" . $this->charset;
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ];

            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            return $this->conn;
            
        } catch(PDOException $e) {
            // Log error dan kembalikan error dalam format JSON
            error_log("Database Connection Error: " . $e->getMessage());
            header('Content-Type: application/json');
            echo json_encode([
                "status" => "error",
                "message" => "Database connection failed"
            ]);
            exit();
        }
    }
}