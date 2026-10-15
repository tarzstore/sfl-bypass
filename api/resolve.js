// Vercel Serverless Function: /api/resolve?service=<nama>&url=...
// API key disimpan di Environment Variable ZAPI_KEY (tidak terlihat pengunjung).

const BASE = "https://api.zapi.ink/v1/";

// action   : nama aksi di API (default "resolve")
// hosts    : domain yang diizinkan (subdomain ikut diterima)
// bare     : regex input tanpa URL (id / slug) yang boleh dikirim apa adanya
// urlKeys  : field hasil yang berisi URL tujuan
// textKeys : field hasil yang berisi teks (key / script / isi paste)

// Yasir252: susun daftar link download (per kotak/grup) menjadi teks
function formatYasir(d) {
  if (!Array.isArray(d.boxes)) return "";
  const out = [];
  for (const b of d.boxes) {
    if (!b) continue;
    if (str(b.title)) out.push(str(b.title));
    if (str(b.password)) out.push("Password: " + str(b.password));
    for (const g of Array.isArray(b.groups) ? b.groups : []) {
      out.push("");
      if (str(g && g.title)) out.push("[" + str(g.title) + "]");
      for (const l of Array.isArray(g && g.links) ? g.links : []) {
        if (l && str(l.url)) out.push((str(l.host) || "Link") + ": " + l.url);
      }
    }
    out.push("");
  }
  return out.join("\n").trim();
}

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
    project: "bypass-tools:tpi-li",
    hosts: ["tpi.li", "oil.la", "tii.la", "oei.la", "iir.la", "tvi.la", "oii.la", "lnbz.la"],
    urlKeys: ["destinationUrl"],
  },
  sub2unlock: {
    project: "bypass-tools:sub2unlock",
    action: "bypass",
    hosts: ["sub2unlock.com", "sub2unlock.net", "sub2unlock.io"],
    urlKeys: ["destinationUrl"],
  },
  scriptpastebins: {
    project: "bypass-tools:scriptpastebins",
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
  shrinkme: {
    project: "bypass-tools:shrinkme",
    hosts: ["shrinkme.click", "shrinkme.io"],
  },
  bitly: {
    project: "bypass-tools:bitly",
    hosts: ["bit.ly", "bitly.is", "j.mp", "amzn.to"],
    bare: /^[A-Za-z0-9_-]{4,20}$/,
    urlKeys: ["destinationUrl"],
  },
  clksh: {
    project: "bypass-tools:clk-sh",
    hosts: ["clk.sh", "oko.sh", "oii.la"],
  },
  yasir252: {
    project: "bypass-tools:yasir252",
    hosts: ["yasir252.com"],
    format: formatYasir,
  },
  bloxscript: {
    project: "bypass-tools:blox-script",
    hosts: ["boblox-script.com", "blox-script.com"],
    textKeys: ["key"],
  },
  gzenx: {
    project: "bypass-tools:gzenx",
    hosts: ["gzenx.com"],
    bare: /^[\w-]{3,120}$/,
    textKeys: ["script"],
  },
  encurtador: {
    project: "bypass-tools:encurtador",
    hosts: ["l1nq.com", "encurtador.dev"],
    bare: /^[A-Za-z0-9_-]{3,20}$/,
    urlKeys: ["url"],
  },
  linkzy: {
    project: "bypass-tools:linkzy",
    hosts: ["linkzy.space"],
    bare: /^[A-Za-z0-9_-]{4,40}$/,
    urlKeys: ["destinationUrl"],
  },
  pastefy: {
    project: "bypass-tools:pastefy",
    action: "get",
    hosts: ["pastefy.app"],
    bare: /^[A-Za-z0-9]{4,16}$/,
    textKeys: ["content"],
  },
  rentry: {
    project: "bypass-tools:rentry",
    action: "raw",
    hosts: ["rentry.co", "rentry.org"],
    bare: /^[\w-]{2,60}$/,
    textKeys: ["content"],
  },
  socialwolvez: {
    project: "bypass-tools:socialwolvez",
    hosts: ["socialwolvez.com"],
    bare: /^[A-Za-z0-9_-]{4,24}$/,
  },
  pastedrop: {
    project: "bypass-tools:paste-drop",
    action: "get",
    hosts: ["paste-drop.com"],
    bare: /^[\w-]{2,80}$/,
    textKeys: ["content"],
  },
  tempelin: {
    project: "bypass-tools:tempel-in",
    hosts: ["tempel.in"],
    bare: /^[A-Za-z0-9_-]{4,24}$/,
    textKeys: ["content"],
  },
  mboost: {
    project: "bypass-tools:mboost",
    hosts: ["mboost.me"],
    bare: /^[\w-]{2,60}$/,
    urlKeys: ["destinationUrl"],
  },
  linkify: {
    project: "bypass-tools:linkify",
    hosts: ["go.linkify.ru", "linkify.ru"],
    bare: /^[A-Za-z0-9_-]{2,16}$/,
    urlKeys: ["destinationUrl"],
  },
  ez4short: {
    project: "bypass-tools:ez4short",
    hosts: ["ez4short.com"],
    bare: /^[A-Za-z0-9_-]{3,16}$/,
    urlKeys: ["url"],
  },
  pasterso: {
    project: "bypass-tools:paster-so",
    action: "get",
    hosts: ["paster.so"],
    bare: /^[A-Za-z0-9_-]{3,16}$/,
    textKeys: ["content"],
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
  if (!d.finalUrl && !d.text && typeof cfg.format === "function") {
    const t = cfg.format(d); if (t) d.text = t;
  }
  return json;
}

function hostAllowed(cfg, host) {
  return cfg.hosts.some((h) => host === h || host.endsWith("." + h));
}


// ===== Maintenance guard (dibaca dari Firestore: config/services -> maint) =====
const FB_PROJECT = process.env.FB_PROJECT_ID || "tarz-tools";
const MAINT_DEF = "Website sedang maintenance, coba lagi nanti.";
let maintCache = { t: 0, v: { on: false, msg: "" } };

async function getMaint() {
  // cache memori singkat (10 dtk) supaya hemat read Firestore tapi tetap cepat berlaku
  if (Date.now() - maintCache.t < 10000) return maintCache.v;
  try {
    const r = await fetch(
      "https://firestore.googleapis.com/v1/projects/" + FB_PROJECT + "/databases/(default)/documents/config/services",
      { cache: "no-store" }
    );
    if (r.status === 404) { maintCache = { t: Date.now(), v: { on: false, msg: "" } }; return maintCache.v; }
    if (!r.ok) throw new Error("firestore_" + r.status);
    const j = await r.json();
    const m = j && j.fields && j.fields.maint && j.fields.maint.mapValue && j.fields.maint.mapValue.fields;
    const v = {
      on: !!(m && m.on && m.on.booleanValue),
      msg: (m && m.msg && m.msg.stringValue) || "",
    };
    maintCache = { t: Date.now(), v };
    return v;
  } catch (e) {
    // gagal baca config: pakai nilai terakhir yang diketahui (fail-open bila belum pernah berhasil)
    return maintCache.v;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // Blokir SEMUA request saat maintenance (sebelum validasi & sebelum menyentuh API upstream)
  const maint = await getMaint();
  if (maint.on) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ error: "maintenance", message: (maint.msg || MAINT_DEF).slice(0, 160) });
  }

  const service = String((req.query && req.query.service) || "safelinku");
  const cfg = Object.prototype.hasOwnProperty.call(SERVICES, service) ? SERVICES[service] : null;
  if (!cfg) return res.status(400).json({ error: "invalid_service" });

  const target = String((req.query && req.query.url) || "").trim();
  let param;
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

    // PENTING: jangan cache di edge (public/s-maxage) -- respons yang di-cache di edge dilayani
    // tanpa menjalankan fungsi ini, sehingga maintenance tidak bisa memblokirnya.
    // Cache hanya di browser masing-masing pengguna.
    if (upstream.ok) {
      res.setHeader("Cache-Control", "private, max-age=3600");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
    res.status(upstream.status).setHeader("Content-Type", "application/json");
    return res.send(out);
  } catch (e) {
    return res.status(502).json({ error: "upstream_unreachable" });
  }
};
