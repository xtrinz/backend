
    1. CA key
       openssl genrsa -out ca.pem 2048
    2. CA CSR
       openssl req -new -key ca.pem -subj '/CN=LOCAL-CA' -out ca.csr
    3. CA cert
       openssl x509 -req -in ca.csr -signkey ca.pem -out ca.crt

    1. Server key
       openssl genrsa -out server.key 2048
    2. Server CSR
       openssl req -new -key server.key -subj '/CN=TRANSIT-ENGINE' -out server.csr
    3. Server cert
       openssl x509 -req -in server.csr -CAcreateserial -CA ca.crt -CAkey ca.pem -out server.crt
