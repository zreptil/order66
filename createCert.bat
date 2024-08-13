set keyName=server.key
set certName=server.crt
openssl genrsa -out %keyName% 2048
openssl req -new -key %keyName% -out %keyName%.csr
openssl x509 -req -days 3650 -in %keyName%.csr -signkey %keyName% -out %certName%
del %keyName%.csr
