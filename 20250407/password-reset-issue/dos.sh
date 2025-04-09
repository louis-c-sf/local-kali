#!/bin/bash
# email="louis.c+sf00_v1staging@sleekflow.io"
for index in {1..50}; do 
email="louis.c+invalid-$index@sleekflow.io"
    curl -i -s -k -X $'POST' \
        -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0' \
        -H 'Accept: application/json, text/plain, */*'\
        -H 'Content-Type: application/json' \
        --data-binary $'{\"email\":\"'$email'"}' \
        --proxy "127.0.0.1:8080" \
        "https://api-staging.sleekflow.io/auth0/account/RequestPasswordReset?i=$index" >> dos_response.log &
done