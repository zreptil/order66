# Order66

This project will run on an SSL-Server. To call it locally with https, you have to generate certificates to make it work. These commands must be executed in the basedirectory:

___openssl genrsa -out server.key 2048___

___openssl req -new -key server.key -out server.csr___

___openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt___
