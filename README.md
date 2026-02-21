# Agent Mango — XMTP Listener

XMTP message handler for MangoSwap (Agent #26345) and Spraay (Agent #26346) ERC-8004 agents on Ethereum mainnet.

## What This Does

1. **XMTP Listener** — Listens for incoming messages on the XMTP network and routes them to MangoSwap or Spraay based on commands
2. **Agent Card** — Serves `/.well-known/agent-card.json` for A2A protocol discovery
3. **Health Check** — `/health` endpoint for Railway monitoring

## Deploy to Railway

### Option A: From GitHub (recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Agent Mango XMTP listener"
git remote add origin https://github.com/plagtech/agent-mango-xmtp.git
git push -u origin main

# 2. In Railway dashboard:
#    - New Project → Deploy from GitHub repo
#    - Railway will use the Dockerfile (Node 20 enforced)
```

### Option B: Railway CLI

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Set Environment Variables in Railway

```
AGENT_PRIVATE_KEY=<your-agent-wallet-private-key>
XMTP_ENV=production
PORT=3000
```

Railway auto-assigns PORT, so the app reads `process.env.PORT`.

## Connect to gateway.spraay.app

You have two options for the agent card:

### Option 1: Separate Railway service (this repo)
Deploy this as its own service. The agent card is served at:
```
https://<your-railway-url>/.well-known/agent-card.json
```

### Option 2: Add to existing gateway (recommended)
If your Spraay gateway already runs on `gateway.spraay.app`, add the agent card route to that service. Copy `src/agent-card.ts` and add this to your existing Express/Next.js app:

```typescript
// In your existing gateway server:
import { AGENT_CARD } from "./agent-card";

app.get("/.well-known/agent-card.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(AGENT_CARD);
});
```

Then the agent card is discoverable at:
```
https://gateway.spraay.app/.well-known/agent-card.json
```

### DNS Setup (if deploying as separate service)
If you want this running on a subdomain like `agent.spraay.app`:
1. In Railway: Settings → Domains → Add custom domain → `agent.spraay.app`
2. In GoDaddy: Add CNAME record `agent` → Railway's provided domain

## Commands

The agent responds to XMTP messages:

| Command | Agent | Description |
|---------|-------|-------------|
| `/swap 100 USDC to ETH` | MangoSwap | Swap quote + link |
| `/dca` | MangoSwap | DCA setup info |
| `/quote` | MangoSwap | Price info |
| `/batch` | Spraay | Batch payment info |
| `/x402` | Spraay | x402 gateway details |
| `/help` | Both | Full command list |

## Local Development

```bash
# Copy env
cp .env.example .env
# Fill in AGENT_PRIVATE_KEY

# Install
npm install

# Run in dev mode
npm run dev

# Test health
curl http://localhost:3000/health
curl http://localhost:3000/.well-known/agent-card.json
```

## Architecture

```
XMTP Network
    ↓ messages
[Agent Mango XMTP Listener] (this service)
    ├── /health              → Railway health check
    ├── /.well-known/agent-card.json → A2A discovery
    ├── MangoSwap handler    → swap/dca/quote routing
    └── Spraay handler       → batch/x402 routing

ERC-8004 Registry (Ethereum mainnet)
    ├── MangoSwap #26345 → ipfs://QmdXKb...
    └── Spraay #26346    → ipfs://QmTXXd...
```

## ERC-8004 Registration Details

| Agent | ID | 8004scan | TX |
|-------|----|----------|----|
| MangoSwap | 26345 | [View](https://8004scan.io/ethereum/agent/26345) | `0x973d03...` |
| Spraay | 26346 | [View](https://8004scan.io/ethereum/agent/26346) | `0x0a24b2...` |

Registry: `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
Agent wallet: `0xd136d8D5e7aaD3a76e08950a76b418B013c6d546`
