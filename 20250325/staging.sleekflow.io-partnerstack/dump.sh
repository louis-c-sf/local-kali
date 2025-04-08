#!/bin/bash
curl --request GET \
     --url 'https://api.partnerstack.com/api/v2/customers?limit=250' \
     --header 'accept: application/json' \
     --header 'authorization: Basic cGtfYnZFd3VDRHZvejlRaDExeTQ4MDA2eldYZENnc3ZJbms6c2tfS25abGxoQUpPYXNQMDlDUHNNT09vaVVxS0FPODFuTXk=' > staging_leak.json
