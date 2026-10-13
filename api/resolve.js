// Vercel Serverless Function: /api/resolve?url=https://sfl.gl/xxxx
// API key disimpan di Environment Variable ZAPI_KEY (tidak terlihat pengunjung).

const UPSTREAM = "https://api.zapi.ink/v1/bypass-tools:safelinku/resolve";
const ALLOWED_HOSTS = ["sfl.gl", "www.sfl.gl", "safelinku.com", "www.safelinku.com"];

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const target = String((req.query && req.query.url) || "");
  let parsed;
  try { parsed = new URL(target); } catch { return res.status(400).json({ error: "invalid_url" }); }
  if (!["http:", "https:"].includes(parsed.protocol) || !ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(400).json({ error: "invalid_url" });
  }

  if (!process.env.ZAPI_KEY) {
    return res.status(500).json({ error: "server_not_configured" });
  }

  try {
    const upstream = await fetch(UPSTREAM + "?url=" + encodeURIComponent(parsed.href), {
      headers: { "x-api-key": process.env.ZAPI_KEY },
    });
    const text = await upstream.text();

    // Cache di edge Vercel 1 jam untuk link yang sama (hemat kuota API)
    if (upstream.ok) {
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    }
    res.status(upstream.status).setHeader("Content-Type", "application/json");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ error: "upstream_unreachable" });
  }
};
