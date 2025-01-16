<?php
class Order {
    private $conn;
    private $table_name = "orders";

    public $id;
    public $total_amount;
    public $delivery_fee;
    public $status;
    public $created_at;

    public function __construct($db){
        $this->conn = $db;
    }

    public function create(){
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    total_amount = :total_amount,
                    delivery_fee = :delivery_fee,
                    status = :status";

        $stmt = $this->conn->prepare($query);

        // Sanitize input
        $this->total_amount = htmlspecialchars(strip_tags($this->total_amount));
        $this->delivery_fee = htmlspecialchars(strip_tags($this->delivery_fee));
        $this->status = "pending";

        // Bind values
        $stmt->bindParam(":total_amount", $this->total_amount);
        $stmt->bindParam(":delivery_fee", $this->delivery_fee);
        $stmt->bindParam(":status", $this->status);

        if($stmt->execute()){
            return $this->conn->lastInsertId();
        }
        return false;
    }
}
?>