// Vercel serverless function: proxies SafeSpace chat to the server-side Claude-CLI gateway.
// No API keys are exposed to the browser. On any failure it returns a graceful 200 fallback.

const FALLBACK_REPLY =
  "I'm sorry — I'm having trouble reaching the tenant advocate assistant right now. " +
  "Please try again in a moment. In the meantime, you can explore SafeSpace's in-app " +
  "resources (your local rights, repair timelines, and enforcement contacts) for guidance. " +
  '\n\n⚖️ *This is general information, not legal advice. Consult a tenant rights attorney for your specific situation.*';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ reply: FALLBACK_REPLY });
    return;
  }

  const gatewayUrl = process.env.CHAT_GATEWAY_URL;
  const gatewaySecret = process.env.CHAT_GATEWAY_SECRET;

  if (!gatewayUrl || !gatewaySecret) {
    res.status(200).json({ reply: FALLBACK_REPLY });
    return;
  }

  try {
    const { system, messages } = req.body || {};
    const endpoint = `${gatewayUrl.replace(/\/+$/, '')}/chat`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    let upstream;
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gatewaySecret}`,
        },
        body: JSON.stringify({ system, messages }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      res.status(200).json({ reply: FALLBACK_REPLY });
      return;
    }

    const data = await upstream.json();
    const reply = typeof data?.reply === 'string' && data.reply.trim() ? data.reply : FALLBACK_REPLY;
    res.status(200).json({ reply });
  } catch {
    res.status(200).json({ reply: FALLBACK_REPLY });
  }
}
