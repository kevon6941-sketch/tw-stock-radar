import { useState, useEffect, useRef, useCallback } from "react";

// --- Data ---
const STOCKS = [
  { id: "2330", name: "台積電", sector: "半導體", price: 2445, prev: 2410, volume: 38420, pe: 28.5, dy: 1.8, k: 72, d: 65, rsi: 68, macd: 12.5, foreignBuy: 8500, trustBuy: 1200, dealerBuy: -300, ma5: 2420, ma20: 2380, ma60: 2310 },
  { id: "2317", name: "鴻海", sector: "電子代工", price: 235, prev: 231, volume: 52100, pe: 12.1, dy: 4.2, k: 78, d: 70, rsi: 71, macd: 3.2, foreignBuy: 12000, trustBuy: 3500, dealerBuy: 800, ma5: 232, ma20: 225, ma60: 218 },
  { id: "2454", name: "聯發科", sector: "IC設計", price: 1890, prev: 1870, volume: 5800, pe: 22.3, dy: 2.5, k: 65, d: 60, rsi: 62, macd: 8.7, foreignBuy: 2100, trustBuy: 600, dealerBuy: 200, ma5: 1875, ma20: 1840, ma60: 1790 },
  { id: "2382", name: "廣達", sector: "AI伺服器", price: 385, prev: 378, volume: 28300, pe: 18.7, dy: 2.8, k: 82, d: 74, rsi: 75, macd: 5.1, foreignBuy: 6200, trustBuy: 4800, dealerBuy: 1100, ma5: 380, ma20: 365, ma60: 340 },
  { id: "3231", name: "緯創", sector: "AI伺服器", price: 148, prev: 145, volume: 45600, pe: 15.2, dy: 3.1, k: 70, d: 63, rsi: 66, macd: 2.8, foreignBuy: 5500, trustBuy: 3200, dealerBuy: 600, ma5: 146, ma20: 140, ma60: 132 },
  { id: "2308", name: "台達電", sector: "電源/散熱", price: 465, prev: 460, volume: 8900, pe: 30.1, dy: 1.5, k: 58, d: 55, rsi: 57, macd: 1.9, foreignBuy: 1800, trustBuy: 900, dealerBuy: -100, ma5: 462, ma20: 455, ma60: 440 },
  { id: "2881", name: "富邦金", sector: "金融", price: 98.5, prev: 97.8, volume: 22100, pe: 11.2, dy: 4.8, k: 55, d: 52, rsi: 54, macd: 0.8, foreignBuy: 3200, trustBuy: 500, dealerBuy: 200, ma5: 97.5, ma20: 95, ma60: 92 },
  { id: "2882", name: "國泰金", sector: "金融", price: 72.3, prev: 71.5, volume: 31500, pe: 10.8, dy: 5.1, k: 60, d: 56, rsi: 58, macd: 0.6, foreignBuy: 4100, trustBuy: 800, dealerBuy: 300, ma5: 71.8, ma20: 69.5, ma60: 67 },
  { id: "2603", name: "長榮", sector: "航運", price: 225, prev: 228, volume: 18900, pe: 8.5, dy: 6.2, k: 35, d: 42, rsi: 38, macd: -3.2, foreignBuy: -5200, trustBuy: -1800, dealerBuy: -400, ma5: 230, ma20: 238, ma60: 245 },
  { id: "3661", name: "世芯-KY", sector: "IC設計", price: 3850, prev: 3780, volume: 2100, pe: 35.2, dy: 0.8, k: 75, d: 68, rsi: 72, macd: 45.2, foreignBuy: 850, trustBuy: 320, dealerBuy: 150, ma5: 3800, ma20: 3700, ma60: 3550 },
  { id: "2345", name: "智邦", sector: "網通", price: 680, prev: 672, volume: 6200, pe: 25.8, dy: 1.9, k: 68, d: 62, rsi: 65, macd: 6.3, foreignBuy: 1500, trustBuy: 2100, dealerBuy: 300, ma5: 675, ma20: 660, ma60: 635 },
  { id: "6669", name: "緯穎", sector: "AI伺服器", price: 2180, prev: 2150, volume: 1800, pe: 20.5, dy: 2.2, k: 72, d: 66, rsi: 69, macd: 18.5, foreignBuy: 600, trustBuy: 450, dealerBuy: 80, ma5: 2160, ma20: 2100, ma60: 2020 },
  { id: "2409", name: "友達", sector: "面板", price: 22.8, prev: 22.3, volume: 95000, pe: 15.5, dy: 3.5, k: 80, d: 72, rsi: 74, macd: 0.4, foreignBuy: 28000, trustBuy: 5000, dealerBuy: 1200, ma5: 22.5, ma20: 21.5, ma60: 20.8 },
  { id: "3481", name: "群創", sector: "面板", price: 18.6, prev: 18.2, volume: 88000, pe: 14.2, dy: 3.8, k: 76, d: 70, rsi: 70, macd: 0.3, foreignBuy: 22000, trustBuy: 4200, dealerBuy: 900, ma5: 18.3, ma20: 17.5, ma60: 16.8 },
  { id: "2002", name: "中鋼", sector: "鋼鐵", price: 26.5, prev: 26.8, volume: 35200, pe: 18.5, dy: 4.5, k: 30, d: 38, rsi: 35, macd: -0.5, foreignBuy: -8500, trustBuy: -2100, dealerBuy: -600, ma5: 27, ma20: 27.8, ma60: 28.5 },
  { id: "2912", name: "統一超", sector: "零售", price: 310, prev: 308, volume: 3200, pe: 27.5, dy: 3.0, k: 52, d: 50, rsi: 51, macd: 0.5, foreignBuy: 400, trustBuy: 200, dealerBuy: 50, ma5: 309, ma20: 305, ma60: 300 },
  { id: "2357", name: "華碩", sector: "品牌PC", price: 620, prev: 612, volume: 4500, pe: 14.8, dy: 4.0, k: 70, d: 64, rsi: 67, macd: 5.8, foreignBuy: 1800, trustBuy: 1500, dealerBuy: 400, ma5: 615, ma20: 600, ma60: 580 },
  { id: "6770", name: "力積電", sector: "晶圓代工", price: 35.5, prev: 34.8, volume: 72000, pe: 45.2, dy: 0.5, k: 85, d: 78, rsi: 78, macd: 0.8, foreignBuy: 18000, trustBuy: 6500, dealerBuy: 2200, ma5: 35, ma20: 33.5, ma60: 31 },
];

function getSignal(s) {
  let score = 0, reasons = [];
  if (s.k > 80 && s.k > s.d) { score -= 1; reasons.push("KD高檔過熱"); }
  else if (s.k < 20 && s.k < s.d) { score += 2; reasons.push("KD低檔超賣"); }
  else if (s.k > s.d && s.k < 80) { score += 1; reasons.push("KD黃金交叉"); }
  else if (s.k < s.d && s.k > 20) { score -= 1; reasons.push("KD死亡交叉"); }
  if (s.rsi > 70) { score -= 1; reasons.push("RSI過買"); }
  else if (s.rsi < 30) { score += 2; reasons.push("RSI超賣反彈"); }
  else if (s.rsi > 50) { score += 0.5; reasons.push("RSI偏多"); }
  if (s.macd > 0) { score += 1; reasons.push("MACD紅柱"); }
  else { score -= 1; reasons.push("MACD綠柱"); }
  if (s.price > s.ma5 && s.price > s.ma20) { score += 1; reasons.push("站穩均線之上"); }
  else if (s.price < s.ma5 && s.price < s.ma20) { score -= 1; reasons.push("跌破均線支撐"); }
  const ti = s.foreignBuy + s.trustBuy + s.dealerBuy;
  if (ti > 5000) { score += 1; reasons.push("法人買超"); }
  else if (ti < -5000) { score -= 1; reasons.push("法人賣超"); }
  if (s.pe < 12) { score += 0.5; reasons.push("低本益比"); }
  else if (s.pe > 30) { score -= 0.5; reasons.push("高本益比"); }
  if (s.dy > 4) { score += 0.5; reasons.push("高殖利率"); }
  let signal, color;
  if (score >= 3) { signal = "強力買進"; color = "#dc2626"; }
  else if (score >= 1.5) { signal = "建議買進"; color = "#ef4444"; }
  else if (score >= 0) { signal = "中性觀望"; color = "#a3a3a3"; }
  else if (score >= -1.5) { signal = "建議賣出"; color = "#22c55e"; }
  else { signal = "強力賣出"; color = "#16a34a"; }
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
    "強力買進": { icon: "🔥", bg: "linear-gradient(135deg, #7f1d1d, #991b1b)", border: "#dc2626", color: "#fca5a5", sub: "技術面與籌碼面高度偏多，短線有強勢上攻動能" },
    "買進": { icon: "📈", bg: "linear-gradient(135deg, #1a1a1a, #2a1515)", border: "#ef4444", color: "#ef4444", sub: "多項指標偏多，可考慮逢低分批佈局" },
    "觀望": { icon: "⏸️", bg: "linear-gradient(135deg, #1a1a1a, #1a1a1a)", border: "#f59e0b", color: "#f59e0b", sub: "多空訊號交雜，建議等待方向明確再進場" },
    "賣出": { icon: "📉", bg: "linear-gradient(135deg, #1a1a1a, #0d1f0d)", border: "#22c55e", color: "#22c55e", sub: "技術面轉弱或估值偏高，可考慮獲利了結或減碼" },
    "強力賣出": { icon: "🚨", bg: "linear-gradient(135deg, #052e16, #14532d)", border: "#16a34a", color: "#86efac", sub: "多項指標高度偏空，建議盡速減碼避險" },
  };
  const v = map[verdict] || map["觀望"];
  return (
    <div style={{ background: v.bg, border: `2px solid ${v.border}`, borderRadius: 12, padding: "16px 16px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 36 }}>{v.icon}</span>
          <div>
            <div style={{ fontSize: 14, color: "#ddd" }}>AI 診斷結論</div>
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
  if (/強力買進|強烈買進|積極買進/.test(text)) return "強力買進";
  if (/強力賣出|強烈賣出|積極賣出/.test(text)) return "強力賣出";
  const buy = (text.match(/買進|買入|做多|看多|偏多|建議買|可以買|逢低布局|逢低佈局|加碼|有利買方/g) || []).length;
  const sell = (text.match(/賣出|做空|看空|偏空|建議賣|減碼|獲利了結|出場|應賣|宜賣/g) || []).length;
  const hold = (text.match(/觀望|中性|持平|等待|暫時不宜|不建議進場|靜待/g) || []).length;
  if (buy > sell && buy > hold) return buy >= 3 ? "強力買進" : "買進";
  if (sell > buy && sell > hold) return sell >= 3 ? "強力賣出" : "賣出";
  return "觀望";
}
function parseStockInfo(text) {
  let stockName = null, price = null, change = null;
  const nm = text.match(/(?:📊|股票|個股)[^\n]*?([^\s(（]+)\s*[（(](\d{4})[)）]/);
  if (nm) stockName = `${nm[1]} (${nm[2]})`;
  const pm = text.match(/(?:💰|股價|收盤|最新)[^\n]*?(\d+(?:\.\d+)?)\s*元/);
  if (pm) price = pm[1] + " 元";
  const cm = text.match(/[漲跌][^\n]*?([+-]?\d+(?:\.\d+)?%)/);
  if (cm) change = cm[1];
  return { stockName, price, change };
}
function parseFinancialScores(text) {
  const scores = {};
  const items = [
    { key: "revenue", label: "營收成長", patterns: [/營收[成長增長][^\n]*?(\d+)/] },
    { key: "eps", label: "EPS", patterns: [/EPS[^\n]*?(\d+)/] },
    { key: "margin", label: "毛利率", patterns: [/毛利率[^\n]*?(\d+)/] },
    { key: "roe", label: "ROE", patterns: [/ROE[^\n]*?(\d+)/] },
    { key: "debt", label: "負債比", patterns: [/負債[比率][^\n]*?(\d+)/] },
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
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }),
    });
    if (!resp.ok) { const err = await resp.json().catch(() => ({})); throw new Error(err?.error?.message || "API error " + resp.status); }
    const data = await resp.json();
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
      await callAI("回答兩個字：成功", input, apiKey.provider);
      setTestResult({ ok: true, msg: "✅ 驗證成功！可以開始使用 AI 診斷了。" });
      apiKey.save(input);
    } catch (e) {
      setTestResult({ ok: false, msg: "❌ 驗證失敗：" + e.message });
    }
    setTesting(false);
  };

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>⚙️ API 設定</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#ccc", fontSize: 22, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ fontSize: 15, color: "#ccc", marginBottom: 8 }}>選擇 AI 引擎</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "gemini", name: "Google Gemini", tag: "🆓 免費", desc: "每天可用 500 次" },
          { id: "anthropic", name: "Anthropic Claude", tag: "💰 付費", desc: "需儲值 $5 美金起" },
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
          {testing ? "驗證中…" : "儲存並驗證"}
        </button>
        {apiKey.hasKey && (
          <button onClick={() => { apiKey.clear(); setInput(""); setTestResult(null); }}
            style={{ padding: "12px 16px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#ef4444", fontSize: 15, cursor: "pointer" }}>清除</button>
        )}
      </div>

      {testResult && (
        <div style={{ padding: 12, borderRadius: 8, fontSize: 15, background: testResult.ok ? "#052e16" : "#2a1515", color: testResult.ok ? "#86efac" : "#fca5a5", border: "1px solid " + (testResult.ok ? "#16a34a" : "#dc2626") }}>
          {testResult.msg}
        </div>
      )}

      <div style={{ marginTop: 14, padding: 14, background: "#0a0a0a", borderRadius: 8, fontSize: 14, color: "#bbb", lineHeight: 2 }}>
        {apiKey.provider === "gemini" ? (<>
          <div style={{ fontWeight: 600, marginBottom: 4, color: "#22c55e", fontSize: 15 }}>🆓 免費取得 Gemini API Key</div>
          1. 到 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: "#f97316" }}>aistudio.google.com/apikey</a> 用 Google 帳號登入<br/>
          2. 點「建立 API 金鑰」→ 選一個專案<br/>
          3. 複製金鑰（AIzaSy... 開頭）貼到上方<br/>
          <strong style={{ color: "#22c55e" }}>✨ 完全免費，不需信用卡！</strong>
        </>) : (<>
          <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>取得 Anthropic API Key</div>
          1. 到 <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{ color: "#f97316" }}>console.anthropic.com</a> 登入<br/>
          2. 建立 Key → Plans & Billing 加值 $5 起<br/>
          3. 複製金鑰貼到上方
        </>)}
      </div>
    </div>
  );
}


// ====================================
// TAB 1: AI 個股診斷 + 財報健檢
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
    if (!apiKey.hasKey) { setError("請先到右上角 ⚙️ 設定 API Key 才能使用 AI 診斷"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      // Step 1: Technical + Verdict
      setStep("搜尋股價與技術指標…");
      const techText = await callAI(`你是台股首席分析師。用戶查詢：「${searchQ}」

請搜尋這檔股票最新資料，嚴格按以下格式回答（繁體中文）：

📊 股票：[名稱] ([代號])
💰 股價：[最新收盤價] 元（[漲跌金額] / [漲跌幅%]）
📈 技術面：KD=[K值]/[D值]（[狀態]）、RSI=[數值]、MACD=[紅柱/綠柱]
📊 均線：vs 5日/20日/60日均線（站上或跌破）
🏦 法人：外資[買超/賣超]、投信[買超/賣超]（近5日累計）

===== 診斷結論 =====
🎯 判定：【買進】或【賣出】或【觀望】（三選一，必須明確）
💪 信心度：[高/中/低]
📝 一句話理由：[為什麼應該買或賣]
🎯 建議策略：[具體操作，例如「分批買進，停損設在XX元」]
⚠️ 最大風險：[主要風險]`, apiKey.key, apiKey.provider);

      // Step 2: Financial report
      setStep("分析財報數據…");
      const finText = await callAI(`你是台股財報分析師。請搜尋「${searchQ}」這檔股票的最新財報數據。

請嚴格按照以下格式回答，每項給出 0-100 的評分：

📊 財報健檢結果：

1️⃣ 營收成長力 [評分]/100
   - 近四季營收年增率：[數據]
   - 趨勢：[連續成長/衰退/持平]

2️⃣ 獲利能力 EPS [評分]/100
   - 近四季 EPS：[數據]
   - 年增率：[數據]

3️⃣ 毛利率表現 [評分]/100
   - 最新毛利率：[數據]%
   - vs 同業平均：[高於/低於]

4️⃣ 股東權益 ROE [評分]/100
   - 最新 ROE：[數據]%
   - 趨勢：[改善/惡化/穩定]

5️⃣ 財務體質（負債比）[評分]/100
   - 負債比率：[數據]%
   - 流動比率：[數據]%

📋 財報總評：[用2句話總結這家公司的財務狀況，是否值得投資]`, apiKey.key, apiKey.provider);

      // Step 3: News
      setStep("搜尋最新相關新聞…");
      const newsText = await callAI(`搜尋「${searchQ}」台股 最近一週的重要新聞，找出 3-5 則最關鍵的新聞。

請嚴格按以下格式回答（繁體中文）：

📰 最新消息（近一週）

🔴/🟢 [利多/利空] [新聞標題摘要]
   → 影響：[對股價的可能影響，1句話]

🔴/🟢 [利多/利空] [新聞標題摘要]
   → 影響：[對股價的可能影響，1句話]

（列出 3-5 則）

📊 新聞面總評：整體偏[利多/利空/中性]，[1句話說明]`, apiKey.key, apiKey.provider);

      const verdict = parseVerdict(techText);
      const info = parseStockInfo(techText);
      const finScores = parseFinancialScores(finText);
      setResult({ query: searchQ, techText, finText, newsText, verdict, ...info, finScores, time: new Date() });
      setHistory(h => [{ query: searchQ, verdict, time: new Date().toISOString() }, ...h.slice(0, 14)]);
    } catch (e) {
      const msg = e.message === "NO_KEY" ? "請先設定 API Key" : e.message || "連線失敗，請稍後再試";
      setResult({ query: searchQ, techText: msg, finText: "", newsText: "", verdict: "觀望", time: new Date() });
    }
    setLoading(false); setStep("");
  };

  const verdictColors = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" };
  const quickStocks = ["台積電", "鴻海", "聯發科", "廣達", "緯創", "富邦金", "長榮", "華碩"];
  const [openSection, setOpenSection] = useState({ tech: true, fin: true, news: true });

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
      {/* Search bar */}
      <div style={{ padding: "16px 16px 12px", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔍</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e5e5e5" }}>個股 AI 全面診斷</div>
            <div style={{ fontSize: 14, color: "#ccc" }}>技術面 + 財報健檢 + 即時新聞，三合一分析</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
            placeholder="輸入股票代號或名稱，例：2330、台積電"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#e5e5e5", fontSize: 18, outline: "none" }} />
          <button onClick={() => search()} disabled={loading}
            style={{ background: loading ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 17, fontWeight: 600, cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap" }}>
            {loading ? "分析中…" : "全面診斷"}
          </button>
        </div>
      </div>

      {/* Quick picks */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", gap: 5, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: "#aaa", lineHeight: "24px" }}>快查：</span>
        {quickStocks.map(s => (
          <button key={s} onClick={() => { setQuery(s); search(s); }}
            style={{ padding: "2px 8px", borderRadius: 8, fontSize: 14, border: "1px solid #222", background: "#141414", color: "#ddd", cursor: "pointer" }}>{s}</button>
        ))}
      </div>

      {/* No API Key warning */}
      {!apiKey.hasKey && !loading && !result && (
        <div style={{ margin: "12px 16px", padding: 16, background: "#1a1510", border: "1px solid #f59e0b44", borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔑</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", marginBottom: 6 }}>需要設定 API Key</div>
          <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7 }}>
            AI 診斷功能需要 Anthropic API Key。<br/>
            請點右上角 ⚙️ 進行設定。
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ margin: "8px 16px", padding: 12, background: "#2a1515", border: "1px solid #dc2626", borderRadius: 8, fontSize: 14, color: "#fca5a5" }}>
          ❌ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ padding: 36, textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #222", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ marginTop: 12, fontSize: 17, color: "#ddd" }}>{step}</div>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "center", gap: 4 }}>
            {["技術面", "財報", "新聞"].map((s, i) => (
              <div key={s} style={{ padding: "2px 8px", borderRadius: 8, fontSize: 14,
                background: step.includes("技術") && i === 0 ? "#f97316" + "30" : step.includes("財報") && i === 1 ? "#f97316" + "30" : step.includes("新聞") && i === 2 ? "#f97316" + "30" : "#1a1a1a",
                color: step.includes("技術") && i === 0 ? "#f97316" : step.includes("財報") && i === 1 ? "#f97316" : step.includes("新聞") && i === 2 ? "#f97316" : "#444" }}>{s}</div>
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
            {watchlist.has(result.query) ? "✓ 已加入自選股" : "⭐ 加入自選股追蹤"}
          </button>

          {/* Financial Score Rings */}
          {result.finScores && Object.keys(result.finScores).length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", marginBottom: 12, background: "#0d0d0d", borderRadius: 10, border: "1px solid #1a1a1a" }}>
              {[["revenue","營收"], ["eps","EPS"], ["margin","毛利"], ["roe","ROE"], ["debt","體質"]].map(([k, l]) => (
                <ScoreRing key={k} score={result.finScores[k] || 50} label={l} />
              ))}
            </div>
          )}

          {/* Collapsible sections */}
          {[
            { key: "tech", icon: "📈", title: "技術面 + 買賣判定", content: result.techText },
            { key: "fin", icon: "📊", title: "財報健檢", content: result.finText },
            { key: "news", icon: "📰", title: "即時新聞 AI 解讀", content: result.newsText },
          ].filter(s => s.content).map(section => (
            <div key={section.key} style={{ marginBottom: 8 }}>
              <button onClick={() => setOpenSection(prev => ({ ...prev, [section.key]: !prev[section.key] }))}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: openSection[section.key] ? "8px 8px 0 0" : 8, color: "#ccc", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                <span>{section.icon} {section.title}</span>
                <span style={{ fontSize: 14, color: "#bbb" }}>{openSection[section.key] ? "▼" : "▶"}</span>
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
            <button onClick={() => search(result.query)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#ddd", fontSize: 15, cursor: "pointer" }}>🔄 重新分析</button>
            <button onClick={() => setResult(null)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#ddd", fontSize: 15, cursor: "pointer" }}>🔍 查詢其他</button>
          </div>
          <div style={{ marginTop: 6, padding: "5px 10px", background: "#0a0a0a", borderRadius: 6, fontSize: 13, color: "#999", textAlign: "center" }}>
            ⚠️ AI 分析僅供學習參考，不構成投資建議。投資有風險，請自行判斷。
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && !loading && !result && (
        <div style={{ padding: "10px 16px 14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: "#aaa" }}>查詢紀錄</span>
            <button onClick={() => { setHistory([]); localStorage.removeItem("tw-stock-history"); }}
              style={{ fontSize: 13, color: "#999", background: "none", border: "none", cursor: "pointer" }}>清除</button>
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
// TAB 2: 自選股追蹤
// ====================================
function TabWatchlist({ watchlist, apiKey }) {
  const [refreshing, setRefreshing] = useState(null);

  const refresh = async (item) => {
    setRefreshing(item.id);
    try {
      const text = await callAI(`你是台股分析師。請搜尋「${item.name || item.id}」的最新股價與今日漲跌幅，以及目前該買進還是賣出。

用以下格式簡短回答（繁體中文）：
💰 [股價] 元（[漲跌幅%]）
🎯 判定：【買進/賣出/觀望】
📝 [一句話理由]`, apiKey.key, apiKey.provider);
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

  const verdictColors = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>⭐ 自選股追蹤 ({watchlist.list.length})</div>
        {watchlist.list.length > 0 && (
          <button onClick={refreshAll} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: "#f59e0b", fontSize: 15, cursor: "pointer" }}>
            🔄 全部更新
          </button>
        )}
      </div>

      {watchlist.list.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
          <div style={{ fontSize: 17, color: "#ccc", marginBottom: 4 }}>還沒有自選股</div>
          <div style={{ fontSize: 15, color: "#aaa" }}>到「個股診斷」查詢後，點「加入自選股」即可追蹤</div>
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
                    {refreshing === item.id ? "⏳" : "🔄"}
                  </button>
                  <button onClick={() => watchlist.remove(item.id)}
                    style={{ padding: "3px 8px", borderRadius: 4, border: "1px solid #222", background: "#0d0d0d", color: "#bbb", fontSize: 14, cursor: "pointer" }}>✕</button>
                </div>
              </div>
              {item.latestInfo && (
                <div style={{ fontSize: 15, lineHeight: 1.7, color: "#aaa", whiteSpace: "pre-wrap", background: "#0a0a0a", borderRadius: 6, padding: 8 }}>
                  {item.latestInfo}
                </div>
              )}
              {item.lastRefresh && (
                <div style={{ fontSize: 13, color: "#999", marginTop: 4 }}>
                  上次更新：{new Date(item.lastRefresh).toLocaleString("zh-TW")}
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
// TAB 3/4: 買進 / 賣出清單
// ====================================
function TabList({ mode, watchlist }) {
  const [sector, setSector] = useState("全部");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const sectors = ["全部", ...Array.from(new Set(STOCKS.map(s => s.sector)))];
  const enriched = STOCKS.map(s => {
    const sig = getSignal(s);
    const change = s.price - s.prev;
    const pct = ((change / s.prev) * 100).toFixed(2);
    return { ...s, ...sig, change: change.toFixed(2), pct, isUp: change > 0 };
  });
  const filtered = enriched.filter(s => {
    if (sector !== "全部" && s.sector !== sector) return false;
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
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋代號/名稱"
          style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, padding: "6px 10px", color: "#e5e5e5", fontSize: 16, outline: "none" }} />
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
        {sectors.map(s => (
          <button key={s} onClick={() => setSector(s)}
            style={{ padding: "2px 8px", fontSize: 14, borderRadius: 8, border: sector === s ? "1px solid #333" : "1px solid #1a1a1a", cursor: "pointer", background: sector === s ? "#1f1f1f" : "#0d0d0d", color: sector === s ? "#e5e5e5" : "#555" }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
        {[["score","訊號"], ["change","漲跌"], ["volume","量"], ["pe","PE"], ["dy","殖利率"]].map(([k, l]) => (
          <button key={k} onClick={() => toggleSort(k)}
            style={{ padding: "2px 8px", fontSize: 14, borderRadius: 4, border: sortKey === k ? "1px solid #333" : "1px solid transparent", background: sortKey === k ? "#1a1a1a" : "transparent", color: sortKey === k ? "#ccc" : "#444", cursor: "pointer" }}>
            {l}{sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#aaa", fontSize: 16 }}>無符合條件的股票</div>}
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
                    {[["外資", stock.foreignBuy], ["投信", stock.trustBuy], ["自營", stock.dealerBuy], ["合計", ti]].map(([l, v]) => (
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
                      {watchlist.has(stock.id) ? "✓ 已追蹤" : "⭐ 加入自選"}
                    </button>
                    <span style={{ fontSize: 14, color: "#999", lineHeight: "24px" }}>量 {stock.volume.toLocaleString()} 張 · {stock.sector}</span>
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
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>台股雷達</span>
            <span style={{ fontSize: 14, color: "#aaa" }}>v3.0</span>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => setShowSettings(!showSettings)}
                style={{ background: apiKey.hasKey ? "#1a1a1a" : "#2a1510", border: `1px solid ${apiKey.hasKey ? "#333" : "#f59e0b"}`, borderRadius: 8, padding: "6px 12px", color: apiKey.hasKey ? "#ccc" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                ⚙️ {apiKey.hasKey ? "已設定" : "設定 API Key"}
              </button>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#aaa" }}>{now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })} · AI 全面診斷</div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* Market cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, margin: "12px 0" }}>
          {[
            { label: "加權指數", val: "47,183", sub: "▲ 0.16%", col: "#ef4444" },
            { label: "可買進", val: `${buyCount}`, sub: `${strongBuy} 強買`, col: "#ef4444" },
            { label: "應賣出", val: `${sellCount}`, sub: "注意減碼", col: "#22c55e" },
            { label: "自選股", val: `${watchlist.list.length}`, sub: "追蹤中", col: "#f59e0b" },
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
            { key: "search", icon: "🔍", label: "診斷" },
            { key: "watchlist", icon: "⭐", label: `自選${watchlist.list.length > 0 ? ` ${watchlist.list.length}` : ""}` },
            { key: "buy", icon: "📈", label: "買進" },
            { key: "sell", icon: "📉", label: "賣出" },
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
          <div style={{ fontSize: 14, fontWeight: 600, color: "#aaa", marginBottom: 4 }}>📐 分析方法</div>
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>
            六維綜合評分（KD/RSI/MACD/均線/法人/估值）＋ AI 即時財報健檢（營收成長/EPS/毛利率/ROE/負債比）＋ 即時新聞 AI 解讀利多利空。自選股追蹤儲存於瀏覽器。所有內容僅供參考，不構成投資建議。
          </div>
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#777" }}>台股雷達 v3.0 © 2026</div>
      </div>
    </div>
  );
}
