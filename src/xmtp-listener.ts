import { Agent, isText } from "@xmtp/agent-sdk";
import { mkdirSync, existsSync } from "node:fs";

// Exported so index.ts HTTP routes can send messages
let _agent: Agent | null = null;
export function getAgent(): Agent | null {
  return _agent;
}

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
    return "⚡ Spraay x402 Gateway: pay-per-use DeFi infrastructure on Base.\nhttps://gateway.spraay.app";
  }
  return "🥭 Try /help, /swap, /dca, /batch, or /x402";
}

function getDbPath(env: string, suffix: string = "xmtp"): string {
  const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (volumePath) {
    const dbDir = `${volumePath}/${env}-${suffix}`;
    console.log(`[XMTP] Using Railway volume path: ${dbDir}`);
    return dbDir;
  }
  if (existsSync("/data")) {
    const dbDir = `/data/${env}-${suffix}`;
    console.log(`[XMTP] Using /data volume path: ${dbDir}`);
    return dbDir;
  }
  const dbDir = `./${env}-${suffix}`;
  console.log(`[XMTP] Using local path: ${dbDir}`);
  return dbDir;
}

export async function startXmtpListener(): Promise<void> {
  const walletKey = process.env.AGENT_PRIVATE_KEY;
  if (!walletKey) {
    console.error("[XMTP] AGENT_PRIVATE_KEY not set - running health server only");
    return;
  }
  if (!process.env.XMTP_DB_ENCRYPTION_KEY) {
    console.error("[XMTP] XMTP_DB_ENCRYPTION_KEY not set - running health server only");
    return;
  }
  try {
    const xmtpEnv = (process.env.XMTP_ENV || "production") as "production" | "dev" | "local";
    const dbPath = getDbPath(xmtpEnv);
    try { mkdirSync(dbPath, { recursive: true }); } catch {}

    process.env.XMTP_WALLET_KEY = walletKey;
    process.env.XMTP_ENV = xmtpEnv;

    console.log(`[XMTP] Initializing agent on ${xmtpEnv} network...`);
    const agent = await Agent.createFromEnv({ dbPath });
    _agent = agent; // expose for HTTP API

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
      console.log("[XMTP] ✅ Agent listening on " + xmtpEnv);
      console.log("[XMTP] Address: " + agent.address);
    });

    await agent.start();
  } catch (err) {
    console.error("[XMTP] Failed to start:", err);
    console.log("[XMTP] Health server and agent card still active.");
  }
}
