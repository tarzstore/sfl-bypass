// Vercel Serverless Function: /api/resolve?service=<nama>&url=...
// API key disimpan di Environment Variable ZAPI_KEY (tidak terlihat pengunjung).

const BASE = "https://api.zapi.ink/v1/";

// action   : nama aksi di API (default "resolve")
// hosts    : domain yang diizinkan (subdomain ikut diterima)
// bare     : regex input tanpa URL (id / slug) yang boleh dikirim apa adanya
// urlKeys  : field hasil yang berisi URL tujuan
// textKeys : field hasil yang berisi teks (key / script / isi paste)
const SERVICES = {
  safelinku: {
    project: "bypass-tools:safelinku",
    hosts: ["sfl.gl", "safelinku.com"],
  },
  link2unlock: {
    project: "bypass-tools:link2unlock",
    hosts: ["link2unlock.com"],
  },
  sub4unlock: {
    project: "bypass-tools:sub4unlock",
    hosts: ["sub4unlock.co", "sub4unlock.com", "sub4unlock.io"],
  },
  platoboost: {
    project: "bypass-tools:platoboost",
    hosts: ["platorelay.com", "platoboost.com", "platoboost.net"],
    textKeys: ["key"],
  },
  linkvertise: {
    project: "bypass-tools:linkvertise",
    hosts: ["linkvertise.com", "link-to.net", "link-hub.net", "link-target.org", "link-target.net", "link-center.net", "direct-link.net"],
    bare: /^\d+\/[\w-]+$/,
    urlKeys: ["url"],
  },
  tpili: {
    hosts: ["scriptpastebins.com"],
    bare: /^[\w-]+$/,
    textKeys: ["script"],
  },
  pastebin: {
    project: "bypass-tools:pastebin",
    action: "raw",
    hosts: ["pastebin.com"],
    bare: /^[A-Za-z0-9]{6,12}$/,
    textKeys: ["content"],
  },
  pastelua: {
    project: "bypass-tools:pastelua",
    hosts: ["pastelua.com"],
    bare: /^[A-Za-z0-9]{6,12}$/,
    textKeys: ["loadstring", "content"],
  },
};

const str = (v) => (typeof v === "string" && v ? v : "");

// Samakan bentuk respons supaya frontend cukup membaca data.finalUrl (tautan) atau data.text (teks)
function normalize(cfg, json) {
  if (!json || typeof json !== "object" || !json.data || typeof json.data !== "object") return json;
  const d = json.data;
  if (!d.finalUrl) {
    let final = "";
    for (const k of (cfg.urlKeys || []).concat("primaryUrl")) { final = str(d[k]); if (final) break; }
    if (!final) final = str(Array.isArray(d.unlocks) && d.unlocks[0] && d.unlocks[0].url);
    if (final) d.finalUrl = final;
  }
  if (!d.finalUrl) {
    for (const k of cfg.textKeys || []) { const t = str(d[k]); if (t) { d.text = t; break; } }
  }
  return json;
}

  if (cfg.bare && cfg.bare.test(target)) {
    param = target; // id / slug langsung
  } else {
    let parsed;
    try { parsed = new URL(target); } catch { return res.status(400).json({ error: "invalid_url" }); }
    if (!["http:", "https:"].includes(parsed.protocol) || !hostAllowed(cfg, parsed.hostname)) {
      return res.status(400).json({ error: "invalid_url" });
    }
    param = parsed.href;
  }

  if (!process.env.ZAPI_KEY) {
    return res.status(500).json({ error: "server_not_configured" });
  }

  try {
    const upstream = await fetch(BASE + cfg.project + "/" + (cfg.action || "resolve") + "?url=" + encodeURIComponent(param), {
      headers: { "x-api-key": process.env.ZAPI_KEY },
    });
    const text = await upstream.text();

    let out = text;
    try { out = JSON.stringify(normalize(cfg, JSON.parse(text))); } catch {}

    // Cache di edge Vercel 1 jam untuk link yang sama (hemat kuota API)
    if (upstream.ok) {
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    }
    res.status(upstream.status).setHeader("Content-Type", "application/json");
    return res.send(out);
  } catch (e) {
    return res.status(502).json({ error: "upstream_unreachable" });
  }
};
