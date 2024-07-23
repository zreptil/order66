<?php
define('TYPE_ADMIN', 1 << 0);
define('TYPE_SITTER', 1 << 1);
define('TYPE_OWNER', 1 << 2);
$skipCheck = true;
require_once 'config.php';
unset($skipCheck);
// legalize all calls to config.php from this point on
$scriptValid = $scriptCheck;
$maxUsers = 10;

if (!file_exists($userFile)) {
  include('setupUsers.php');
}

$db = new SQLite3($userFile, SQLITE3_OPEN_READONLY);
// fetch remaining users for registration-limit
$query = 'select count(*) as cnt from users';
$result = $db->query($query);
$row = $result->fetchArray(SQLITE3_ASSOC);
$remainingUsers = $maxUsers - $row['cnt'];
$db->close();

function forBackend($src)
{
  return $src;
//  return base64_encode($src);
}

function forSQL($value, $isText = false)
{
  if ($value) {
    $value = str_replace("'", "\\'", $value);
    $value = str_replace("\n", "\\n", $value);
  }
  if ($isText) {
    $value = "'" . $value . "'";
  }
  return $value;
}

function createToken()
{
  $ret = bin2hex(random_bytes(16));
  $time = microtime(true) * 10000;
  return substr($ret, 0, 16) . $time . substr($ret, 16);
}

function userId($id)
{
  return str_pad($id, 5, '0', STR_PAD_LEFT);
}

function may($check)
{
  global $user;
  $perm = ',' . $user['permissions'] . ',';
  $check = ',' . $check . ',';
  return $perm == ',all,' || strpos($perm, $check) !== false;
}

$body = file_get_contents('php://input');
$raw = json_decode($body, TRUE);
$cmd = isset($raw['cmd']) ? $raw['cmd'] : 'load';
$data = isset($raw['data']) ? $raw['data'] : 'none';

unset($user);
// if HTTP_AUTHORIZATION is given, try to find the user with the
// given token in the user table
// $_SERVER['HTTP_AUTHORIZATION'] = 'auth|admin|6086deca1e564458406f23b3eff9e7c12b3e08094cb6443356aa0dbcf097e36c';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
  $db = new SQLite3($userFile, SQLITE3_OPEN_READWRITE);
  $token = $_SERVER['HTTP_AUTHORIZATION'];
  $isLogin = false;
  $isRegister = false;
  if (substr($token, 0, 5) == 'auth|') {
    // if HTTP_AUTHORIZATION starts with auth| then the following two parts should be username and password-hash
    $parts = explode('|', $token);
    if (count($parts) == 3) {
      // look for user with the given credentials
      $query = 'select * from users where username=' . forSQL($parts[1], true)
        . ' and pwd=' . forSQL($parts[2], true);
      $isLogin = true;
    }
  } else if (substr($token, 0, 9) == 'register|') {
    // if HTTP_AUTHORIZATION starts with register| then the following two parts should be username, password-hash and usertype
    $parts = explode('|', $token);
    if (count($parts) == 4) {
      // check if username already exists
      $query = 'select username from users where username=' . forSQL($parts[1], true);
      $result = $db->query($query);
      if ($result && $user = $result->fetchArray(SQLITE3_ASSOC)) {
        // if the username already exists, throw error 409
        header('HTTP/1.0 409 User already exists!');
        exit;
      }
      // if user doesn't exist, create a token for immediate login
      $token = createToken();
      $query = $db->prepare('insert into users (username,pwd,token,type) values(:u,:p,:to,:ty)');
      $query->bindValue(':u', $parts[1], SQLITE3_TEXT);
      $query->bindValue(':p', $parts[2], SQLITE3_TEXT);
      $query->bindValue(':to', $token, SQLITE3_TEXT);
      $query->bindValue(':ty', $parts[3], SQLITE3_INTEGER);
      $result = $query->execute();
      $isLogin = true;
      $isRegister = true;
      // look for user with the given credentials
      $query = 'select * from users where username=' . forSQL($parts[1], true)
        . ' and pwd=' . forSQL($parts[2], true);
    }
  } else {
    $query = 'select * from users where token=' . forSQL($token, true);
  }
  if (isset($query)) {
    $result = $db->query($query);
    if ($result && $user = $result->fetchArray(SQLITE3_ASSOC)) {
      // if it is not a login, then remove token from user
      if (!$isLogin) {
        unset($user['token']);
      }
      unset($user['pwd']);
      $userFilename = 'db/'.userId($user['id']) . '.sqlite';
      include('setupSingleUser.php');
      if ($isRegister && isset($userDb)) {
        // write registration information to db
        $query = $userDb->prepare('insert into app (data) values(:data)');
        $query->bindValue(':data', $data, SQLITE3_TEXT);
        $result = $query->execute();
      }
      if ($isLogin && isset($userDb)) {
        if (!isset($user['token'])) {
          $user['token'] = createToken();
          $query = $db->prepare('update users set token=:token where id=:id');
          $query->bindValue(':token', $user['token'], SQLITE3_TEXT);
          $query->bindValue(':id', $user['id'], SQLITE3_INTEGER);
          $result = $query->execute();
        }
        header('HTTP/1.0 200 OK');
        unset($user['id']);
        unset($user['username']);
        if ($isRegister) {
          echo('{"u":' . json_encode($user) . ',"d":' . json_encode($data) . '}');
        } else {
          echo('{"u":' . json_encode($user) . '}');
        }
        exit;
      }
    }
  }
  $db->close();
}

if (!isset($userDb)) {
  if ($cmd == 'loadAppData') {
    echo('{"r":' . $remainingUsers . '}');
  }
  header('HTTP/1.0 403 Forbidden');
  exit;
}
