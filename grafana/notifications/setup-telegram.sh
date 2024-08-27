#!/bin/bash

# Wait for Grafana to start
sleep 10

# Set up the Telegram notification channel using Grafana API
curl -X POST http://admin:admin@localhost:3005/api/alert-notifications \
-H "Content-Type: application/json" \
-d '{
      "name": "Telegram",
      "type": "telegram",
      "settings": {
        "botToken": "'"${TELEGRAM_BOT_TOKEN}"'",
        "chatId": "'"${TELEGRAM_CHAT_ID}"'",
        "parseMode": "HTML"
      },
      "isDefault": true
    }'
