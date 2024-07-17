<?php
$userFile = 'users.sqlite';
$scriptCheck = 'larkngbpwo9jgp02g2';

// only allow access if $skipCheck is set or $scriptValid is the
// same value as $scriptCheck. $scriptValid is set only once
// in the php-files and config.php is included in every php-file
// so that this check will only be true, when the request ran
// through the file where $scriptValid is set
if (!isset($skipCheck)) {
  if (!isset($scriptValid) || $scriptCheck !== $scriptValid) {
    header('HTTP/1.0 403 Forbidden');
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'GET') {
      $msg = 'Access denied';
      include 'error.php';
    }
    exit;
  }
}
