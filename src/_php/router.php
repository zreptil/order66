<?php
if (preg_match('/\.sqlite$/', $_SERVER["REQUEST_URI"])) {
  header("HTTP/1.0 404 Not Found");
  echo 'Not Found';
  exit;
}

function handleError($statusCode) {
  switch ($statusCode) {
    case 403:
    case 404:
      header('HTTP/1.1 403 Forbidden');
      $msg = 'Access denied';
      include 'src/error.php';
      break;
    default:
      header('HTTP/1.1 500 Internal Server Error');
      $msg = '500';
      include 'src/error.php';
      break;
  }
  exit;
}

$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

$path = str_replace(dirname($scriptName), '', $requestUri);
$path = trim($path, '/');

switch ($path) {
  case 'forbidden':
    handleError(403);
    break;
  case 'not-found':
    handleError(404);
    break;
  case 'server-error':
    handleError(500);
    break;
}

return false; // Serve the requested resource as-is.
