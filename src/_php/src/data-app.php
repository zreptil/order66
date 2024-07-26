<?php
function saveAppData()
{
  global $userDb, $raw, $user, $code, $userFile;
  if (isset($raw['data'])) {
    $query = $userDb->prepare('update app set data=:data where id=:id');
    $query->bindValue(':id', $raw['id'], SQLITE3_INTEGER);
    $query->bindValue(':data', $raw['data'], SQLITE3_TEXT);
    $result = $query->execute();
    if ($userDb->changes() == 0) {
      $query = $userDb->prepare('insert into app (id, data) values (:id,:data)');
      $query->bindValue(':id', $raw['id'], SQLITE3_INTEGER);
      $query->bindValue(':data', $raw['data'], SQLITE3_TEXT);
      $result = $query->execute();
      if ($result) {
        $code = 201;
      } else {
        $code = 500;
      }
    }
    if (($code == 200 || $code == 201) && isset($raw['usertype']) && $user['type'] != $raw['usertype']) {
      // users must not change the admin-flag here
      if ($user['type'] & TYPE_ADMIN == TYPE_ADMIN) {
        $raw['usertype'] |= TYPE_ADMIN;
      } else {
        $raw['usertype'] &= (TYPE_ADMIN ^ 0xffff);
      }
      $db = new SQLite3($userFile, SQLITE3_OPEN_READWRITE);
      $query = $db->prepare('update users set type=:type where id=:id');
      $query->bindValue(':id', $user['id'], SQLITE3_INTEGER);
      $query->bindValue(':type', $raw['usertype'], SQLITE3_INTEGER);
      $result = $query->execute();
      $user['type'] = $raw['usertype'];
    }
  }
}

function loadSitterList() {
  global $userFile;
  $db = new SQLite3($userFile, SQLITE3_OPEN_READWRITE);
  $query = $db->prepare('select * from users where (type & :type) = :type');
  $query->bindValue(':type', TYPE_SITTER, SQLITE3_INTEGER);
  $result = $query->execute();
  $data = array();
  while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $userFilename = 'db/'.userId($row['id']) . '.sqlite';
    $userDb = new SQLite3($userFilename);
    if (isset($userDb)) {
      $appQuery = $userDb->prepare('select * from app where id=:id');
      $appQuery->bindValue(':id', 1, SQLITE3_INTEGER);
      $appResult = $appQuery->execute();
      if ($appData = $appResult->fetchArray(SQLITE3_ASSOC)) {
        $d = array();
        $d['d'] = $appData;
        $d['u'] = $row['id'];
        $data[] = $d;
      }
      $userDb->close();
    }
  }
  return json_encode($data);
}

function loadOwnerData() {
  global $userFile;
  $db = new SQLite3($userFile, SQLITE3_OPEN_READWRITE);
  $query = $db->prepare('select * from users where (type & :type) = :type');
  $query->bindValue(':type', TYPE_OWNER, SQLITE3_INTEGER);
  $result = $query->execute();
  $data = array();
  while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $userFilename = 'db/'.userId($row['id']) . '.sqlite';
    $userDb = new SQLite3($userFilename);
    if (isset($userDb)) {
      $appQuery = $userDb->prepare('select * from app where id=:id');
      $appQuery->bindValue(':id', 1, SQLITE3_INTEGER);
      $appResult = $appQuery->execute();
      if ($appData = $appResult->fetchArray(SQLITE3_ASSOC)) {
        $d = array();
        $d['d'] = $appData;
        $d['u'] = $row['id'];
        $data[] = $d;
      }
      $userDb->close();
    }
  }
  return json_encode($data);
}

function loadAppData($id)
{
  global $userDb, $user;
  $query = $userDb->prepare('select * from app where id=:id');
  $query->bindValue(':id', $id, SQLITE3_INTEGER);
  $result = $query->execute();
  if (!($data = $result->fetchArray(SQLITE3_ASSOC))) {
    $data = array('id' => $id);
  }
  $data['usertype'] = $user['type'];
  return json_encode($data);
}
