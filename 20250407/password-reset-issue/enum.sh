#!/bin/bash

EMAILS="louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io
invalid@sleekflow.io
louis.c+sf00_staging-revamp@sleekflow.io
louis.c+sf00_v1staging@sleekflow.io"

#EMAILS="louis.c+sf00_staging-revamp@sleekflow.io
#invalid@sleekflow.io"

for email in $EMAILS; do
    # echo "Testing email: $email"
    RES=$(curl -i -s -k -X $'POST' \
        -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0' \
        -H 'Accept: application/json, text/plain, */*'\
        -H 'Content-Type: application/json' \
        --data-binary $'{\"email\":\"'$email'"}' \
        $'https://api-staging.sleekflow.io/auth0/account/RequestPasswordReset' \
        -w ' HTTP_CODE:%{http_code}' | grep -oP '({.*})|HTTP_CODE:\d{3}' )
    RESULT="$email|$RES"
# ...existing code...
    RESULT="$email|$RES"
    echo $RESULT
    echo $RESULT >> response.log
done


cat response.log | grep "We've just sent you an email to reset your password."| cut -d '|' -f 1 | sort | uniq >> valid.log