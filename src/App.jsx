import { useState, useEffect, useRef, useCallback } from "react";

// --- Data ---
const STOCKS = [
  { id: "2330", name: "?°ç???, sector: "?Šå?é«?, price: 2445, prev: 2410, volume: 38420, pe: 28.5, dy: 1.8, k: 72, d: 65, rsi: 68, macd: 12.5, foreignBuy: 8500, trustBuy: 1200, dealerBuy: -300, ma5: 2420, ma20: 2380, ma60: 2310 },
  { id: "2317", name: "é´»æµ·", sector: "?»å?ä»?·¥", price: 235, prev: 231, volume: 52100, pe: 12.1, dy: 4.2, k: 78, d: 70, rsi: 71, macd: 3.2, foreignBuy: 12000, trustBuy: 3500, dealerBuy: 800, ma5: 232, ma20: 225, ma60: 218 },
  { id: "2454", name: "?¯ç™¼ç§?, sector: "ICè¨­è?", price: 1890, prev: 1870, volume: 5800, pe: 22.3, dy: 2.5, k: 65, d: 60, rsi: 62, macd: 8.7, foreignBuy: 2100, trustBuy: 600, dealerBuy: 200, ma5: 1875, ma20: 1840, ma60: 1790 },
  { id: "2382", name: "å»??", sector: "AIä¼ºæ???, price: 385, prev: 378, volume: 28300, pe: 18.7, dy: 2.8, k: 82, d: 74, rsi: 75, macd: 5.1, foreignBuy: 6200, trustBuy: 4800, dealerBuy: 1100, ma5: 380, ma20: 365, ma60: 340 },
  { id: "3231", name: "ç·¯å‰µ", sector: "AIä¼ºæ???, price: 148, prev: 145, volume: 45600, pe: 15.2, dy: 3.1, k: 70, d: 63, rsi: 66, macd: 2.8, foreignBuy: 5500, trustBuy: 3200, dealerBuy: 600, ma5: 146, ma20: 140, ma60: 132 },
  { id: "2308", name: "?°é???, sector: "?»æ?/??†±", price: 465, prev: 460, volume: 8900, pe: 30.1, dy: 1.5, k: 58, d: 55, rsi: 57, macd: 1.9, foreignBuy: 1800, trustBuy: 900, dealerBuy: -100, ma5: 462, ma20: 455, ma60: 440 },
  { id: "2881", name: "å¯Œé‚¦??, sector: "?‘è?", price: 98.5, prev: 97.8, volume: 22100, pe: 11.2, dy: 4.8, k: 55, d: 52, rsi: 54, macd: 0.8, foreignBuy: 3200, trustBuy: 500, dealerBuy: 200, ma5: 97.5, ma20: 95, ma60: 92 },
  { id: "2882", name: "?‹æ³°??, sector: "?‘è?", price: 72.3, prev: 71.5, volume: 31500, pe: 10.8, dy: 5.1, k: 60, d: 56, rsi: 58, macd: 0.6, foreignBuy: 4100, trustBuy: 800, dealerBuy: 300, ma5: 71.8, ma20: 69.5, ma60: 67 },
  { id: "2603", name: "?·æ¦®", sector: "?ªé?", price: 225, prev: 228, volume: 18900, pe: 8.5, dy: 6.2, k: 35, d: 42, rsi: 38, macd: -3.2, foreignBuy: -5200, trustBuy: -1800, dealerBuy: -400, ma5: 230, ma20: 238, ma60: 245 },
  { id: "3661", name: "ä¸–èŠ¯-KY", sector: "ICè¨­è?", price: 3850, prev: 3780, volume: 2100, pe: 35.2, dy: 0.8, k: 75, d: 68, rsi: 72, macd: 45.2, foreignBuy: 850, trustBuy: 320, dealerBuy: 150, ma5: 3800, ma20: 3700, ma60: 3550 },
  { id: "2345", name: "?ºé‚¦", sector: "ç¶²é€?, price: 680, prev: 672, volume: 6200, pe: 25.8, dy: 1.9, k: 68, d: 62, rsi: 65, macd: 6.3, foreignBuy: 1500, trustBuy: 2100, dealerBuy: 300, ma5: 675, ma20: 660, ma60: 635 },
  { id: "6669", name: "ç·¯ç?", sector: "AIä¼ºæ???, price: 2180, prev: 2150, volume: 1800, pe: 20.5, dy: 2.2, k: 72, d: 66, rsi: 69, macd: 18.5, foreignBuy: 600, trustBuy: 450, dealerBuy: 80, ma5: 2160, ma20: 2100, ma60: 2020 },
  { id: "2409", name: "?‹é?", sector: "?¢æ¿", price: 22.8, prev: 22.3, volume: 95000, pe: 15.5, dy: 3.5, k: 80, d: 72, rsi: 74, macd: 0.4, foreignBuy: 28000, trustBuy: 5000, dealerBuy: 1200, ma5: 22.5, ma20: 21.5, ma60: 20.8 },
  { id: "3481", name: "ç¾¤å‰µ", sector: "?¢æ¿", price: 18.6, prev: 18.2, volume: 88000, pe: 14.2, dy: 3.8, k: 76, d: 70, rsi: 70, macd: 0.3, foreignBuy: 22000, trustBuy: 4200, dealerBuy: 900, ma5: 18.3, ma20: 17.5, ma60: 16.8 },
  { id: "2002", name: "ä¸­é‹¼", sector: "?¼éµ", price: 26.5, prev: 26.8, volume: 35200, pe: 18.5, dy: 4.5, k: 30, d: 38, rsi: 35, macd: -0.5, foreignBuy: -8500, trustBuy: -2100, dealerBuy: -600, ma5: 27, ma20: 27.8, ma60: 28.5 },
  { id: "2912", name: "çµ±ä?è¶?, sector: "?¶å”®", price: 310, prev: 308, volume: 3200, pe: 27.5, dy: 3.0, k: 52, d: 50, rsi: 51, macd: 0.5, foreignBuy: 400, trustBuy: 200, dealerBuy: 50, ma5: 309, ma20: 305, ma60: 300 },
  { id: "2357", name: "?¯ç¢©", sector: "?ç?PC", price: 620, prev: 612, volume: 4500, pe: 14.8, dy: 4.0, k: 70, d: 64, rsi: 67, macd: 5.8, foreignBuy: 1800, trustBuy: 1500, dealerBuy: 400, ma5: 615, ma20: 600, ma60: 580 },
  { id: "6770", name: "?›ç???, sector: "?¶å?ä»?·¥", price: 35.5, prev: 34.8, volume: 72000, pe: 45.2, dy: 0.5, k: 85, d: 78, rsi: 78, macd: 0.8, foreignBuy: 18000, trustBuy: 6500, dealerBuy: 2200, ma5: 35, ma20: 33.5, ma60: 31 },
];

function getSignal(s) {
  let score = 0, reasons = [];
  if (s.k > 80 && s.k > s.d) { score -= 1; reasons.push("KDé«˜æ??ç†±"); }
  else if (s.k < 20 && s.k < s.d) { score += 2; reasons.push("KDä½æ?è¶…è³£"); }
  else if (s.k > s.d && s.k < 80) { score += 1; reasons.push("KDé»ƒé?äº¤å?"); }
  else if (s.k < s.d && s.k > 20) { score -= 1; reasons.push("KDæ­»äº¡äº¤å?"); }
  if (s.rsi > 70) { score -= 1; reasons.push("RSI?è²·"); }
  else if (s.rsi < 30) { score += 2; reasons.push("RSIè¶…è³£?å?"); }
  else if (s.rsi > 50) { score += 0.5; reasons.push("RSI?å?"); }
  if (s.macd > 0) { score += 1; reasons.push("MACDç´…æŸ±"); }
  else { score -= 1; reasons.push("MACDç¶ æŸ±"); }
  if (s.price > s.ma5 && s.price > s.ma20) { score += 1; reasons.push("ç«™ç©©?‡ç?ä¹‹ä?"); }
  else if (s.price < s.ma5 && s.price < s.ma20) { score -= 1; reasons.push("è·Œç ´?‡ç??¯æ?"); }
  const ti = s.foreignBuy + s.trustBuy + s.dealerBuy;
  if (ti > 5000) { score += 1; reasons.push("æ³•äººè²·è?"); }
  else if (ti < -5000) { score -= 1; reasons.push("æ³•äººè³??"); }
  if (s.pe < 12) { score += 0.5; reasons.push("ä½æœ¬?Šæ?"); }
  else if (s.pe > 30) { score -= 0.5; reasons.push("é«˜æœ¬?Šæ?"); }
  if (s.dy > 4) { score += 0.5; reasons.push("é«˜æ??©ç?"); }
  let signal, color;
  if (score >= 3) { signal = "å¼·å?è²·é€?; color = "#dc2626"; }
  else if (score >= 1.5) { signal = "å»ºè­°è²·é€?; color = "#ef4444"; }
  else if (score >= 0) { signal = "ä¸­æ€§è???; color = "#a3a3a3"; }
  else if (score >= -1.5) { signal = "å»ºè­°è³?‡º"; color = "#22c55e"; }
  else { signal = "å¼·å?è³?‡º"; color = "#16a34a"; }
  return { score, signal, color, reasons };
}

// --- Small components ---
function Spark({ stock, w = 72, h = 24 }) {
  const seed = parseInt(stock.id) % 100;
  const pts = Array.from({ length: 20 }, (_, i) => {
    const base = stock.prev + (stock.price - stock.prev) * (i / 19);
    return base + Math.sin(seed + i * 0.8) * (stock.price * 0.007) + Math.cos(seed * 0.3 + i * 1.2) * (stock.price * 0.004);
  });
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const path = pts.map((v, i) => `${(i / 19) * w},${h - ((v - min) / range) * h}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={path} fill="none" stroke={stock.price >= stock.prev ? "#ef4444" : "#22c55e"} strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

function GaugeBar({ value, label, max = 100, zones }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  let col = "#888";
  zones?.forEach(z => { if (value >= z.from && value <= z.to) col = z.color; });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 14, color: "#ccc" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: col }}>{value}</span>
      </div>
      <div style={{ height: 5, background: "#222", borderRadius: 2 }}>
        <div style={{ height: 5, width: `${pct}%`, background: col, borderRadius: 2, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

// --- Verdict Card ---
function VerdictCard({ verdict, stockName, price, change }) {
  const map = {
    "å¼·å?è²·é€?: { icon: "?”¥", bg: "linear-gradient(135deg, #7f1d1d, #991b1b)", border: "#dc2626", color: "#fca5a5", sub: "?€è¡“é¢?‡ç?ç¢¼é¢é«˜åº¦?å?ï¼ŒçŸ­ç·šæ?å¼·å‹¢ä¸Šæ”»?•èƒ½" },
    "è²·é€?: { icon: "??", bg: "linear-gradient(135deg, #1a1a1a, #2a1515)", border: "#ef4444", color: "#ef4444", sub: "å¤šé??‡æ??å?ï¼Œå¯?ƒæ…®?¢ä??†æ‰¹ä½ˆå?" },
    "è§€??: { icon: "?¸ï?", bg: "linear-gradient(135deg, #1a1a1a, #1a1a1a)", border: "#f59e0b", color: "#f59e0b", sub: "å¤šç©ºè¨Šè?äº¤é?ï¼Œå»ºè­°ç?å¾…æ–¹?‘æ?ç¢ºå??²å ´" },
    "è³?‡º": { icon: "??", bg: "linear-gradient(135deg, #1a1a1a, #0d1f0d)", border: "#22c55e", color: "#22c55e", sub: "?€è¡“é¢è½‰å¼±?–ä¼°?¼å?é«˜ï??¯è€ƒæ…®?²åˆ©äº†ç??–æ?ç¢? },
    "å¼·å?è³?‡º": { icon: "?š¨", bg: "linear-gradient(135deg, #052e16, #14532d)", border: "#16a34a", color: "#86efac", sub: "å¤šé??‡æ?é«˜åº¦?ç©ºï¼Œå»ºè­°ç›¡?Ÿæ?ç¢¼é¿?? },
  };
  const v = map[verdict] || map["è§€??];
  return (
    <div style={{ background: v.bg, border: `2px solid ${v.border}`, borderRadius: 12, padding: "16px 16px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 36 }}>{v.icon}</span>
          <div>
            <div style={{ fontSize: 14, color: "#ddd" }}>AI è¨ºæ–·çµè?</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: v.color, letterSpacing: 2 }}>{verdict}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {stockName && <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e5e5" }}>{stockName}</div>}
          {price && <div style={{ fontSize: 16, color: v.color }}>{price} {change || ""}</div>}
        </div>
      </div>
      <div style={{ fontSize: 15, color: "#ddd", lineHeight: 1.5 }}>{v.sub}</div>
    </div>
  );
}

// --- Score Ring ---
function ScoreRing({ score, label, size = 48 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = circ - (pct / 100) * circ;
  const col = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s" }} />
      </svg>
      <div style={{ position: "relative", marginTop: -(size/2 + 8), fontSize: 17, fontWeight: 700, color: col, textAlign: "center", lineHeight: `${size}px`, height: size }}>{pct}</div>
      <div style={{ fontSize: 13, color: "#ccc", marginTop: -4 }}>{label}</div>
    </div>
  );
}

// --- Parse verdict ---
function parseVerdict(text) {
  if (/å¼·å?è²·é€²|å¼·ç?è²·é€²|ç©æ¥µè²·é€?.test(text)) return "å¼·å?è²·é€?;
  if (/å¼·å?è³?‡º|å¼·ç?è³?‡º|ç©æ¥µè³?‡º/.test(text)) return "å¼·å?è³?‡º";
  const buy = (text.match(/è²·é€²|è²·å…¥|?šå?|?‹å?|?å?|å»ºè­°è²·|?¯ä»¥è²·|?¢ä?å¸ƒå?|?¢ä?ä½ˆå?|? ç¢¼|?‰åˆ©è²·æ–¹/g) || []).length;
  const sell = (text.match(/è³?‡º|?šç©º|?‹ç©º|?ç©º|å»ºè­°è³£|æ¸›ç¢¼|?²åˆ©äº†ç?|?ºå ´|?‰è³£|å®œè³£/g) || []).length;
  const hold = (text.match(/è§€?›|ä¸­æ€§|?å¹³|ç­‰å?|?«æ?ä¸å?|ä¸å»ºè­°é€²å ´|?œå?/g) || []).length;
  if (buy > sell && buy > hold) return buy >= 3 ? "å¼·å?è²·é€? : "è²·é€?;
  if (sell > buy && sell > hold) return sell >= 3 ? "å¼·å?è³?‡º" : "è³?‡º";
  return "è§€??;
}
function parseStockInfo(text) {
  let stockName = null, price = null, change = null;
  const nm = text.match(/(?:??|?¡ç¥¨|?‹è‚¡)[^\n]*?([^\s(ï¼ˆ]+)\s*[ï¼?](\d{4})[)ï¼‰]/);
  if (nm) stockName = `${nm[1]} (${nm[2]})`;
  const pm = text.match(/(?:?’°|?¡åƒ¹|?¶ç›¤|?€??[^\n]*?(\d+(?:\.\d+)?)\s*??);
  if (pm) price = pm[1] + " ??;
  const cm = text.match(/[æ¼²è?][^\n]*?([+-]?\d+(?:\.\d+)?%)/);
  if (cm) change = cm[1];
  return { stockName, price, change };
}
function parseFinancialScores(text) {
  const scores = {};
  const items = [
    { key: "revenue", label: "?Ÿæ”¶?é•·", patterns: [/?Ÿæ”¶[?é•·å¢é•·][^\n]*?(\d+)/] },
    { key: "eps", label: "EPS", patterns: [/EPS[^\n]*?(\d+)/] },
    { key: "margin", label: "æ¯›åˆ©??, patterns: [/æ¯›åˆ©?‡[^\n]*?(\d+)/] },
    { key: "roe", label: "ROE", patterns: [/ROE[^\n]*?(\d+)/] },
    { key: "debt", label: "è² å‚µæ¯?, patterns: [/è² å‚µ[æ¯”ç?][^\n]*?(\d+)/] },
  ];
  items.forEach(item => {
    for (const p of item.patterns) {
      const m = text.match(p);
      if (m) { scores[item.key] = parseInt(m[1]); break; }
    }
  });
  return scores;
}

// --- Watchlist hook ---
function useWatchlist() {
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-watchlist")) || []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem("tw-stock-watchlist", JSON.stringify(list)); }, [list]);
  const add = (item) => setList(prev => {
    if (prev.some(p => p.id === item.id)) return prev;
    return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
  });
  const remove = (id) => setList(prev => prev.filter(p => p.id !== id));
  const has = (id) => list.some(p => p.id === id);
  const update = (id, data) => setList(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  return { list, add, remove, has, update };
}

// --- API Key management ---
function useApiKey() {
  const [key, setKey] = useState(() => {
    try { return localStorage.getItem("tw-stock-apikey") || ""; }
    catch { return ""; }
  });
  const [provider, setProviderState] = useState(() => {
    try { return localStorage.getItem("tw-stock-provider") || "gemini"; }
    catch { return "gemini"; }
  });
  const save = (k) => { setKey(k); localStorage.setItem("tw-stock-apikey", k); };
  const clear = () => { setKey(""); localStorage.removeItem("tw-stock-apikey"); };
  const setProvider = (p) => { setProviderState(p); localStorage.setItem("tw-stock-provider", p); };
  return { key, save, clear, hasKey: key.length > 10, provider, setProvider };
}

// --- API call helper (Gemini FREE / Anthropic PAID) ---
async function callAI(prompt, apiKey, provider) {
  if (!apiKey) throw new Error("NO_KEY");
  if (provider === "anthropic") {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: prompt }] }),
    });
    if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err?.error?.message || "API error " + resp.status); }
    const data = await resp.json();
    return data.content?.filter(i => i.type === "text").map(i => i.text).join("\n") || "";
  } else {
    // Gemini API - key must be in URL for browser CORS to work
    const makeRequest = async (useSearch) => {
      const body = { contents: [{ parts: [{ text: prompt }] }] };
      if (useSearch) body.tools = [{ google_search: {} }];
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error?.message || "API error " + resp.status);
      }
      return resp.json();
    };
    let data;
    try {
      data = await makeRequest(true);
    } catch (e) {
      // If google_search not available, retry without
      try {
        data = await makeRequest(false);
      } catch (e2) {
        throw e2;
      }
    }
    return (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n");
  }
}

// --- Settings Panel ---
function SettingsPanel({ apiKey, onClose }) {
  const [input, setInput] = useState(apiKey.key);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testKey = async () => {
    setTesting(true); setTestResult(null);
    try {
      await callAI("?ç??©å€‹å?ï¼šæ???, input, apiKey.provider);
      setTestResult({ ok: true, msg: "??é©—è??å?ï¼å¯ä»¥é?å§‹ä½¿??AI è¨ºæ–·äº†ã€? });
      apiKey.save(input);
    } catch (e) {
      setTestResult({ ok: false, msg: "??é©—è?å¤±æ?ï¼? + e.message });
    }
    setTesting(false);
  };

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>?™ï? API è¨­å?</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#ccc", fontSize: 22, cursor: "pointer" }}>??/button>
      </div>

      <div style={{ fontSize: 15, color: "#ccc", marginBottom: 8 }}>?¸æ? AI å¼•æ?</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "gemini", name: "Google Gemini", tag: "?? ?è²»", desc: "æ¯å¤©?¯ç”¨ 500 æ¬? },
          { id: "anthropic", name: "Anthropic Claude", tag: "?’° ä»˜è²»", desc: "?€?²å€?$5 ç¾é?èµ? },
        ].map(p => (
          <button key={p.id} onClick={() => { apiKey.setProvider(p.id); setInput(""); setTestResult(null); }}
            style={{ flex: 1, padding: "14px 12px", borderRadius: 10, border: "2px solid " + (apiKey.provider === p.id ? "#f97316" : "#222"),
              background: apiKey.provider === p.id ? "#1a1510" : "#0d0d0d", cursor: "pointer", textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: apiKey.provider === p.id ? "#f97316" : "#999" }}>{p.name}</div>
            <div style={{ fontSize: 14, color: apiKey.provider === p.id ? "#22c55e" : "#777", marginTop: 3 }}>{p.tag}</div>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ fontSize: 15, color: "#ccc", marginBottom: 6 }}>API Key</div>
      <input value={input} onChange={e => setInput(e.target.value)}
        placeholder={apiKey.provider === "gemini" ? "AIzaSy..." : "sk-ant-api03-..."}
        type="password"
        style={{ width: "100%", background: "#0a0a0a", border: "1px solid #333", borderRadius: 8, padding: "12px 14px", color: "#e5e5e5", fontSize: 16, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button onClick={testKey} disabled={testing || !input.trim()}
          style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: "none", background: testing || !input.trim() ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: testing ? "wait" : "pointer" }}>
          {testing ? "é©—è?ä¸­â€? : "?²å?ä¸¦é?è­?}
        </button>
        {apiKey.hasKey && (
          <button onClick={() => { apiKey.clear(); setInput(""); setTestResult(null); }}
            style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#ef4444", fontSize: 15, cursor: "pointer" }}>æ¸…é™¤</button>
        )}
      </div>

      {testResult && (
        <div style={{ padding: 12, borderRadius: 8, fontSize: 15, background: testResult.ok ? "#052e16" : "#2a1515", color: testResult.ok ? "#86efac" : "#fca5a5", border: "1px solid " + (testResult.ok ? "#16a34a" : "#dc2626") }}>
          {testResult.msg}
        </div>
      )}

      <div style={{ marginTop: 14, padding: 14, background: "#0a0a0a", borderRadius: 8, fontSize: 14, color: "#bbb", lineHeight: 2 }}>
        {apiKey.provider === "gemini" ? (<>
          <div style={{ fontWeight: 600, marginBottom: 4, color: "#22c55e", fontSize: 15 }}>?? ?è²»?–å? Gemini API Key</div>
          1. ??<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: "#f97316" }}>aistudio.google.com/apikey</a> ??Google å¸³è??»å…¥<br/>
          2. é»ã€Œå»ºç«?API ?‘é‘°?â? ?¸ä??‹å?æ¡?br/>
          3. è¤‡è£½?‘é‘°ï¼ˆAIzaSy... ?‹é ­ï¼‰è²¼?°ä???br/>
          <strong style={{ color: "#22c55e" }}>??å®Œå…¨?è²»ï¼Œä??€ä¿¡ç”¨?¡ï?</strong>
        </>) : (<>
          <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>?–å? Anthropic API Key</div>
          1. ??<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{ color: "#f97316" }}>console.anthropic.com</a> ?»å…¥<br/>
          2. å»ºç? Key ??Plans & Billing ? å€?$5 èµ?br/>
          3. è¤‡è£½?‘é‘°è²¼åˆ°ä¸Šæ–¹
        </>)}
      </div>
    </div>
  );
}


// ====================================
// TAB 1: AI ?‹è‚¡è¨ºæ–· + è²¡å ±?¥æª¢
// ====================================
function TabDiagnosis({ watchlist, apiKey }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-history")) || []; }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem("tw-stock-history", JSON.stringify(history)); }, [history]);

  const search = async (q) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    if (!apiKey.hasKey) { setError("è«‹å??°å³ä¸Šè? ?™ï? è¨­å? API Key ?èƒ½ä½¿ç”¨ AI è¨ºæ–·"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      // Step 1: Technical + Verdict
      setStep("?œå??¡åƒ¹?‡æ?è¡“æ?æ¨™â€?);
      const techText = await callAI(`ä½ æ˜¯?°è‚¡é¦–å¸­?†æ?å¸«ã€‚ç”¨?¶æŸ¥è©¢ï???{searchQ}??

è«‹æ?å°‹é€™æ??¡ç¥¨?€?°è??™ï??´æ ¼?‰ä»¥ä¸‹æ ¼å¼å?ç­”ï?ç¹é?ä¸­æ?ï¼‰ï?

?? ?¡ç¥¨ï¼š[?ç¨±] ([ä»??])
?’° ?¡åƒ¹ï¼š[?€?°æ”¶?¤åƒ¹] ?ƒï?[æ¼²è??‘é?] / [æ¼²è?å¹?]ï¼?
?? ?€è¡“é¢ï¼šKD=[K?¼]/[D?¼]ï¼ˆ[?€?‹]ï¼‰ã€RSI=[?¸å€¼]?MACD=[ç´…æŸ±/ç¶ æŸ±]
?? ?‡ç?ï¼švs 5??20??60?¥å?ç·šï?ç«™ä??–è??´ï?
?¦ æ³•äººï¼šå?è³‡[è²·è?/è³??]?æ?ä¿¡[è²·è?/è³??]ï¼ˆè?5?¥ç´¯è¨ˆï?

===== è¨ºæ–·çµè? =====
?¯ ?¤å?ï¼šã€è²·?²ã€‘æ??è³£?ºã€‘æ??è??›ã€‘ï?ä¸‰é¸ä¸€ï¼Œå??ˆæ?ç¢ºï?
?’ª ä¿¡å?åº¦ï?[é«?ä¸?ä½]
?? ä¸€?¥è©±?†ç”±ï¼š[?ºä?éº¼æ?è©²è²·?–è³£]
?¯ å»ºè­°ç­–ç•¥ï¼š[?·é??ä?ï¼Œä?å¦‚ã€Œå??¹è²·?²ï??œæ?è¨­åœ¨XX?ƒã€]
? ï? ?€å¤§é¢¨?ªï?[ä¸»è?é¢¨éšª]`, apiKey.key, apiKey.provider);

      // Step 2: Financial report
      setStep("?†æ?è²¡å ±?¸æ???);
      const finText = await callAI(`ä½ æ˜¯?°è‚¡è²¡å ±?†æ?å¸«ã€‚è??œå???{searchQ}?é€™æ??¡ç¥¨?„æ??°è²¡?±æ•¸?šã€?

è«‹åš´?¼æ??§ä»¥ä¸‹æ ¼å¼å?ç­”ï?æ¯é?çµ¦å‡º 0-100 ?„è??†ï?

?? è²¡å ±?¥æª¢çµæ?ï¼?

1ï¸âƒ£ ?Ÿæ”¶?é•·??[è©•å?]/100
   - è¿‘å?å­???¶å¹´å¢ç?ï¼š[?¸æ?]
   - è¶¨å‹¢ï¼š[????é•·/è¡°é€€/?å¹³]

2ï¸âƒ£ ?²åˆ©?½å? EPS [è©•å?]/100
   - è¿‘å?å­?EPSï¼š[?¸æ?]
   - å¹´å??‡ï?[?¸æ?]

3ï¸âƒ£ æ¯›åˆ©?‡è¡¨??[è©•å?]/100
   - ?€?°æ??©ç?ï¼š[?¸æ?]%
   - vs ?Œæ¥­å¹³å?ï¼š[é«˜æ–¼/ä½æ–¼]

4ï¸âƒ£ ?¡æ±æ¬Šç? ROE [è©•å?]/100
   - ?€??ROEï¼š[?¸æ?]%
   - è¶¨å‹¢ï¼š[?¹å?/?¡å?/ç©©å?]

5ï¸âƒ£ è²¡å?é«”è³ªï¼ˆè??µæ?ï¼‰[è©•å?]/100
   - è² å‚µæ¯”ç?ï¼š[?¸æ?]%
   - æµå?æ¯”ç?ï¼š[?¸æ?]%

?? è²¡å ±ç¸½è?ï¼š[???¥è©±ç¸½ç??™å®¶?¬å¸?„è²¡?™ç?æ³ï??¯å¦?¼å??•è?]`, apiKey.key, apiKey.provider);

      // Step 3: News
      setStep("?œå??€?°ç›¸?œæ–°?â€?);
      const newsText = await callAI(`?œå???{searchQ}?å°???€è¿‘ä??±ç??è??°è?ï¼Œæ‰¾??3-5 ?‡æ??œéµ?„æ–°?ã€?

è«‹åš´?¼æ?ä»¥ä??¼å??ç?ï¼ˆç?é«”ä¸­?‡ï?ï¼?

?“° ?€?°æ??¯ï?è¿‘ä??±ï?

?”´/?Ÿ¢ [?©å?/?©ç©º] [?°è?æ¨™é??˜è?]
   ??å½±éŸ¿ï¼š[å°è‚¡?¹ç??¯èƒ½å½±éŸ¿ï¼??¥è©±]

?”´/?Ÿ¢ [?©å?/?©ç©º] [?°è?æ¨™é??˜è?]
   ??å½±éŸ¿ï¼š[å°è‚¡?¹ç??¯èƒ½å½±éŸ¿ï¼??¥è©±]

ï¼ˆå???3-5 ?‡ï?

?? ?°è??¢ç¸½è©•ï??´é??[?©å?/?©ç©º/ä¸­æ€§]ï¼Œ[1?¥è©±èªªæ?]`, apiKey.key, apiKey.provider);

      const verdict = parseVerdict(techText);
      const info = parseStockInfo(techText);
      const finScores = parseFinancialScores(finText);
      setResult({ query: searchQ, techText, finText, newsText, verdict, ...info, finScores, time: new Date() });
      setHistory(h => [{ query: searchQ, verdict, time: new Date().toISOString() }, ...h.slice(0, 14)]);
    } catch (e) {
      const msg = e.message === "NO_KEY" ? "è«‹å?è¨­å? API Key" : e.message || "???å¤±æ?ï¼Œè?ç¨å??è©¦";
      setResult({ query: searchQ, techText: msg, finText: "", newsText: "", verdict: "è§€??, time: new Date() });
    }
    setLoading(false); setStep("");
  };

  const verdictColors = { "å¼·å?è²·é€?: "#dc2626", "è²·é€?: "#ef4444", "è§€??: "#f59e0b", "è³?‡º": "#22c55e", "å¼·å?è³?‡º": "#16a34a" };
  const quickStocks = ["?°ç???, "é´»æµ·", "?¯ç™¼ç§?, "å»??", "ç·¯å‰µ", "å¯Œé‚¦??, "?·æ¦®", "?¯ç¢©"];
  const [openSection, setOpenSection] = useState({ tech: true, fin: true, news: true });

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
      {/* Search bar */}
      <div style={{ padding: "16px 16px 12px", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>??</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e5e5e5" }}>?‹è‚¡ AI ?¨é¢è¨ºæ–·</div>
            <div style={{ fontSize: 14, color: "#ccc" }}>?€è¡“é¢ + è²¡å ±?¥æª¢ + ?³æ??°è?ï¼Œä??ˆä??†æ?</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="è¼¸å…¥?¡ç¥¨ä»???–å?ç¨±ï?ä¾‹ï?2330?å°ç©é›»"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#e5e5e5", fontSize: 18, outline: "none" }} />
          <button onClick={() => search()} disabled={loading}
            style={{ background: loading ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 17, fontWeight: 600, cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap" }}>
            {loading ? "?†æ?ä¸­â€? : "?¨é¢è¨ºæ–·"}
          </button>
        </div>
      </div>

      {/* Quick picks */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", gap: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: "#aaa", lineHeight: "24px" }}>å¿«æŸ¥ï¼?/span>
        {quickStocks.map(s => (
          <button key={s} onClick={() => { setQuery(s); search(s); }}
            style={{ padding: "2px 8px", borderRadius: 8, fontSize: 14, border: "1px solid #222", background: "#141414", color: "#ddd", cursor: "pointer" }}>{s}</button>
        ))}
      </div>

      {/* No API Key warning */}
      {!apiKey.hasKey && !loading && !result && (
        <div style={{ margin: "12px 16px", padding: 16, background: "#1a1510", border: "1px solid #f59e0b44", borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>??</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", marginBottom: 6 }}>?€è¦è¨­å®?API Key</div>
          <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7 }}>
            AI è¨ºæ–·?Ÿèƒ½?€è¦?Anthropic API Key??br/>
            è«‹é??³ä?è§??™ï? ?²è?è¨­å???
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ margin: "8px 16px", padding: 12, background: "#2a1515", border: "1px solid #dc2626", borderRadius: 8, fontSize: 14, color: "#fca5a5" }}>
          ??{error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: 36, textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #222", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ marginTop: 12, fontSize: 17, color: "#ddd" }}>{step}</div>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 4 }}>
            {["?€è¡“é¢", "è²¡å ±", "?°è?"].map((s, i) => (
              <div key={s} style={{ padding: "2px 8px", borderRadius: 8, fontSize: 14,
                background: step.includes("?€è¡?) && i === 0 ? "#f97316" + "30" : step.includes("è²¡å ±") && i === 1 ? "#f97316" + "30" : step.includes("?°è?") && i === 2 ? "#f97316" + "30" : "#1a1a1a",
                color: step.includes("?€è¡?) && i === 0 ? "#f97316" : step.includes("è²¡å ±") && i === 1 ? "#f97316" : step.includes("?°è?") && i === 2 ? "#f97316" : "#444" }}>{s}</div>
            ))}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div style={{ padding: 14 }}>
          {/* Verdict */}
          <VerdictCard verdict={result.verdict} stockName={result.stockName} price={result.price} change={result.change} />

          {/* Add to watchlist button */}
          <button onClick={() => watchlist.add({ id: result.query, name: result.stockName || result.query, verdict: result.verdict, time: new Date().toISOString(), techText: result.techText, finText: result.finText })}
            disabled={watchlist.has(result.query)}
            style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid #333", background: watchlist.has(result.query) ? "#1a1a1a" : "#141414", color: watchlist.has(result.query) ? "#555" : "#f59e0b", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 12 }}>
            {watchlist.has(result.query) ? "??å·²å??¥è‡ª?¸è‚¡" : "â­?? å…¥?ªé¸?¡è¿½è¹?}
          </button>

          {/* Financial Score Rings */}
          {result.finScores && Object.keys(result.finScores).length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", marginBottom: 12, background: "#0d0d0d", borderRadius: 10, border: "1px solid #1a1a1a" }}>
              {[["revenue","?Ÿæ”¶"], ["eps","EPS"], ["margin","æ¯›åˆ©"], ["roe","ROE"], ["debt","é«”è³ª"]].map(([k, l]) => (
                <ScoreRing key={k} score={result.finScores[k] || 50} label={l} />
              ))}
            </div>
          )}

          {/* Collapsible sections */}
          {[
            { key: "tech", icon: "??", title: "?€è¡“é¢ + è²·è³£?¤å?", content: result.techText },
            { key: "fin", icon: "??", title: "è²¡å ±?¥æª¢", content: result.finText },
            { key: "news", icon: "?“°", title: "?³æ??°è? AI è§??", content: result.newsText },
          ].filter(s => s.content).map(section => (
            <div key={section.key} style={{ marginBottom: 8 }}>
              <button onClick={() => setOpenSection(prev => ({ ...prev, [section.key]: !prev[section.key] }))}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: openSection[section.key] ? "8px 8px 0 0" : 8, color: "#ccc", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                <span>{section.icon} {section.title}</span>
                <span style={{ fontSize: 14, color: "#bbb" }}>{openSection[section.key] ? "?? : "??}</span>
              </button>
              {openSection[section.key] && (
                <div style={{ background: "#0a0a0a", borderRadius: "0 0 8px 8px", padding: 12, fontSize: 16, lineHeight: 1.9, color: "#bbb", whiteSpace: "pre-wrap", wordBreak: "break-word", borderLeft: "3px solid #f97316", maxHeight: 350, overflowY: "auto" }}>
                  {section.content}
                </div>
              )}
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => search(result.query)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#ddd", fontSize: 15, cursor: "pointer" }}>?? ?æ–°?†æ?</button>
            <button onClick={() => setResult(null)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#ddd", fontSize: 15, cursor: "pointer" }}>?? ?¥è©¢?¶ä?</button>
          </div>
          <div style={{ marginTop: 6, padding: "5px 10px", background: "#0a0a0a", borderRadius: 6, fontSize: 13, color: "#999", textAlign: "center" }}>
            ? ï? AI ?†æ??…ä?å­¸ç??ƒè€ƒï?ä¸æ??æ?è³‡å»ºè­°ã€‚æ?è³‡æ?é¢¨éšªï¼Œè??ªè??¤æ–·??
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && !loading && !result && (
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: "#aaa" }}>?¥è©¢ç´€??/span>
            <button onClick={() => { setHistory([]); localStorage.removeItem("tw-stock-history"); }}
              style={{ fontSize: 13, color: "#999", background: "none", border: "none", cursor: "pointer" }}>æ¸…é™¤</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {history.map((h, i) => (
              <button key={i} onClick={() => { setQuery(h.query); search(h.query); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", borderRadius: 6, border: "1px solid #1a1a1a", background: "#0d0d0d", color: "#ddd", cursor: "pointer", fontSize: 15, textAlign: "left" }}>
                <span>{h.query}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: verdictColors[h.verdict] || "#888", padding: "1px 6px", borderRadius: 4, background: (verdictColors[h.verdict] || "#888") + "15" }}>{h.verdict}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====================================
// TAB 2: ?ªé¸?¡è¿½è¹?
// ====================================
function TabWatchlist({ watchlist, apiKey }) {
  const [refreshing, setRefreshing] = useState(null);

  const refresh = async (item) => {
    setRefreshing(item.id);
    try {
      const text = await callAI(`ä½ æ˜¯?°è‚¡?†æ?å¸«ã€‚è??œå???{item.name || item.id}?ç??€?°è‚¡?¹è?ä»Šæ—¥æ¼²è?å¹…ï?ä»¥å??®å?è©²è²·?²é??¯è³£?ºã€?

?¨ä»¥ä¸‹æ ¼å¼ç°¡?­å?ç­”ï?ç¹é?ä¸­æ?ï¼‰ï?
?’° [?¡åƒ¹] ?ƒï?[æ¼²è?å¹?]ï¼?
?¯ ?¤å?ï¼šã€è²·??è³?‡º/è§€?›ã€?
?? [ä¸€?¥è©±?†ç”±]`, apiKey.key, apiKey.provider);
      const verdict = parseVerdict(text);
      watchlist.update(item.id, { latestInfo: text, verdict, lastRefresh: new Date().toISOString() });
    } catch {}
    setRefreshing(null);
  };

  const refreshAll = async () => {
    for (const item of watchlist.list) {
      await refresh(item);
    }
  };

  const verdictColors = { "å¼·å?è²·é€?: "#dc2626", "è²·é€?: "#ef4444", "è§€??: "#f59e0b", "è³?‡º": "#22c55e", "å¼·å?è³?‡º": "#16a34a" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>â­??ªé¸?¡è¿½è¹?({watchlist.list.length})</div>
        {watchlist.list.length > 0 && (
          <button onClick={refreshAll} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: "#f59e0b", fontSize: 15, cursor: "pointer" }}>
            ?? ?¨éƒ¨?´æ–°
          </button>
        )}
      </div>

      {watchlist.list.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>â­?/div>
          <div style={{ fontSize: 17, color: "#ccc", marginBottom: 4 }}>?„æ??‰è‡ª?¸è‚¡</div>
          <div style={{ fontSize: 15, color: "#aaa" }}>?°ã€Œå€‹è‚¡è¨ºæ–·?æŸ¥è©¢å?ï¼Œé??Œå??¥è‡ª?¸è‚¡?å³?¯è¿½è¹?/div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {watchlist.list.map(item => (
            <div key={item.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{item.name || item.id}</span>
                  {item.verdict && (
                    <span style={{ fontSize: 14, fontWeight: 600, padding: "2px 8px", borderRadius: 6, color: verdictColors[item.verdict] || "#888", background: (verdictColors[item.verdict] || "#888") + "15" }}>
                      {item.verdict}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => refresh(item)} disabled={refreshing === item.id}
                    style={{ padding: "3px 8px", borderRadius: 4, border: "1px solid #222", background: "#0d0d0d", color: "#ddd", fontSize: 14, cursor: "pointer" }}>
                    {refreshing === item.id ? "?? : "??"}
                  </button>
                  <button onClick={() => watchlist.remove(item.id)}
                    style={{ padding: "3px 8px", borderRadius: 4, border: "1px solid #222", background: "#0d0d0d", color: "#bbb", fontSize: 14, cursor: "pointer" }}>??/button>
                </div>
              </div>
              {item.latestInfo && (
                <div style={{ fontSize: 15, lineHeight: 1.7, color: "#aaa", whiteSpace: "pre-wrap", background: "#0a0a0a", borderRadius: 6, padding: 8 }}>
                  {item.latestInfo}
                </div>
              )}
              {item.lastRefresh && (
                <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
                  ä¸Šæ¬¡?´æ–°ï¼š{new Date(item.lastRefresh).toLocaleString("zh-TW")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====================================
// TAB 3/4: è²·é€?/ è³?‡ºæ¸…å–®
// ====================================
function TabList({ mode, watchlist }) {
  const [sector, setSector] = useState("?¨éƒ¨");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const sectors = ["?¨éƒ¨", ...Array.from(new Set(STOCKS.map(s => s.sector)))];
  const enriched = STOCKS.map(s => {
    const sig = getSignal(s);
    const change = s.price - s.prev;
    const pct = ((change / s.prev) * 100).toFixed(2);
    return { ...s, ...sig, change: change.toFixed(2), pct, isUp: change > 0 };
  });
  const filtered = enriched.filter(s => {
    if (sector !== "?¨éƒ¨" && s.sector !== sector) return false;
    if (search && !s.name.includes(search) && !s.id.includes(search)) return false;
    if (mode === "buy" && s.score < 0) return false;
    if (mode === "sell" && s.score >= 0) return false;
    return true;
  }).sort((a, b) => {
    const k = { score: "score", change: "pct", volume: "volume", pe: "pe", dy: "dy" };
    const av = parseFloat(a[k[sortKey]] ?? a.price);
    const bv = parseFloat(b[k[sortKey]] ?? b.price);
    return sortDir === "desc" ? bv - av : av - bv;
  });
  const toggleSort = k => { if (sortKey === k) setSortDir(d => d === "desc" ? "asc" : "desc"); else { setSortKey(k); setSortDir("desc"); } };

  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="?œå?ä»??/?ç¨±"
          style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, padding: "6px 10px", color: "#e5e5e5", fontSize: 16, outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {sectors.map(s => (
          <button key={s} onClick={() => setSector(s)}
            style={{ padding: "2px 8px", fontSize: 14, borderRadius: 8, border: sector === s ? "1px solid #333" : "1px solid #1a1a1a", cursor: "pointer", background: sector === s ? "#1f1f1f" : "#0d0d0d", color: sector === s ? "#e5e5e5" : "#555" }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {[["score","è¨Šè?"], ["change","æ¼²è?"], ["volume","??], ["pe","PE"], ["dy","æ®–åˆ©??]].map(([k, l]) => (
          <button key={k} onClick={() => toggleSort(k)}
            style={{ padding: "2px 8px", fontSize: 14, borderRadius: 4, border: sortKey === k ? "1px solid #333" : "1px solid transparent", background: sortKey === k ? "#1a1a1a" : "transparent", color: sortKey === k ? "#ccc" : "#444", cursor: "pointer" }}>
            {l}{sortKey === k ? (sortDir === "desc" ? "?? : "??) : ""}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 16 }}>?¡ç¬¦?ˆæ?ä»¶ç??¡ç¥¨</div>}
        {filtered.map(stock => {
          const open = selected === stock.id;
          const ti = stock.foreignBuy + stock.trustBuy + stock.dealerBuy;
          return (
            <div key={stock.id} onClick={() => setSelected(open ? null : stock.id)}
              style={{ background: open ? "#151515" : "#0f0f0f", border: `1px solid ${open ? "#2a2a2a" : "#181818"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: stock.color, flexShrink: 0 }} />
                <div style={{ minWidth: 52 }}>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{stock.name}</div>
                  <div style={{ fontSize: 14, color: "#bbb" }}>{stock.id}</div>
                </div>
                <Spark stock={stock} />
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: stock.isUp ? "#ef4444" : "#22c55e" }}>{stock.price}</div>
                  <div style={{ fontSize: 14, color: stock.isUp ? "#ef4444" : "#22c55e" }}>{stock.isUp ? "+" : ""}{stock.pct}%</div>
                </div>
                <div style={{ padding: "3px 8px", borderRadius: 6, fontSize: 14, fontWeight: 600, background: stock.color + "15", color: stock.color, whiteSpace: "nowrap" }}>{stock.signal}</div>
              </div>
              {open && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e1e1e" }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <GaugeBar label="K" value={stock.k} zones={[{ from: 0, to: 20, color: "#22c55e" }, { from: 20, to: 80, color: "#f97316" }, { from: 80, to: 100, color: "#ef4444" }]} />
                    <GaugeBar label="D" value={stock.d} zones={[{ from: 0, to: 20, color: "#22c55e" }, { from: 20, to: 80, color: "#f97316" }, { from: 80, to: 100, color: "#ef4444" }]} />
                    <GaugeBar label="RSI" value={stock.rsi} zones={[{ from: 0, to: 30, color: "#22c55e" }, { from: 30, to: 70, color: "#a3a3a3" }, { from: 70, to: 100, color: "#ef4444" }]} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 10 }}>
                    {[["å¤–è?", stock.foreignBuy], ["?•ä¿¡", stock.trustBuy], ["?ªç?", stock.dealerBuy], ["?ˆè?", ti]].map(([l, v]) => (
                      <div key={l} style={{ background: "#0a0a0a", borderRadius: 6, padding: "5px 6px", textAlign: "center" }}>
                        <div style={{ fontSize: 13, color: "#bbb" }}>{l}</div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: v > 0 ? "#ef4444" : v < 0 ? "#22c55e" : "#666" }}>{v > 0 ? "+" : ""}{(v / 1000).toFixed(1)}k</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {stock.reasons.map((r, i) => <span key={i} style={{ padding: "2px 6px", borderRadius: 6, fontSize: 13, background: "#141414", color: "#ccc", border: "1px solid #1e1e1e" }}>{r}</span>)}
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                    <button onClick={() => watchlist.add({ id: stock.id, name: stock.name, verdict: stock.signal })}
                      disabled={watchlist.has(stock.id)}
                      style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: watchlist.has(stock.id) ? "#555" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                      {watchlist.has(stock.id) ? "??å·²è¿½è¹? : "â­?? å…¥?ªé¸"}
                    </button>
                    <span style={{ fontSize: 14, color: "#999", lineHeight: "24px" }}>??{stock.volume.toLocaleString()} å¼?Â· {stock.sector}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ====================================
// MAIN APP
// ====================================
export default function App() {
  const [tab, setTab] = useState("search");
  const [showSettings, setShowSettings] = useState(false);
  const [now] = useState(new Date());
  const watchlist = useWatchlist();
  const apiKey = useApiKey();

  const enriched = STOCKS.map(s => ({ ...s, ...getSignal(s) }));
  const buyCount = enriched.filter(s => s.score >= 0).length;
  const sellCount = enriched.filter(s => s.score < 0).length;
  const strongBuy = enriched.filter(s => s.score >= 3).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', 'Noto Sans TC', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 16px 12px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>?°è‚¡?·é?</span>
            <span style={{ fontSize: 14, color: "#aaa" }}>v4.1</span>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => setShowSettings(!showSettings)}
                style={{ background: apiKey.hasKey ? "#1a1a1a" : "#2a1510", border: `1px solid ${apiKey.hasKey ? "#333" : "#f59e0b"}`, borderRadius: 8, padding: "6px 12px", color: apiKey.hasKey ? "#ccc" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                ?™ï? {apiKey.hasKey ? "å·²è¨­å®? : "è¨­å? API Key"}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#aaa" }}>{now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })} Â· AI ?¨é¢è¨ºæ–·</div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* Market cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, margin: "12px 0" }}>
          {[
            { label: "? æ??‡æ•¸", val: "47,183", sub: "??0.16%", col: "#ef4444" },
            { label: "?¯è²·??, val: `${buyCount}`, sub: `${strongBuy} å¼·è²·`, col: "#ef4444" },
            { label: "?‰è³£??, val: `${sellCount}`, sub: "æ³¨æ?æ¸›ç¢¼", col: "#22c55e" },
            { label: "?ªé¸??, val: `${watchlist.list.length}`, sub: "è¿½è¹¤ä¸?, col: "#f59e0b" },
          ].map((c, i) => (
            <div key={i} style={{ background: "#111", borderRadius: 8, padding: "7px 8px", border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 12, color: "#bbb" }}>{c.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.col }}>{c.val}</div>
              <div style={{ fontSize: 13, color: "#bbb" }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 3, marginBottom: 14, border: "1px solid #1a1a1a", gap: 2 }}>
          {[
            { key: "search", icon: "??", label: "è¨ºæ–·" },
            { key: "watchlist", icon: "â­?, label: `?ªé¸${watchlist.list.length > 0 ? ` ${watchlist.list.length}` : ""}` },
            { key: "buy", icon: "??", label: "è²·é€? },
            { key: "sell", icon: "??", label: "è³?‡º" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: "7px 2px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 15, fontWeight: tab === t.key ? 600 : 400, transition: "all 0.2s",
                background: tab === t.key ? "#1f1f1f" : "transparent",
                color: tab === t.key ? (t.key === "sell" ? "#22c55e" : t.key === "buy" ? "#ef4444" : t.key === "watchlist" ? "#f59e0b" : "#f97316") : "#555" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        {showSettings && <SettingsPanel apiKey={apiKey} onClose={() => setShowSettings(false)} />}

        {/* Tab content */}
        {tab === "search" && <TabDiagnosis watchlist={watchlist} apiKey={apiKey} />}
        {tab === "watchlist" && <TabWatchlist watchlist={watchlist} apiKey={apiKey} />}
        {tab === "buy" && <TabList mode="buy" watchlist={watchlist} />}
        {tab === "sell" && <TabList mode="sell" watchlist={watchlist} />}

        {/* Footer */}
        <div style={{ marginTop: 20, padding: 12, background: "#0d0d0d", borderRadius: 10, border: "1px solid #151515" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#aaa", marginBottom: 4 }}>?? ?†æ??¹æ?</div>
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>
            ?­ç¶­ç¶œå?è©•å?ï¼ˆKD/RSI/MACD/?‡ç?/æ³•äºº/ä¼°å€¼ï?ï¼?AI ?³æ?è²¡å ±?¥æª¢ï¼ˆç??¶æ???EPS/æ¯›åˆ©??ROE/è² å‚µæ¯”ï?ï¼??³æ??°è? AI è§???©å??©ç©º?‚è‡ª?¸è‚¡è¿½è¹¤?²å??¼ç€è¦½?¨ã€‚æ??‰å…§å®¹å?ä¾›å??ƒï?ä¸æ??æ?è³‡å»ºè­°ã€?
          </div>
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#777" }}>?°è‚¡?·é? v4.1 Â© 2026</div>
      </div>
    </div>
  );
}
