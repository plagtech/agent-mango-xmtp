export const AGENT_CARD = {
  agentId: "agent-mango",
  name: "Agent Mango",
  description: "DeFi agent suite: MangoSwap (token swaps on Base via Uniswap V3/Aerodrome) and Spraay (multi-chain, multi-stablecoin batch payments with USDC, USDT, EURC, DAI). Both registered as ERC-8004 agents on Ethereum mainnet.",
  url: "https://gateway.spraay.app",
  version: "3.0.0",
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: false
  },
  skills: [
    {
      id: "mangoswap-swap",
      name: "Token Swap",
      description: "Swap tokens on Base network via Uniswap V3 and Aerodrome routing. Gas-free via Coinbase Paymaster.",
      tags: ["defi", "swap", "base", "uniswap", "aerodrome"],
      examples: ["Swap 100 USDC for ETH on Base"]
    },
    {
      id: "spraay-batch-payment",
      name: "Multi-Stablecoin Batch Payment",
      description: "Send USDC, USDT, EURC, or DAI to up to 200 recipients in a single transaction on Base (V3), Unichain, Plasma, BOB, or Bittensor. EURC at competitive 0.25% fee.",
      tags: ["payments", "batch", "multi-chain", "stablecoin", "usdc", "usdt", "eurc", "dai"],
      examples: ["Send 10 USDC each to 5 addresses on Base", "Batch pay 50 EURC to 20 European contractors"]
    },
    {
      id: "spraay-batch-with-meta",
      name: "Batch Payment with Metadata",
      description: "Batch payment with onchain memo and ERC-8004 agent attribution via SprayContractV3.",
      tags: ["payments", "batch", "metadata", "erc-8004"],
      examples: ["Send 500 USDC to contributors with memo 'January grants'"]
    },
    {
      id: "spraay-x402",
      name: "x402 Paid API",
      description: "Access Spraay x402 payment gateway. 11 paid endpoints for AI agent micropayments on Base mainnet. AI chat, batch payments, swap quotes, prices, balances, ENS resolution.",
      tags: ["x402", "micropayments", "api", "base"],
      examples: ["Query Spraay x402 gateway for multi-token batch payment"]
    },
    {
      id: "spraay-token-info",
      name: "Supported Tokens & Chains",
      description: "Query supported stablecoins, fee tiers, and chains. Free at gateway.spraay.app/api/v3/tokens.",
      tags: ["discovery", "tokens", "chains"],
      examples: ["What tokens does Spraay support?", "What is the fee for EURC?"]
    }
  ],
  defaultInputModes: ["text/plain"],
  defaultOutputModes: ["text/plain", "application/json"],
  provider: {
    organization: "MangoSwap / Spraay",
    url: "https://mangoswap.xyz"
  },
  contracts: {
    base: {
      v3: "0x3eFf027045230A277293aC27bd571FBC729e0dcE",
      v2: "0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC"
    },
    unichain: { v2: "0x08fA5D1c16CD6E2a16FC0E4839f262429959E073" },
    mangoswap: "0xb81fea65B45D743AB62a1A2B351f4f92fb1d4D16"
  },
  erc8004: {
    ethereum: {
      mangoswap: {
        agentId: 26345,
        registry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        scan: "https://8004scan.io/ethereum/agent/26345"
      },
      spraay: {
        agentId: 26346,
        registry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432",
        scan: "https://8004scan.io/ethereum/agent/26346"
      }
    }
  },
  xmtp: {
    enabled: true,
    environment: "production",
    agentAddress: "0xd136d8D5e7aaD3a76e08950a76b418B013c6d546"
  }
};