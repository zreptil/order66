<?php
include 'config.php';

if (isset($userFilename)) {
  $hasFile = file_exists($userFilename);
  try {
    // connect to SQLite3-database (and create file if not existing)
    $userDb = new SQLite3($userFilename);
    // check, if connection was successful
    if (!$userDb) {
      throw new Exception('error when connection to database: ' . $userDb->lastErrorMsg());
    }
    if (!$hasFile) {
      // create tables
      $query = 'create table if not exists
        app (
          id integer primary key autoincrement,
          data text
        )';
      $result = $userDb->exec($query);
      if (!$result) {
        throw new Exception('error when creating table app: ' . $userDb->lastErrorMsg());
      }
      if ($user['type'] == TYPE_ADMIN) {
        $query = $userDb->prepare('insert into app (data) values (:data);');
        $query->bindValue(':data', base64_encode('{"0":'.$user['id'].',"a":{"a":"Mega","b":"Star"}}'), SQLITE3_TEXT);
        $query->execute();
      }
    }
  } catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo 'error: ' . $e->getMessage();
  }
}
