# 🎉 HexAir Shop - Telegram Bot MVP

A humorous and fully functional Telegram bot that sells **bottled air** using cryptocurrency payments via **HexPay**. This project demonstrates how simple and elegant it is to integrate crypto payments into any application.

## 🤖 Built with AI

This entire bot was created using AI assistance, demonstrating how simple and straightforward it is to build crypto payment integration. No complex payment processing logic needed—just clean, readable TypeScript code leveraging HexPay's excellent API!

## 🚀 Features

- **Product Catalog**: 5 witty bottled air products with different price points
- **Crypto Payments**: Seamless HexPay integration for cryptocurrency transactions

## 📋 Product Catalog

| Product | Price | Description |
|---------|-------|-------------|
| 🏔️ Premium Mountain Air | $4.99 | Fresh alpine breeze captured at 2,500m elevation |
| 🌴 Tropical Paradise Air | $6.99 | Caribbean vibes with hints of coconut essence |
| 🌊 Ocean Breeze Air | $3.99 | Salty sea air with authentic seafoam notes |
| 🌲 Forest Mist Air | $5.49 | Crisp woodland air with pinecone aromatics |
| 💎 Exclusive NFT Air™ | $9.99 | Limited edition, blockchain-verified, collectible |

## 📦 Installation

### Prerequisites

- Node.js 16+ and npm
- Telegram Bot Token (from @BotFather)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/hexpay-io/tgdemo.git
   cd tgdemo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```
   TG_BOT_TOKEN=your_bot_token_here
   HEXPAY_API_URL=https://api.demo.hexpay.io
   STORE_NAME=AirBottle Shop
   ```

   Only `TG_BOT_TOKEN` is required. `HEXPAY_API_URL` defaults to the HexPay demo API.

5. **Build the project**
   ```bash
   npm run build
   ```

6. **Start the bot**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## 🐳 Run with Docker

```bash
docker build -t tgdemo .
docker run --rm --env-file .env tgdemo
```

## 🔧 API Client Generation

This project uses **OpenAPI specification** to automatically generate TypeScript types and client code from `oapi.yaml`.

### Automatic Generation

The API client is automatically generated during the build process:

```bash
npm run build
```

This runs `npm run generate:client` which generates TypeScript types in `src/generated/schema.ts`.

### Manual Generation

To regenerate the client without building:

```bash
npm run generate:client
```

## 🎮 Bot Commands

### User Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and introduction |
| `/shop` | Browse available air products with Buy buttons |

### Example Usage

1. Start conversation:
   ```
   User: /start
   Bot: Welcome message with instructions
   ```

2. Browse products:
   ```
   User: /shop
   Bot: Shows all products with "Buy" buttons
   ```

3. Make a purchase:
   ```
   User: Clicks "Buy" button for Premium Mountain Air
   Bot: Creates payment, shows link with "Complete Payment" button
   ```

4. Complete payment:
   ```
   User: Clicks "💳 Complete Payment" inline button
   Bot: Opens payment portal in HexPay
   ```
