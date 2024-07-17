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
        person (data text)';
      $result = $userDb->exec($query);
      if (!$result) {
        throw new Exception('error when creating table person: ' . $userDb->lastErrorMsg());
      }
      $query = 'create table if not exists 
        plan (
          id integer primary key autoincrement,
          start integer,
          end integer,
          data text
        )';
      $result = $userDb->exec($query);
      if (!$result) {
        throw new Exception('error when creating table plan: ' . $userDb->lastErrorMsg());
      }
      $query = 'create table if not exists 
        textblock (
          id integer primary key autoincrement,
          type integer,
          text text
        )';
      $result = $userDb->exec($query);
      if (!$result) {
        throw new Exception('error when creating table plan: ' . $userDb->lastErrorMsg());
      }
      $query = 'insert into plan (start, end) values ('
        . forSql(20240711) . ',' . forSql(20240721) . ');'
        . 'insert into plan (start, end) values ('
        . forSql(20240808) . ',' . forSql(20240816) . ');';
      $result = $userDb->exec($query);
      $query = 'insert into textblock (type, text) values ('
        . forSql(0) . ','
        . forSql('Boots, Emma, Tyson und Marley bekommen zusammen eine ganze 400g Dose in ihren Schüsseln', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(0) . ','
        . forSql('Für Ohneschwanz eine Aluschale vor die Eingangstüre stellen. Und wenn Felix da ist, eine Schale im Carport neben dem Igel-Holzhaus platzieren. Bitte die Schalen beim Gehen in den Restmüll schmeissen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(1) . ','
        . forSql('Graue Restmülltonne rausstellen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(1) . ','
        . forSql('Graue Restmülltonne reinstellen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(0) . ','
        . forSql('Eier aus dem Stall rein holen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(0) . ','
        . forSql('Bei den Hühnern im Aussengehege das Wasser auffüllen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(0) . ','
        . forSql('Bei den Hühnern im Aussengehege das Wasser auffüllen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(1) . ','
        . forSql('Braune Biotonne rausstellen.', true) . ');'
        . 'insert into textblock (type, text) values ('
        . forSql(1) . ','
        . forSql('Braune Biotonne reinstellen.', true) . ');';
      $result = $userDb->exec($query);
    }
  } catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo 'error: ' . $e->getMessage();
  }
}
