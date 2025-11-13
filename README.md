🚀 MCP Automate — Automated Trading System (TypeScript + Node.js)

A fully automated algorithmic trading system built using TypeScript, Node.js, WebSockets, and REST APIs.
The system processes real-time market data, runs rule-based trading strategies, and executes buy/sell orders automatically—designed for accuracy, modularity, and extensibility.

🧠 Overview

MCP Automate is a production-style trading engine that:

Connects to market data streams using WebSockets

Applies algorithmic trading logic in real time

Automatically generates buy/sell signals

Places simulated or real orders using exchange REST APIs

Runs fully unattended (no manual monitoring required)

Supports demo mode for safe testing without keys

This project demonstrates practical system design, real-time processing, asynchronous flows, and robust API interaction patterns.

🔥 Features
✔ 100% Automated Trading Flow

No manual action needed. The system:

Receives market ticks

Filters noise

Applies strategy rules

Generates buy/sell signals

Places orders (real or simulated)

✔ Real-Time WebSocket Market Data

Maintains a persistent WebSocket connection

Parses live price updates

Feeds them into the strategy engine instantly

Handles disconnects & retries

✔ Modular Strategy Engine

Easily plug in multiple trading strategies:

EMA crossovers

RSI bands

Volume breakouts

Custom event-driven rules

You can extend or swap strategies without touching the core engine.

✔ REST API Order Execution

Placed through a dedicated order gateway:

Buy / Sell

Market Orders

Custom order sizes

Error-handled & validated

Retry-safe

✔ Demo Mode (Safe for Recruiters)

Run the system WITHOUT API keys:

npm run demo


Demo mode simulates:

Market data

Strategy signals

Order placement

Logs for interview showcasing

This mode is recommended for GitHub visitors and recruiters.

🏗 Project Architecture
MCP_Automate/
│
├── src/
│   ├── main.ts             # App entry point
│   ├── ws/
│   │   └── websocket.ts    # WebSocket market data handler
│   ├── strategy/
│   │   └── strategy.ts     # Trading logic (buy/sell rules)
│   ├── orders/
│   │   └── order.ts        # API wrapper to place orders
│   ├── utils/
│   │   └── logger.ts       # Centralized logging
│   └── demo/
│       └── demoRunner.ts   # Demo mode simulation
│
├── package.json
├── tsconfig.json
└── README.md

⚙️ Installation
git clone https://github.com/yourusername/Mcp_Automate
cd Mcp_Automate
npm install

🔐 Environment Setup

Create a .env file:

API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
REST_ENDPOINT=https://example.com/api
WS_ENDPOINT=wss://example.com/stream
MODE=live  # or demo


Never upload .env to GitHub.
For interviews, always run in demo mode.

▶️ Running the System
Demo Mode (Safe for recruiters)
npm run demo


This shows:

Live simulated price feed

Strategy decisions

Buy/sell order logs

Error-handling flow

Perfect for GitHub viewers.

Live Trading Mode

(Use only with your own keys)

npm run start


Starts:

WebSocket listener

Strategy engine

Order executor

Logging pipeline

📊 Example Output (Demo Mode)
[WS] Price tick received: 29654.23
[STRATEGY] EMA Crossover detected → BUY signal
[ORDER] Simulated BUY @ 29654.23 (0.01)
[LOG] Position opened (SIMULATED)

🧩 Customizing Strategies

Edit:

src/strategy/strategy.ts


Example rule:

if (emaShort > emaLong && rsi < 70) {
    return "BUY";
}


Add as many as you want.

🛡 Error Handling & Stability

Auto-retry failed orders

WebSocket reconnects

Graceful shutdown

Timestamped logs

Input validation

API failure isolation

You can mention these in interviews.

🧪 Why This Project Matters

This system showcases:

Real-time event-driven architecture

Scalable async workflows

API integration skills

Modular code design

Production-ready engineering practices

Practical understanding of trading systems

Perfect for demonstrating backend + system design competence.

🏁 Future Enhancements

Add backtesting module

Add Redis-based event queue

Add more advanced indicators

Add UI for showing trades

Deploy via Docker

Add Prometheus metrics

👨‍💻 Author

Shiva Shankar Mahadevu
NIT Jamshedpur — CSE
GitHub: your link
LinkedIn: your link

⭐ If you found this useful, star the repo!
