import { Agent, isText } from "@xmtp/agent-sdk";
import { mkdirSync } from "node:fs";

function handleCommand(text: string): string {
  const lower = text.toLowerCase().trim();

  if (lower === "/help" || lower === "help" || lower === "hi" || lower === "hello") {
    return "🥭 Agent Mango — DeFi Agent Suite\n\nMangoSwap (#26345): /swap, /dca, /quote\nSpraay (#26346): /batch, /x402\n\nMangoSwap: https://mangoswap.xyz\nSpraay: https://gateway.spraay.app";
  }
  if (lower.startsWith("/swap") || lower.includes("swap")) {
    return "🔄 Visit https://mangoswap.xyz to swap tokens on Base. Gas-free via Coinbase Paymaster.";
  }
  if (lower.startsWith("/dca")) {
    return "📅 Visit https://mangoswap.xyz/dca for dollar-cost averaging on Base.";
  }
  if (lower.startsWith("/batch") || lower.includes("batch")) {
    return "📦 Spraay Batch Payments across Base, Bittensor, Unichain, Plasma, BOB.\nAPI: https://gateway.spraay.app";
  }
  if (lower.startsWith("/x402") || lower.includes("x402")) {
    return "⚡ Spraay x402 Gateway: 9 paid endpoints on Base mainnet.\nhttps://gateway.spraay.app";
  }
  return "🥭 Try /help, /swap, /dca, /batch, or /x402";
}

export async function startXmtpListener(): Promise<void> {
  const walletKey = process.env.AGENT_PRIVATE_KEY;
  if (!walletKey) {
    console.error("[XMTP] AGENT_PRIVATE_KEY not set - running health server only");
    return;
  }

  try {
    const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || "/data";
    const dbPath = volumePath + "/xmtp";
    const xmtpEnv = (process.env.XMTP_ENV || "production") as "production" | "dev" | "local";

    try { mkdirSync(dbPath, { recursive: true }); } catch {}

    process.env.XMTP_WALLET_KEY = walletKey;
    process.env.XMTP_ENV = xmtpEnv;

    const agent = await Agent.createFromEnv({ dbPath });

    agent.on("text", async (ctx) => {
      try {
        const text = ctx.message.content as string;
        console.log("[XMTP] Message: " + text);
        const response = handleCommand(text);
        await ctx.conversation.sendText(response);
      } catch (err) {
        console.error("[XMTP] Error handling message:", err);
      }
    });

    agent.on("start", () => {
      console.log("[XMTP] Agent is listening on " + xmtpEnv + " network");
      console.log("[XMTP] Address: " + agent.address);
    });

    await agent.start();
  } catch (err) {
    console.error("[XMTP] Failed to start:", err);
    console.log("[XMTP] Health server and agent card are still active.");
  }
}