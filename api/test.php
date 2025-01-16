<?php
// api/test_cart.php

// Set CORS headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log incoming request
error_log('Received request to test_cart.php');

try {
    // Get raw POST data
    $rawData = file_get_contents("php://input");
    error_log("Received raw data: " . $rawData);

    // Attempt to decode JSON
    $data = json_decode($rawData);
    
    // Check for JSON decode errors
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON decode error: " . json_last_error_msg());
    }

    // Validate required fields
    if (!isset($data->totalAmount)) {
        throw new Exception("Missing totalAmount");
    }
    if (!isset($data->items) || !is_array($data->items)) {
        throw new Exception("Missing or invalid items array");
    }
    if (!isset($data->deliveryFee)) {
        throw new Exception("Missing deliveryFee");
    }

    // If we get here, JSON is valid and has required fields
    echo json_encode([
        "status" => "success",
        "message" => "Cart data is valid",
        "received_data" => [
            "totalAmount" => $data->totalAmount,
            "deliveryFee" => $data->deliveryFee,
            "itemCount" => count($data->items),
            "items" => $data->items
        ]
    ]);

} catch (Exception $e) {
    error_log("Validation error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

