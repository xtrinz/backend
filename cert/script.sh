openssl genrsa -out ca.pem 2048
openssl req -new -key ca.pem -subj '/CN=LOCAL-CA' -out ca.csr
openssl x509 -req -in ca.csr -days 365 -signkey ca.pem -out ca.crt
openssl genrsa -out server.key 2048
openssl req -new -key server.key -subj '/CN=localhost' -out server.csr
openssl x509 -req -in server.csr -days 365 -CAcreateserial -CA ca.crt -CAkey ca.pem -out server.crt
