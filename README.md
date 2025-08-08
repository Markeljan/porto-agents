# Porto Agents

A Next.js application that allows you to create and fund Telegram bot agents with ETH using Porto wallet integration.

## 🚀 Features

- **Telegram Bot Integration**: Create and manage Telegram bots that can respond with their wallet balance
- **Porto Wallet Integration**: Seamless wallet connection using Porto connector
- **Deterministic Account Derivation**: Generate unique bot addresses from wallet + bot token
- **Multi-Chain Support**: Works with Base Sepolia (testnet) and other EVM chains
- **Real-time Balance Checking**: Bots can report their current ETH balance
- **Transaction Support**: Send ETH directly to your bot's derived account
- **Modern UI**: Beautiful, responsive interface with dark mode support

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Web3 Libraries**: 
  - [Porto](https://www.npmjs.com/package/porto) - Wallet connector
  - [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
  - [Viem](https://viem.sh/) - TypeScript interface for Ethereum
- **Bot Framework**: [Grammy](https://grammy.dev/) - Telegram Bot API
- **State Management**: TanStack Query
- **Code Quality**: Biome for linting and formatting

## 📦 Installation

```bash
# Install dependencies using bun
bun install

# Or using npm
npm install

# Or using yarn
yarn install
```

## 🔐 Environment Setup

Create a `.env.local` file in the root directory:

```env
# Optional: Telegram bot secret token for webhook validation
TELEGRAM_SECRET_TOKEN=your-secret-token-here
```

## 🏃‍♂️ Development

```bash
# Start the development server
bun dev

# Or using npm
npm run dev

# Build for production
bun build

# Start production server
bun start
```

The application will be available at [https://localhost:3000](https://localhost:3000)

## 🤖 How to Use

### 1. Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the bot token provided by BotFather

### 2. Fund Your Bot

1. Connect your wallet using Porto
2. Enter your bot token in the web interface
3. Click "Validate" to verify the bot
4. Enter the amount of ETH you want to deposit
5. Click "Send ETH to Bot" to fund your bot's account

### 3. Interact with Your Bot

1. Open Telegram and search for your bot username
2. Start a conversation with `/start` or say "balance"
3. Your bot will respond with its current ETH balance

### Available Bot Commands

- `/start` - Show bot information and balance
- `balance` - Check the bot's current balance
- `/check <address>` - Check balance of any Ethereum address

## 🔧 Configuration

### Network Configuration

The application is configured to work with Base Sepolia testnet by default. You can modify the network in:
- `lib/wagmi.ts` - For frontend wallet configuration
- `app/api/bot/[botToken]/route.ts` - For bot balance checking

## 📁 Project Structure

```
porto-agents/
├── app/                        # Next.js app directory
│   ├── api/                   # API routes
│   │   └── bot/               # Bot-related endpoints
│   │       └── [botToken]/    # Dynamic bot token route
│   │           └── route.ts   # Bot webhook and management
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main application page
├── components/                # React components
│   ├── connect-button.tsx    # Wallet connection button
│   └── providers.tsx          # App providers (Wagmi, QueryClient)
├── lib/                       # Library configurations
│   └── wagmi.ts              # Wagmi and Porto configuration
└── public/                    # Static assets
```

## 🎯 Key Features Explained

### Deterministic Account Derivation

The bot's wallet address is derived deterministically from:
- Your connected wallet address
- The Telegram bot token

This ensures that the same combination always generates the same bot address, making it easy to manage multiple bots.

### Real-time Balance Updates

Bots check their balance directly from the blockchain when requested, ensuring always up-to-date information.

### Simplified Bot Management

No database or complex storage required - everything runs in-memory for development, making it easy to test and iterate.

## ⚠️ Important Notes

- This is a simplified implementation for demonstration purposes
- In production, consider:
  - Using proper key derivation methods
  - Implementing persistent storage for bot configurations
  - Adding proper authentication and rate limiting
  - Using secure webhook endpoints with proper validation
  - Implementing more sophisticated wallet management

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

# Slides

https://docs.google.com/presentation/d/1FlOPqjUOa4zKKLbaF88Pig2yZB1tOKIAbu5vKOTnvSU