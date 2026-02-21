export async function startXmtpListener(): Promise<void> {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    console.error("[XMTP] AGENT_PRIVATE_KEY not set - running health server only");
    return;
  }

  console.log("[XMTP] Running in mock mode (XMTP SDK not yet integrated)");
  console.log("[XMTP] Health server and agent card are active.");
  console.log("[XMTP] To enable real XMTP: install @xmtp/node-sdk and update this file.");
}