#!/bin/bash

cat index.xml | grep -oP '(?<=<Key>).*?(?=</Key>)' > file_list.txt

BUCKET_URL="https://app.sleekflow.io.s3.amazonaws.com"

# Fetch the bucket listing
# curl -s "$BUCKET_URL" | grep -oP '(?<=<Key>).*?(?=</Key>)' > file_list.txt

# Download each file
while IFS= read -r file; do
  URL="$BUCKET_URL/$file"
  echo "Downloading $URL"
  
  # Create the directory structure for the file
  mkdir -p "$(dirname "$file")"
  
  # Save the file in the same relative path as the URL
  curl -k -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0" -o "$file" "$URL"
done < file_list.txt