<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>
    body {
      width: 100vw;
      height: 100vh;
      margin:0;
      padding:0;
      display:flex;
      flex-flow:column;
      align-items:center;
      justify-content:center;
      font-size:2em;
      font-family: Roboto,Tahoma,Verdana,serif;
      background-color: #802020;
      color: white;
    }
  </style>
</head>
<body>
 <?=$msg ?? 'Error'?>
</body>
</html>
