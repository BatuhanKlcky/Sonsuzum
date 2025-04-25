<?php
$log = date('Y-m-d H:i:s') . " - IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
file_put_contents('giris.log', $log, FILE_APPEND);
?>
