#!/bin/sh
openssl ecparam -out localhost.key -name prime256v1 -genkey
sleep 1
openssl req -new -key localhost.key -out localhost.csr -config localhost.cnf
sleep 1
openssl x509 -req -days 3650 -in localhost.csr -signkey localhost.key -out localhost.crt -extfile localhost.cnf -extensions req_ext
