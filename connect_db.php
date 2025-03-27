<?php
$serverName = "HEROSQL1";
$connectionOptions = array(
    "Database" => "Test",
    "Uid" => "vmuser",
    "PWD" => "[hero123]"
);

// Connect to SQL Server
$conn = sqlsrv_connect($serverName, $connectionOptions);

if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}

// Example query
$sql = "SELECT * FROM users";
$stmt = sqlsrv_query($conn, $sql);

if ($stmt === false) {
    die(print_r(sqlsrv_errors(), true));
}

while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
    print_r($row);
}

sqlsrv_close($conn);
?>
