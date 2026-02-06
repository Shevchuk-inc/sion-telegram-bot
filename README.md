# Cloudflare Telegram Bot

Telegram бот для управління доменами та DNS записами через Cloudflare API + React адмін панель.

## Можливості

- **Управління доменами**: Реєстрація доменів на Cloudflare через Telegram
- **Управління DNS**: Створення, оновлення, видалення DNS записів
- **Контроль доступу**: Бот працює тільки в вказаному чаті + перевірка користувачів
- **Webhook сповіщення**: Express сервер приймає запити і надсилає в чат
- **Адмін панель**: React додаток для управління користувачами

## Структура проекту

```
├── backend/        # Express + Telegram Bot + API
├── frontend/       # React Admin Panel (MUI)
├── .env            # Environment variables
└── README.md
```

---

## Швидкий старт

### 1. Налаштування змінних середовища

Створи `.env` файл в корені проекту:

```env
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ALLOWED_CHAT_ID=your_telegram_chat_id

# Cloudflare
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# MongoDB
MONGODB_URI=mongodb://localhost:27017/cloudflare-bot

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Admin (для першого входу в панель)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 2. Запуск MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# або через Docker
docker run -d -p 27017:27017 mongo
```

### 3. Запуск Backend

```bash
cd backend
yarn install
yarn dev
```

Сервер запуститься на `http://localhost:3001`

### 4. Запуск Frontend

```bash
cd frontend
yarn install
yarn dev
```

Адмін панель доступна на `http://localhost:5173`

---

## Як отримати токени

### Telegram Bot Token
1. Відкрий [@BotFather](https://t.me/BotFather) в Telegram
2. Напиши `/newbot` і слідуй інструкціям
3. Скопіюй токен

### Telegram Chat ID
1. Додай бота в потрібний чат
2. Напиши щось в чат
3. Відкрий: `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Знайди `chat.id` в відповіді

### Cloudflare API Token
1. Перейди на [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Натисни "Create Token"
3. Обери "Edit zone DNS" template
4. Zone Resources → Include → All zones
5. Скопіюй токен

### Cloudflare Account ID
1. Перейди на [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Account ID видно в правій колонці на головній сторінці

---

## Команди Telegram бота

| Команда | Опис |
|---------|------|
| `/start` | Привітання |
| `/help` | Список команд |
| `/register_domain <domain>` | Додати домен в Cloudflare |
| `/list_domains` | Показати всі домени |
| `/add_dns <domain> <type> <name> <content>` | Створити DNS запис |
| `/list_dns <domain>` | Показати DNS записи домену |
| `/update_dns <domain> <record_id> <content>` | Оновити DNS запис |
| `/delete_dns <domain> <record_id>` | Видалити DNS запис |

### Приклади

```
/register_domain example.com
/add_dns example.com A @ 192.168.1.1
/add_dns example.com CNAME www example.com
/list_dns example.com
```

---

## API Endpoints

### Auth
- `POST /api/auth/login` — `{ username, password }` → `{ token }`

### Users (потребує Bearer token)
- `GET /api/users` — список користувачів
- `POST /api/users` — створити `{ telegramId, username }`
- `PATCH /api/users/:id` — оновити `{ isAllowed }`
- `DELETE /api/users/:id` — видалити

### Webhook
- `POST /api/webhook/notify` — `{ message }` → надсилає в Telegram чат

---

## Адмін панель

1. Відкрий `http://localhost:5173`
2. Увійди з кредами з `.env` (ADMIN_USERNAME / ADMIN_PASSWORD)
3. Керуй користувачами: додавай, блокуй, видаляй

---

## Тестування Webhook

```bash
curl -X POST http://localhost:3001/api/webhook/notify \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'
```

---

## Технології

**Backend**: Node.js, TypeScript, Express, Telegraf, Mongoose, JWT, bcryptjs, axios

**Frontend**: React, TypeScript, Vite, MUI, React Router, axios
