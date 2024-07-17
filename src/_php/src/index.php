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

$body = file_get_contents('php://input');
$raw = json_decode($body, TRUE);
$cmd = isset($raw['cmd']) ? $raw['cmd'] : 'load';
$data = isset($raw['data']) ? $raw['data'] : 'none';
$code = 200;

if ($cmd == 'loadPerson') {
  $ret = '{'
    . '"person":' . loadPerson()
    . ',"textblocks":' . loadTextblocks()
    . ',"plans":' . loadPlans()
    . '}';
  header('Content-Type: application/json');
  echo($ret);
  http_response_code($code);
  die();
}

function loadPerson()
{
  global $userDb;
  $result = $userDb->query('select * from person');
  if (!($data = $result->fetchArray(SQLITE3_ASSOC))) {
    $data = new stdClass();
  }
  return json_encode($data);
}

function loadTextblocks()
{
  global $userDb;
  $result = $userDb->query('select * from textblock');
  $data = array();
  while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row;
  }
  return json_encode($data);
}

function loadPlans()
{
  global $userDb;
  $result = $userDb->query('select id,start,end from plan');
  $data = array();
  while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $data[] = $row;
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
