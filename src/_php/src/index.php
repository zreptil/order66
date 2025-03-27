<?php
// at first make sure, that the brainless CORS-mechanism will not prevent
// this webservice from being accessed
global $cmd, $user, $remainingUsers;
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, GET, DELETE, POST, OPTIONS');
header('Access-Control-Allow-Headers: *');
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  exit(0);
}

include 'authenticate.php';

$code = 200;
if ($cmd == 'loadAppData') {
  include_once 'data-app.php';
  if (isset($raw['userid'])) {
    $userFilename = 'db/' . userId($raw['userid']) . '.sqlite';
    $userDb = new SQLite3($userFilename);
  }
  $ret = loadAppData($raw['id']);
  $ret = substr($ret, 0, strlen($ret) - 1)
    . ',"perm":"' . $user['permissions'] . '"'
    . ',"type":' . ($user['type'] ?? 0)
    . ',"ru":' . $remainingUsers
    . '}';
  header('Content-Type: application/json');
  echo($ret);
  exit;
} else if ($cmd == 'saveAppData') {
  include_once 'data-app.php';
  if (isset($raw['userid'])) {
    $userFilename = 'db/' . userId($raw['userid']) . '.sqlite';
    $userDb = new SQLite3($userFilename);
  }
  saveAppData();
  $ret = loadAppData($raw['id']);
  header('Content-Type: application/json');
  echo($ret);
  exit;
} else if ($cmd == 'loadPersonList') {
  include_once 'data-app.php';
  $ret = loadPersonList();
  header('Content-Type: application/json');
  echo($ret);
  exit;
} else if ($cmd == 'loadOwnerData') {
  include_once 'data-app.php';
  $ret = array();
  $ret['data'] = loadOwnerData();
  $ret['ui'] = $user['id'];
  header('Content-Type: application/json');
  echo(json_encode($ret));
  exit;
} else if ($cmd == 'loadUserList') {
  echo(loadUserList());
  exit;
} else if ($cmd == 'saveUser') {
  saveUser();
  exit;
} else if ($cmd == 'deleteUser') {
  deleteUser();
  exit;
} else if ($cmd == 'changePwd') {
  changePwd();
  exit;
}

function mapRow($src, $map)
{
  $data = array();
  while ($row = $src->fetchArray(SQLITE3_ASSOC)) {
    $data[] = array_combine(
      array_map(function ($key) use ($map) {
        return $map[$key];
      }, array_keys($row)),
      array_values($row)
    );
  }
  return json_encode($data);
}
