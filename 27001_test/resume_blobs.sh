#!/bin/bash
# This script creates .docx files with random content and sets their modification times 
# to a random date within the past six months.

# Configuration variables
TARGET_DIR="docx_files"        # Directory where the files will be created
NUM_FILES=10                   # Number of files to create (adjust as needed)
SIX_MONTHS=15552000            # Approximate number of seconds in six months
MIN_SIZE=40960                 # Minimum file size in bytes
MAX_SIZE=163840                # Maximum file size in bytes

# Fixed dummy file names for testing
DUMMY_NAMES=("Louis Choi - resume.pdf" "Simon Wang CV.pdf" "Mark Lee.pdf" "Charlie Chan - Software Engineer.pdf" "Alice Wong - CV.pdf" "Bob Tan - Resume.pdf")

# Create the target directory if it does not exist
mkdir -p "$TARGET_DIR"

# Current time in seconds since epoch
NOW=$(date +%s)

for FILENAME in "${DUMMY_NAMES[@]}"; do
  FILE_PATH="$TARGET_DIR/$FILENAME"
  
  # Generate a random file size between MIN_SIZE and MAX_SIZE
  FILE_SIZE=$(shuf -i $MIN_SIZE-$MAX_SIZE -n 1)

  # Create a file with random bytes from /dev/urandom of the random size
  dd if=/dev/urandom of="$FILE_PATH" bs=1 count=$FILE_SIZE status=none
  
  # Generate a random offset (in seconds) within the past six months
  OFFSET=$(shuf -i 0-$SIX_MONTHS -n 1)
  
  # Calculate the new modification timestamp
  NEW_TS=$(( NOW - OFFSET ))
  
  # Format the timestamp for touch, format required: YYYYMMDDHHMM (e.g., 202411151530)
  TOUCH_DATE=$(date -d @$NEW_TS +%Y%m%d%H%M)
  
  # Reset the file's modification time
  touch -t $TOUCH_DATE "$FILE_PATH"
  
  echo "Created $FILE_PATH of size ${FILE_SIZE} bytes with modification time set to $TOUCH_DATE"
done
```#!/bin/bash
# This script creates .docx files with random content and sets their modification times 
# to a random date within the past six months.

# Configuration variables
TARGET_DIR="docx_files"        # Directory where the files will be created
NUM_FILES=10                   # Number of files to create (adjust as needed)
SIX_MONTHS=15552000            # Approximate number of seconds in six months
MIN_SIZE=40960                 # Minimum file size in bytes
MAX_SIZE=163840                # Maximum file size in bytes

# Fixed dummy file names for testing
DUMMY_NAMES=("dummy1.docx" "dummy2.docx" "dummy3.docx" "dummy4.docx" "dummy5.docx" "dummy6.docx" "dummy7.docx" "dummy8.docx" "dummy9.docx" "dummy10.docx")

# Create the target directory if it does not exist
mkdir -p "$TARGET_DIR"

# Current time in seconds since epoch
NOW=$(date +%s)

for FILENAME in "${DUMMY_NAMES[@]}"; do
  FILE_PATH="$TARGET_DIR/$FILENAME"
  
  # Generate a random file size between MIN_SIZE and MAX_SIZE
  FILE_SIZE=$(shuf -i $MIN_SIZE-$MAX_SIZE -n 1)

  # Create a file with random bytes from /dev/urandom of the random size
  dd if=/dev/urandom of="$FILE_PATH" bs=1 count=$FILE_SIZE status=none
  
  # Generate a random offset (in seconds) within the past six months
  OFFSET=$(shuf -i 0-$SIX_MONTHS -n 1)
  
  # Calculate the new modification timestamp
  NEW_TS=$(( NOW - OFFSET ))
  
  # Format the timestamp for touch, format required: YYYYMMDDHHMM (e.g., 202411151530)
  TOUCH_DATE=$(date -d @$NEW_TS +%Y%m%d%H%M)
  
  # Reset the file's modification time
  touch -t $TOUCH_DATE "$FILE_PATH"
  
  echo "Created $FILE_PATH of size ${FILE_SIZE} bytes with modification time set to $TOUCH_DATE"
done