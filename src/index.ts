import "dotenv/config";
import express from "express";
import { startXmtpListener } from "./xmtp-listener.js";
import { AGENT_CARD } from "./agent-card.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = express();

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

app.listen(PORT, () => {
  console.log("[Server] Health check + agent card on port " + PORT);
});

startXmtpListener().catch((err) => {
  console.error("[XMTP] Fatal error:", err);
});