# Porto Agents

A modern Web3 application built with Next.js that demonstrates wallet connectivity and blockchain interactions using Porto wallet connector.

## 🚀 Features

- **Porto Wallet Integration**: Seamless wallet connection using Porto connector
- **Multi-Chain Support**: Connect to Ethereum Mainnet, Base, Sepolia, and Base Sepolia networks
- **Account Management**: View wallet address, balance, and chain information
- **Message Signing**: Sign messages with connected wallet
- **ENS Support**: Automatic ENS name resolution for connected addresses
- **Modern UI**: Beautiful, responsive interface with dark mode support
- **Real-time Updates**: Live balance and network status updates

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Web3 Libraries**: 
  - [Porto](https://www.npmjs.com/package/porto) - Wallet connector
  - [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
  - [Viem](https://viem.sh/) - TypeScript interface for Ethereum
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

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

The application is configured to work with the following networks:
- Ethereum Mainnet
- Base
- Sepolia (testnet)
- Base Sepolia (testnet)

Network configuration can be modified in `lib/wagmi.ts`.

## 📁 Project Structure

```
porto-agents/
├── app/               # Next.js app directory
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main application page
├── components/       # React components
│   ├── connect-button.tsx  # Wallet connection button
│   └── providers.tsx       # App providers (Wagmi, QueryClient)
├── lib/              # Library configurations
│   └── wagmi.ts      # Wagmi and Porto configuration
└── public/           # Static assets
```

## 🎯 Key Features

### Wallet Connection
Connect your wallet using Porto with a single click. The app displays your wallet address, ENS name (if available), current network, and balance.

### Message Signing
Test wallet functionality by signing custom messages. The signed message hash is displayed for verification.

### Multi-Chain Support
Seamlessly switch between supported networks while maintaining connection state.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.