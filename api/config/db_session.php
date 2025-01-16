<?php
// api/config/db_session.php

session_start();

function openDatabaseConnection() {
    try {
        $host = "localhost";
        $dbname = "food_ordering";
        $username = "root";
        $password = "";

        $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        if (!isset($_SESSION['db_connection'])) {
            $_SESSION['db_connection'] = new PDO($dsn, $username, $password, $options);
        }

        return $_SESSION['db_connection'];
    } catch (PDOException $e) {
        error_log("Connection failed: " . $e->getMessage());
        return null;
    }
}

function closeDatabaseConnection() {
    if (isset($_SESSION['db_connection'])) {
        $_SESSION['db_connection'] = null;
        unset($_SESSION['db_connection']);
    }
}