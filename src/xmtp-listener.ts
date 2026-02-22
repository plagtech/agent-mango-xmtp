import { Agent, isText } from "@xmtp/agent-sdk";
import { mkdirSync, existsSync } from "node:fs";

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

/**
 * Get the database path — follows XMTP's official Railway deployment pattern.
 * Uses Railway volume if available, otherwise falls back to /data or ./
 */
function getDbPath(env: string, suffix: string = "xmtp"): string {
  // Check Railway volume mount (set via Railway Volumes tab)
  const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH;
  if (volumePath) {
    const dbDir = `${volumePath}/${env}-${suffix}`;
    console.log(`[XMTP] Using Railway volume path: ${dbDir}`);
    return dbDir;
  }

  // Fallback: use /data if it exists (manually created volume)
  if (existsSync("/data")) {
    const dbDir = `/data/${env}-${suffix}`;
    console.log(`[XMTP] Using /data volume path: ${dbDir}`);
    return dbDir;
  }

  // Last resort: current directory (works for local dev)
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

  // Ensure DB encryption key exists
  if (!process.env.XMTP_DB_ENCRYPTION_KEY) {
    console.error("[XMTP] XMTP_DB_ENCRYPTION_KEY not set - running health server only");
    console.error('[XMTP] Generate one: node -e "console.log(\'0x\' + require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    return;
  }

  try {
    const xmtpEnv = (process.env.XMTP_ENV || "production") as "production" | "dev" | "local";
    const dbPath = getDbPath(xmtpEnv);

    // Ensure the db directory exists
    try { mkdirSync(dbPath, { recursive: true }); } catch {}

    // Set env vars that Agent.createFromEnv() reads
    process.env.XMTP_WALLET_KEY = walletKey;
    process.env.XMTP_ENV = xmtpEnv;

    console.log(`[XMTP] Initializing agent on ${xmtpEnv} network...`);
    console.log(`[XMTP] DB path: ${dbPath}`);

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
      console.log("[XMTP] ✅ Agent is listening on " + xmtpEnv + " network");
      console.log("[XMTP] Address: " + agent.address);
    });

    await agent.start();
  } catch (err) {
    console.error("[XMTP] Failed to start:", err);
    console.log("[XMTP] Health server and agent card are still active.");
  }
}