#!/bin/bash

# Replace with your Telegram Bot Token
BOT_TOKEN="YOUR_BOT_TOKEN"
#BOT_TOKEN="8007180003:AAHQAbqDOdzhy4JhvijZja8k-mLHzapyhtw"
LOG_FILE="telegram_api_history.log"
OFFSET=0

# Print bot info using getMe
echo "=== Bot Info (getMe) ==="
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe"
echo -e "\n========================\n"

echo "=== Webhook Info (getWebhookInfo) ==="
curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo"
echo -e "\n========================\n"

# Export all historical API usage (getUpdates)
while true; do
  RESPONSE=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${OFFSET}&limit=100")
  echo "$RESPONSE" | tee -a "$LOG_FILE"

  # Extract the highest update_id and increment by 1 for the next offset
  NEW_OFFSET=$(echo "$RESPONSE" | grep -o '"update_id":[0-9]*' | awk -F: '{print $2}' | sort -n | tail -1)
  if [[ -z "$NEW_OFFSET" ]] || [[ "$NEW_OFFSET" -eq "$OFFSET" ]]; then
    break
  fi
  OFFSET=$((NEW_OFFSET + 1))
done
