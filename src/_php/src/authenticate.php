<?php
$skipCheck = true;
require_once 'config.php';
unset($skipCheck);
// legalize all calls to config.php from this point on
$scriptValid = $scriptCheck;
$maxUsers = 10;

if (!file_exists($userFile)) {
  include('setupUsers.php');
}

/*
function saveUser($data)
{
  global $code,$userkey;

  $conn = connect();
  if($data['id'] == $userkey)
  {
    $query = "update users set ";
    $query .= "username='".forSQL($data['username'])."'";
    $query .= ",fullname='".forSQL($data['fullname'])."'";
    $query .= ",pwd='".forSQL($data['pwd'])."'";
    $query .= ",tfacode='".forSQL($data['tfacode'])."'";
    $query .= ",permissions='".json_encode($data['permissions'])."'";
    $query .= " where id='".forSQL($data['id'])."'";
    if($conn->query($query) !== TRUE)
    {
      $code = 400;
      header('Content-Type: application/json');
      $response = array('error' => $conn->error);
      echo(json_encode($response));
    }
  } else {
    $query = 'insert into users(id,isauthorized,username,fullname,pwd,tfacode,permissions)values(';
    $query .= "'".forSQL($data['id'])."'";
    $query .= ",0";
    $query .= ",'".forSQL($data['username'])."'";
    $query .= ",'".forSQL($data['fullname'])."'";
    $query .= ",'".forSQL($data['pwd'])."'";
    $query .= ",'".forSQL($data['tfacode'])."'";
    $query .= ",'".json_encode($data['permissions'])."'";
    $query .= ')';
    if($conn->query($query) !== TRUE)
    {
      $code = 400;
      header('Content-Type: application/json');
      $response = array('error' => $conn->error);
      echo(json_encode($response));
    }
  }
  $conn->close();
}

// Den user als objekt zurueckgeben
function userinfo($user)
{
  $user['may'] = array();
  if(in_array('GET',$user['permissions']))
    $user['may']['read'] = true;
  if(in_array('POST',$user['permissions']))
    $user['may']['add'] = true;
  if(in_array('PUT',$user['permissions']))
    $user['may']['edit'] = true;
  if(in_array('DELETE',$user['permissions']))
    $user['may']['delete'] = true;
  if(in_array('EDITOR',$user['permissions']))
    $user['may']['editor'] = true;
  if(in_array('DEBUG',$user['permissions']))
    $user['may']['debug'] = true;
  if(in_array('ADMIN',$user['permissions']))
    $user['may']['admin'] = true;
  unset($user['permissions']);
  unset($user['pwd']);
  unset($user['tfacode']);
  $user['isAuthorized'] = $user['isauthorized'] != 0;
  unset($user['isauthorized']);
  return $user;
}
*/

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
    // if HTTP_AUTHORIZATION starts with register| then the following two parts should be username and password-hash
    $parts = explode('|', $token);
    if (count($parts) == 3) {
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
      $query = 'insert into users (username, pwd, token) values ('
        . forSQL($parts[1], true) . ', '
        . forSQL($parts[2], true) . ', '
        . forSQL($token, true) . ')';
      $result = $db->query($query);
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
      $userFilename = userId($user['id']) . '.sqlite';
      include('setupSingleUser.php');
      if ($isRegister && isset($userDb)) {
        $query = 'insert into person (data) values(' . forSQL($data, true) . ')';
        $result = $userDb->query($query);
      }
      if ($isLogin && isset($userDb)) {
        if (!isset($user['token'])) {
          $user['token'] = createToken();
          $query = 'update users set token=' . forSQL($user['token'], true) . ' where id=' . forSQL($user['id']);
          $result = $db->query($query);
        }
        header('HTTP/1.0 200 OK');
        unset($user['id']);
        unset($user['username']);
        if ($isRegister) {
          echo('{"u":' . json_encode($user) . ',"p":"' . $data . '"}');
        } else {
          echo('{"u":' . json_encode($user) . '}');
        }
        exit;
      }
    }
  }
  $db->close();
//  if ($result && $row = $result->fetch_assoc()) {
//    $user = row2user($row);
//  }
//  $result->close();
}

if (!isset($userDb)) {
  if ($cmd == 'loadPerson') {
    $db = new SQLite3($userFile, SQLITE3_OPEN_READONLY);
    $query = 'select count(*) as cnt from users';
    $result = $db->query($query);
    $row = $result->fetchArray(SQLITE3_ASSOC);
    echo('{"r":' . ($maxUsers - $row['cnt']) . '}');
    $db->close();
  }
  header('HTTP/1.0 403 Forbidden');
  exit;
}
//if (!isset($user)) {
//  if ($result && $row = $result->fetch_assoc()) {
//    $user = row2user($row);
//    if ($row['isauthorized'] != 0) {
//      $query = "delete from users where id<>'' && isauthorized=0";
//      $result = $conn->query($query);
//    }
//  } else {
//    $defNames = ['Karl Napf', 'Hurwanek Krustinak', 'John Doe', 'Max Mustermann',
//      'Vrranz', 'Häuptling kranker Storch', 'Alfons Qumstdanetrein',
//      'Susi Sorglos', 'Tamara Tüpfel', 'Katharina die Nichtsokleine',
//      'Alex Gross', 'Arnold Einstein', 'Karola Kornfeld'
//    ];
//    $user = array('id' => '',
//      'isauthorized' => false,
//      'username' => '',
//      'fullname' => $defNames[rand(0, count($defNames) - 1)],
//      'permissions' => array('GET', 'EDITOR')
//    );
//  }
//}
