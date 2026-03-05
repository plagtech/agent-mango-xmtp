import "dotenv/config";
import express from "express";
import { Client } from "@xmtp/node-sdk";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { startXmtpListener } from "./xmtp-listener.js";
import { AGENT_CARD } from "./agent-card.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const app = express();
app.use(express.json());

// --- Outbound XMTP client (node-sdk v5) ---
let xmtpClient: Client | null = null;

async function getXmtpClient(): Promise<Client | null> {
  if (xmtpClient) return xmtpClient;
  const key = process.env.AGENT_PRIVATE_KEY;
  if (!key) return null;
  try {
    const account = privateKeyToAccount(key as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: mainnet,
      transport: http(),
    });
    const signer = {
      getAddress: async () => account.address,
      signMessage: async (message: string) =>
        walletClient.signMessage({ message }),
    };
    xmtpClient = await Client.create(signer, {
      env: (process.env.XMTP_ENV as "production" | "dev") || "production",
    });
    console.log("[XMTP Outbound] Client ready:", xmtpClient.accountAddress);
    return xmtpClient;
  } catch (err) {
    console.error("[XMTP Outbound] Failed to init client:", err);
    return null;
  }
}

// --- Health & discovery ---

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    agents: {
      mangoswap: { id: 26345, status: "listening" },
      spraay: { id: 26346, status: "listening" },
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/.well-known/agent-card.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(AGENT_CARD);
});

app.get("/", (_req, res) => {
  res.json({
    name: "Agent Mango",
    description: "MangoSwap and Spraay ERC-8004 agents on XMTP",
    agents: [
      { name: "MangoSwap Router", id: "ethereum:26345" },
      { name: "Spraay Batch Payments", id: "ethereum:26346" },
    ],
    links: {
      agentCard: "/.well-known/agent-card.json",
      health: "/health",
    },
  });
});

// --- XMTP HTTP API (called by Spraay gateway) ---

// POST /api/xmtp/send
app.post("/api/xmtp/send", async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' or 'message'" });
    }
    const client = await getXmtpClient();
    if (!client) {
      return res.status(503).json({ error: "XMTP client not ready" });
    }
    const conversation = await client.conversations.newDm(to);
    await conversation.send(message);
    res.json({ success: true, to, message, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error("[XMTP API] Send error:", err);
    res.status(500).json({ error: err.message || "Failed to send" });
  }
});

// POST /api/xmtp/broadcast
app.post("/api/xmtp/broadcast", async (req, res) => {
  try {
    const { recipients, message } = req.body;
    if (!recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({ error: "Missing 'recipients' or 'message'" });
    }
    if (recipients.length > 100) {
      return res.status(400).json({ error: "Maximum 100 recipients" });
    }
    const client = await getXmtpClient();
    if (!client) {
      return res.status(503).json({ error: "XMTP client not ready" });
    }
    const results = await Promise.allSettled(
      recipients.map(async (to: string) => {
        const conversation = await client.conversations.newDm(to);
        await conversation.send(message);
        return to;
      })
    );
    const sent = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<string>).value);
    const failed = recipients.filter((_, i) => results[i].status === "rejected");
    res.json({
      success: true,
      sent: sent.length,
      failed: failed.length,
      recipients: { sent, failed },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[XMTP API] Broadcast error:", err);
    res.status(500).json({ error: err.message || "Failed to broadcast" });
  }
});

app.listen(PORT, () => {
  console.log("[Server] Agent Mango running on port " + PORT);
  getXmtpClient().catch(console.error);
});

startXmtpListener().catch((err) => {
  console.error("[XMTP] Fatal error:", err);
});
