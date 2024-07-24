<?php
//require_once __DIR__ . '/vendor/autoload.php';
//require_once __DIR__ . '/PHPGangsta/GoogleAuthenticator.php';

// at first make sure, that the brainless CORS-mechanism will not prevent
// this webservice from being accessed
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
  $ret = loadAppData($raw['id']);
  $ret = substr($ret,0,strlen($ret)-1)
  .',"perm":"'. $user['permissions'] .'"'
  .',"type":'.($user['type'] ?? 0)
  .',"ru":'.$remainingUsers
  .'}';
  header('Content-Type: application/json');
  echo($ret);
  exit;
} else if ($cmd == 'saveAppData') {
  include_once 'data-app.php';
  saveAppData();
  $ret = loadAppData($raw['id']);
  header('Content-Type: application/json');
  echo($ret);
  exit;
} else if ($cmd == 'loadSitterList') {
  include_once 'data-app.php';
  $ret = loadSitterList();
  header('Content-Type: application/json');
  echo($ret);
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

/*
function handleError()
{
  global $scriptname;

  echo($scriptname);
}

function processOPTIONS() {
}

function checkPermission() {
  global $code,$headers,$user,$cmd;

  if($_SERVER['REQUEST_METHOD']=='OPTIONS')
    return true;

  if(in_array($_SERVER['REQUEST_METHOD'], $user['permissions']))
    return true;

  if(in_array('ADMIN', $user['permissions']))
    return true;

  if($_SERVER['REQUEST_METHOD'] == 'POST')
  {
    switch ($cmd)
    {
      case 'register':
      case 'tfacheck':
      case 'login':
        return true;
    }
  }

  $code = 401;
  header('Content-Type: application/json');
  $response = array('error' => 'access not allowed for '.$user['fullname']);
  echo(json_encode($response));
  return false;
}

$body = file_get_contents('php://input');
$raw = json_decode($body, TRUE);
$cmd = $raw['cmd'];
$data = $raw['data'];
$code = 200;

$func = 'process'.$_SERVER['REQUEST_METHOD'];
if(!function_exists($func)) {
  header('Error: unknown method '.$_SERVER['REQUEST_METHOD']);
  echo('this type of request is not supported');
  $code = 405;
} else {
  if(checkPermission()) {
    call_user_func('process'.$_SERVER['REQUEST_METHOD']);
  }
}

http_response_code($code);
die();
*/
