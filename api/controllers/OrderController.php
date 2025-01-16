<?php
// Enable error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Log request details
error_log("Request Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Request Headers: " . print_r(getallheaders(), true));

// Coba set header dengan absolut path
define('ALLOWED_ORIGIN', 'http://localhost:5173');

// Set CORS headers
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Max-Age: 86400'); // 24 hours cache
header('Content-Type: application/json');

// Log headers yang sudah di-set
error_log("Response Headers: " . print_r(headers_list(), true));

// Set error handler
set_error_handler('handleError');

// Handle fatal errors
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== null && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Fatal error occurred'
        ]);
    }
});

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once '../config/database.php';

//GET ORDER
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $database = new Database();
        $db = $database->getConnection();

        // Fetch all orders with their items
        $orders = [];
        
        // Get all orders
        $orderQuery = "SELECT * FROM orders ORDER BY created_at DESC";
        $orderStmt = $db->query($orderQuery);
        $orders = $orderStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get items for each order
        foreach ($orders as &$order) {
            $itemQuery = "SELECT * FROM order_items WHERE order_id = ?";
            $itemStmt = $db->prepare($itemQuery);
            $itemStmt->execute([$order['id']]);
            $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode([
            "status" => "success",
            "data" => $orders
        ]);
        
    } catch (Exception $e) {
        error_log("Order History Error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
    exit();
}

// Delete order
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    header('Content-Type: application/json'); // Ensure JSON header is set
    
    try {
        if (!isset($_GET['id'])) {
            throw new Exception('Order ID is required');
        }
        
        $orderId = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if ($orderId === false) {
            throw new Exception('Invalid Order ID');
        }

        $database = new Database();
        $db = $database->getConnection();
        
        $db->beginTransaction();
        
        // Delete order items first
        $deleteItemsStmt = $db->prepare("DELETE FROM order_items WHERE order_id = ?");
        if (!$deleteItemsStmt->execute([$orderId])) {
            throw new Exception('Failed to delete order items');
        }
        
        // Then delete the order
        $deleteOrderStmt = $db->prepare("DELETE FROM orders WHERE id = ?");
        if (!$deleteOrderStmt->execute([$orderId])) {
            throw new Exception('Failed to delete order');
        }
        
        $db->commit();
        
        die(json_encode([
            "status" => "success",
            "message" => "Order deleted successfully"
        ]));
        
    } catch (Exception $e) {
        if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        die(json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]));
    }
}

// Update order status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    header('Content-Type: application/json'); // Ensure JSON header is set
    
    try {
        $putData = file_get_contents('php://input');
        if (empty($putData)) {
            throw new Exception('No data received');
        }

        $data = json_decode($putData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON data received');
        }

        if (!isset($data['id']) || !isset($data['status'])) {
            throw new Exception('Order ID and status are required');
        }

        $orderId = filter_var($data['id'], FILTER_VALIDATE_INT);
        if ($orderId === false) {
            throw new Exception('Invalid Order ID');
        }

        $allowedStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!in_array($data['status'], $allowedStatuses)) {
            throw new Exception('Invalid status value');
        }

        $database = new Database();
        $db = $database->getConnection();
        
        $updateStmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        if (!$updateStmt->execute([$data['status'], $orderId])) {
            throw new Exception('Failed to update order status');
        }

        die(json_encode([
            "status" => "success",
            "message" => "Order status updated successfully"
        ]));
        
    } catch (Exception $e) {
        error_log('Update Error: ' . $e->getMessage());
        http_response_code(500);
        die(json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]));
    }
}



try {
    $rawInput = file_get_contents('php://input');
    error_log("Received input: " . $rawInput); // Log input untuk debug
    
    if (empty($rawInput)) {
        throw new Exception("No input data received");
    }

    $data = json_decode($rawInput, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Invalid JSON: " . json_last_error_msg());
    }

    // Validasi data
    if (!isset($data['items']) || !is_array($data['items']) || empty($data['items'])) {
        throw new Exception("Invalid items data");
    }

    if (!isset($data['totalAmount'])) {
        throw new Exception("Total amount is required");
    }

    // Inisialisasi database
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Failed to connect to database");
    }
    
    $db->beginTransaction();
    
    try {
        // Insert order
        $stmt = $db->prepare("INSERT INTO orders (total_amount, delivery_fee, status) VALUES (?, ?, ?)");
        $success = $stmt->execute([
            $data['totalAmount'],
            isset($data['deliveryFee']) ? $data['deliveryFee'] : 0,
            'pending'
        ]);
        
        if (!$success) {
            throw new Exception("Failed to create order");
        }
        
        $orderId = $db->lastInsertId();
        
        // Insert order items
        $stmt = $db->prepare("INSERT INTO order_items (order_id, item_id, title, quantity, price) 
                     VALUES (?, ?, ?, ?, ?)");

        foreach ($data['items'] as $item) {
            if (!isset($item['id']) || !isset($item['quantity']) || !isset($item['price']) || !isset($item['title'])) {
                throw new Exception("Invalid item data structure");
            }

            $success = $stmt->execute([
                $orderId,
                $item['id'],
                $item['title'],
                $item['quantity'],
                $item['price']
            ]);
            
            if (!$success) {
                throw new Exception("Failed to insert order item");
            }
        }
        
        $db->commit();
        
        echo json_encode([
            "status" => "success",
            "message" => "Order created successfully",
            "data" => [
                "order_id" => $orderId,
                "total_amount" => $data['totalAmount'],
                "items_count" => count($data['items'])
            ]
        ]);
        
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("Order Controller Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}