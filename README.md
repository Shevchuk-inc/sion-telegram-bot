# Cloudflare Telegram Bot

Telegram bot with Cloudflare API integration for domain and DNS management, plus React admin panel.

## Features

- **Domain Management**: Register domains on Cloudflare via Telegram commands
- **DNS Management**: Create, update, delete DNS records
- **Access Control**: Bot works only in specified chat (via ALLOWED_CHAT_ID)
- **Webhook Notifications**: Express server receives requests and notifies chat
- **Admin Panel**: React app for managing allowed users

## Project Structure

```
├── backend/        # Express + Telegram Bot + API
├── frontend/       # React Admin Panel (MUI)
├── .env.example    # Environment variables template
└── README.md
```

## Setup

1. Copy `.env.example` to `.env` and fill in your values
2. Install dependencies (see backend/frontend READMEs)
3. Start MongoDB
4. Run the application

## Environment Variables

See `.env.example` for required configuration.
