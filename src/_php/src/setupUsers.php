<?php
include 'config.php';

$hasFile = file_exists($userFile);
try {
  // connect to SQLite3-database (and create file if not existing)
  $db = new SQLite3($userFile);
  // check, if connection was successful
  if (!$db) {
    throw new Exception('error when connection to database: ' . $db->lastErrorMsg());
  }
  if (!$hasFile) {
    // create table
    $query = '
        create table if not exists users (
            id integer primary key autoincrement,
            username text not null unique,
            fullname text,
            token text,
            pwd text not null,
            permissions text
        )';
    $result = $db->exec($query);
    if (!$result) {
      throw new Exception('error when creating table: ' . $db->lastErrorMsg());
    }
    // insert data
    $query = "
        insert into users (username, fullname, pwd, token, permissions)
        values ('admin', 'Jan Itor', '6086deca1e564458406f23b3eff9e7c12b3e08094cb6443356aa0dbcf097e36c', 'dasisteintest', '')
    ";
    $result = $db->exec($query);
  }
} catch (Exception $e) {
  header('HTTP/1.1 500 Internal Server Error');
  echo 'error: ' . $e->getMessage();
}
$db->close();
