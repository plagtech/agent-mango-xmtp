import "dotenv/config";
import express from "express";
import { startXmtpListener, getAgent } from "./xmtp-listener.js";
import { AGENT_CARD } from "./agent-card.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    agents: {
      mangoswap: { id: 26345, status: "listening" },
      spraay: { id: 26346, status: "listening" }
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
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
      { name: "Spraay Batch Payments", id: "ethereum:26346" }
    ],
    links: {
      agentCard: "/.well-known/agent-card.json",
      health: "/health"
    }
  });
});

// --- XMTP HTTP API (called by Spraay gateway) ---

// POST /api/xmtp/send
// Body: { to: "0xAddress", message: "Hello" }
app.post("/api/xmtp/send", async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' or 'message'" });
    }
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: "XMTP agent not ready" });
    }
    const conversation = await agent.conversations.newDm(to);
    await conversation.sendText(message);
    res.json({
      success: true,
      to,
      message,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[XMTP API] Send error:", err);
    res.status(500).json({ error: err.message || "Failed to send message" });
  }
});

// POST /api/xmtp/broadcast
// Body: { recipients: ["0xAddr1", "0xAddr2"], message: "Hello" }
app.post("/api/xmtp/broadcast", async (req, res) => {
  try {
    const { recipients, message } = req.body;
    if (!recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({ error: "Missing 'recipients' array or 'message'" });
    }
    const agent = getAgent();
    if (!agent) {
      return res.status(503).json({ error: "XMTP agent not ready" });
    }
    const results = await Promise.allSettled(
      recipients.map(async (to: string) => {
        const conversation = await agent.conversations.newDm(to);
        await conversation.sendText(message);
        return to;
      })
    );
    const sent = results.filter(r => r.status === "fulfilled").map(r => (r as any).value);
    const failed = results.filter(r => r.status === "rejected").map((r, i) => recipients[i]);
    res.json({
      success: true,
      sent: sent.length,
      failed: failed.length,
      recipients: { sent, failed },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("[XMTP API] Broadcast error:", err);
    res.status(500).json({ error: err.message || "Failed to broadcast" });
  }
});

app.listen(PORT, () => {
  console.log("[Server] Agent Mango running on port " + PORT);
});

startXmtpListener().catch((err) => {
  console.error("[XMTP] Fatal error:", err);
});
