import { Agent, isText } from "@xmtp/agent-sdk";

function handleCommand(text: string): string {
  const lower = text.toLowerCase().trim();

  if (lower === "/help" || lower === "help" || lower === "hi" || lower === "hello") {
    return [
      "🥭 Agent Mango — DeFi Agent Suite",
      "",
      "MangoSwap (Agent #26345):",
      "  /swap <amount> <token> to <token> — Get swap quote",
      "  /dca — Set up dollar-cost averaging",
      "  /quote <token> — Get token price",
      "",
      "Spraay (Agent #26346):",
      "  /batch — Start a batch payment",
      "  /x402 — Query x402 gateway",
      "",
      "Links:",
      "  MangoSwap: https://mangoswap.xyz",
      "  Spraay Gateway: https://gateway.spraay.app",
      "  8004scan: https://8004scan.io/ethereum/agent/26345",
    ].join("\n");
  }

  if (lower.startsWith("/swap") || lower.includes("swap")) {
    const match = lower.match(/swap\s+([\d.]+)\s+(\w+)\s+(?:to|for)\s+(\w+)/);
    if (match) {
      const amount = match[1];
      const from = match[2].toUpperCase();
      const to = match[3].toUpperCase();
      return [
        `🔄 Swap Request: ${amount} ${from} → ${to}`,
        "",
        `To execute this swap on Base, visit:`,
        `https://mangoswap.xyz/swap?from=${from}&to=${to}&amount=${amount}`,
        "",
        `Gas-free via Coinbase Paymaster`,
        `Routes through Uniswap V3 / Aerodrome for best price.`,
      ].join("\n");
    }
    return "🔄 To swap, use: /swap <amount> <fromToken> to <toToken>\nExample: /swap 100 USDC to ETH";
  }

  if (lower.startsWith("/dca") || lower.includes("dca")) {
    return [
      "📅 DCA (Dollar-Cost Averaging)",
      "",
      "Set up scheduled token purchases on Base.",
      "Visit https://mangoswap.xyz/dca to configure your schedule.",
    ].join("\n");
  }

  if (lower.startsWith("/quote") || lower.includes("price") || lower.includes("quote")) {
    return "📊 For real-time quotes, visit https://mangoswap.xyz";
  }

  if (lower.startsWith("/batch") || lower.includes("batch")) {
    return [
      "📦 Spraay Batch Payments",
      "",
      "Send tokens to multiple recipients in one transaction.",
      "Supported networks: Base, Bittensor, Unichain, Plasma, BOB",
      "",
      "API: https://gateway.spraay.app",
    ].join("\n");
  }

  if (lower.startsWith("/x402") || lower.includes("x402") || lower.includes("gateway")) {
    return [
      "⚡ Spraay x402 Gateway",
      "",
      "9 paid endpoints on Base mainnet.",
      "AI agents pay per-request with USDC via x402 protocol.",
      "",
      "Gateway: https://gateway.spraay.app",
      "Payment wallet: 0xAd62f03C7514bb8c51f1eA70C2b75C37404695c8",
    ].join("\n");
  }

  return [
    "🥭 I didn't understand that. Try /help to see what I can do!",
    "",
    "Quick commands: /swap, /dca, /batch, /x402, /help",
  ].join("\n");
}

export async function startXmtpListener(): Promise<void> {
  const walletKey = process.env.AGENT_PRIVATE_KEY;
  if (!walletKey) {
    console.error("[XMTP] AGENT_PRIVATE_KEY not set - running health server only");
    return;
  }

  try {
    const dbEncryptionKey = process.env.XMTP_DB_ENCRYPTION_KEY;
    const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || "./data";
    const xmtpEnv = (process.env.XMTP_ENV || "production") as "production" | "dev" | "local";

    process.env.XMTP_WALLET_KEY = walletKey;
    if (dbEncryptionKey) {
      process.env.XMTP_DB_ENCRYPTION_KEY = dbEncryptionKey;
    }
    process.env.XMTP_ENV = xmtpEnv;

    const agent = await Agent.createFromEnv({ dbPath: volumePath });

    agent.on("text", async (ctx) => {
      const text = ctx.message.content as string;
      console.log(`[XMTP] Message: ${text}`);
      const response = handleCommand(text);
      await ctx.conversation.sendText(response);
    });

    agent.on("start", () => {
      console.log(`[XMTP] Agent is listening on ${xmtpEnv} network`);
      console.log(`[XMTP] Address: ${agent.address}`);
    });

    await agent.start();
  } catch (err) {
    console.error("[XMTP] Failed to start:", err);
    console.log("[XMTP] Health server and agent card are still active.");
  }
}