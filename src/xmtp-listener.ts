// XMTP listener — mock mode until @xmtp/node-sdk is integrated
// Health server + agent card are fully functional

async function loadXmtp() {
  console.warn("[XMTP] XMTP SDK not yet integrated, running in mock mode");
  return false;
}

// --- Message handler ---
interface ParsedCommand {
  agent: "mangoswap" | "spraay" | "unknown";
  action: string;
  params: Record<string, string>;
  raw: string;
}

function parseMessage(text: string): ParsedCommand {
  const lower = text.toLowerCase().trim();

  if (lower.startsWith("/swap") || lower.includes("swap")) {
    const match = lower.match(/swap\s+([\d.]+)\s+(\w+)\s+(?:to|for)\s+(\w+)/);
    return {
      agent: "mangoswap",
      action: "swap",
      params: {
        amount: match?.[1] || "",
        fromToken: match?.[2]?.toUpperCase() || "",
        toToken: match?.[3]?.toUpperCase() || "",
      },
      raw: text,
    };
  }

  if (lower.startsWith("/dca") || lower.includes("dca")) {
    return { agent: "mangoswap", action: "dca", params: {}, raw: text };
  }

  if (lower.startsWith("/quote") || lower.includes("price") || lower.includes("quote")) {
    return { agent: "mangoswap", action: "quote", params: {}, raw: text };
  }

  if (lower.startsWith("/batch") || lower.includes("batch") || lower.includes("send to multiple")) {
    return { agent: "spraay", action: "batch-payment", params: {}, raw: text };
  }

  if (lower.startsWith("/x402") || lower.includes("x402") || lower.includes("gateway")) {
    return { agent: "spraay", action: "x402", params: {}, raw: text };
  }

  if (lower === "/help" || lower === "help" || lower === "hi" || lower === "hello") {
    return { agent: "unknown", action: "help", params: {}, raw: text };
  }

  return { agent: "unknown", action: "unknown", params: {}, raw: text };
}

function generateResponse(cmd: ParsedCommand): string {
  switch (cmd.action) {
    case "help":
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

    case "swap":
      if (cmd.params.amount && cmd.params.fromToken && cmd.params.toToken) {
        return [
          `🔄 Swap Request: ${cmd.params.amount} ${cmd.params.fromToken} → ${cmd.params.toToken}`,
          "",
          `To execute this swap on Base, visit:`,
          `https://mangoswap.xyz/swap?from=${cmd.params.fromToken}&to=${cmd.params.toToken}&amount=${cmd.params.amount}`,
          "",
          `Gas-free via Coinbase Paymaster 🎉`,
          `Routes through Uniswap V3 / Aerodrome for best price.`,
        ].join("\n");
      }
      return "🔄 To swap, use: /swap <amount> <fromToken> to <toToken>\nExample: /swap 100 USDC to ETH";

    case "dca":
      return [
        "📅 DCA (Dollar-Cost Averaging)",
        "",
        "Set up scheduled token purchases on Base.",
        "Visit https://mangoswap.xyz/dca to configure your schedule.",
        "",
        "Supports any token pair routed through Uniswap V3 / Aerodrome.",
      ].join("\n");

    case "quote":
      return "📊 For real-time quotes, visit https://mangoswap.xyz — prices route through Uniswap V3 / Aerodrome for best execution.";

    case "batch-payment":
      return [
        "📦 Spraay Batch Payments",
        "",
        "Send tokens to multiple recipients in one transaction.",
        "Supported networks: Base, Bittensor, Unichain, Plasma, BOB",
        "",
        "API: https://gateway.spraay.app",
        "Docs: https://spraay.app",
        "",
        "Use the x402 gateway for programmatic access with USDC micropayments.",
      ].join("\n");

    case "x402":
      return [
        "⚡ Spraay x402 Gateway",
        "",
        "9 paid endpoints on Base mainnet.",
        "AI agents pay per-request with USDC via x402 protocol.",
        "",
        "Gateway: https://gateway.spraay.app",
        "Payment wallet: 0xAd62f03C7514bb8c51f1eA70C2b75C37404695c8",
        "",
        "Bazaar