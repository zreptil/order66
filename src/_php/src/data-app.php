<?php
function saveAppData()
{
  global $userDb, $raw;
  if (isset($raw['data'])) {
    $query = $userDb->prepare('update app set data=:data where id=0');
    $query->bindValue(':data', $raw['data'], SQLITE3_TEXT);
    $result = $query->execute();
    if ($userDb->changes() == 0) {
      $query = $userDb->prepare('insert into app (id, data) values (:id,:data)');
      $query->bindValue(':id', $raw['id'], SQLITE3_TEXT);
      $query->bindValue(':data', $raw['data'], SQLITE3_TEXT);
      $result = $query->execute();
      if ($result) {
        $code = 201;
      } else {
        $code = 500;
      }
    }
  }
}

function loadAppData($id)
{
  global $userDb;
  $query = $userDb->prepare('select * from app where id=:id');
  $query->bindValue(':id', $id, SQLITE3_INTEGER);
  $result = $query->execute();
  if (!($data = $result->fetchArray(SQLITE3_ASSOC))) {
    $data = new stdClass();
  }
  return json_encode($data);
}
