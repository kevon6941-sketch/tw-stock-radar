import { useState, useEffect, useRef, useCallback } from "react";

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

// --- TWSE 官方 API（免金鑰、真實資料）---
const CORS_PROXIES = [
  (u) => u,                                                        // 直連
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.cors.lol/?url=${encodeURIComponent(u)}`,
  (u) => `https://proxy.cors.sh/${u}`,
  (u) => `https://whateverorigin.org/get?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${u}`,
  (u) => `https://cors-anywhere.herokuapp.com/${u}`,
];

async function fetchTWSE(url, localFile) {
  const errs = [];

  // 1. 優先讀本站快取（GitHub Action 每日更新，無 CORS 問題）
  if (localFile) {
    try {
      const base = import.meta.env.BASE_URL || "/";
      const r = await fetch(`${base}data/${localFile}`);
      if (r.ok) {
        const json = await r.json();
        if (Array.isArray(json) && json.length) return json;
      }
    } catch (e) { errs.push("快取:" + e.message); }
  }

  // 2. 退而求其次，試各種 CORS 代理抓即時資料
  for (const wrap of CORS_PROXIES) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const r = await fetch(wrap(url), { signal: ctrl.signal, headers: { "Accept": "application/json" } });
      clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      let txt = await r.text();
      try {
        const maybe = JSON.parse(txt);
        if (maybe && typeof maybe.contents === "string") txt = maybe.contents;
        else if (Array.isArray(maybe) && maybe.length) return maybe;
      } catch {}
      const json = JSON.parse(txt);
      if (!Array.isArray(json) || json.length === 0) throw new Error("空資料");
      return json;
    } catch (e) {
      errs.push(e.name === "AbortError" ? "逾時" : e.message);
    }
  }
  throw new Error("無法取得證交所資料（" + errs.join(" / ") + "）");
}

// 全上市個股當日收盤行情
async function fetchAllStockPrices() {
  const rows = await fetchTWSE("https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL", "stock_day_all.json");
  const map = {};
  for (const r of rows) {
    const code = r.Code || r.證券代號;
    if (!code) continue;
    const close = parseFloat(r.ClosingPrice || r.收盤價);
    const diff = parseFloat(r.Change || r.漲跌價差);
    const open = parseFloat(r.OpeningPrice || r.開盤價);
    if (!isFinite(close)) continue;
    const prev = isFinite(diff) ? close - diff : null;
    map[code] = {
      code,
      name: r.Name || r.證券名稱 || "",
      close,
      open: isFinite(open) ? open : null,
      high: parseFloat(r.HighestPrice || r.最高價) || null,
      low: parseFloat(r.LowestPrice || r.最低價) || null,
      change: isFinite(diff) ? diff : null,
      pct: prev && isFinite(diff) ? ((diff / prev) * 100) : null,
      volume: parseInt((r.TradeVolume || r.成交股數 || "0").toString().replace(/,/g, "")) || 0,
    };
  }
  return map;
}

// 加權指數
async function fetchTaiex() {
  const rows = await fetchTWSE("https://openapi.twse.com.tw/v1/exchangeReport/MI_INDEX", "mi_index.json");
  const row = rows.find(r => (r.指數 || r.Index || "").includes("發行量加權股價指數"));
  if (!row) return null;
  const close = row.收盤指數 || row.ClosingIndex;
  const sign = row.漲跌 || row.Direction || "";
  const pts = row.漲跌點數 || row.Change || "";
  const pct = row.漲跌百分比 || row.ChangePercent || "";
  const neg = sign.includes("-");
  return {
    value: parseFloat(String(close).replace(/,/g, "")).toLocaleString("en-US", { maximumFractionDigits: 2 }),
    change: (neg ? "-" : "+") + pts,
    pct: (neg ? "-" : "+") + pct + "%",
    time: new Date().toLocaleString("zh-TW"),
  };
}

// --- 用證交所真實數據計算買賣訊號（不需 AI）---
function calcVerdict(r) {
  let score = 0;
  const reasons = [];
  const pct = r.pct ?? 0;
  const range = (r.high && r.low) ? (r.high - r.low) : 0;
  const pos = range > 0 ? (r.close - r.low) / range : 0.5;  // 收盤在當日區間位置

  // 1. 漲跌幅
  if (pct >= 5) { score += 2; reasons.push("強勢大漲"); }
  else if (pct >= 2) { score += 1.5; reasons.push("明顯上漲"); }
  else if (pct > 0) { score += 0.5; reasons.push("收紅"); }
  else if (pct <= -5) { score -= 2; reasons.push("重挫"); }
  else if (pct <= -2) { score -= 1.5; reasons.push("明顯下跌"); }
  else if (pct < 0) { score -= 0.5; reasons.push("收黑"); }

  // 2. 收盤位置（收在高檔代表買盤強）
  if (pos >= 0.8) { score += 1.5; reasons.push("收最高附近"); }
  else if (pos >= 0.6) { score += 0.5; reasons.push("收盤偏高"); }
  else if (pos <= 0.2) { score -= 1.5; reasons.push("收最低附近"); }
  else if (pos <= 0.4) { score -= 0.5; reasons.push("收盤偏低"); }

  // 3. 開盤 vs 收盤（紅K / 黑K）
  if (r.open && r.close > r.open) {
    const body = ((r.close - r.open) / r.open) * 100;
    if (body >= 2) { score += 1; reasons.push("長紅K棒"); }
    else { score += 0.3; reasons.push("紅K"); }
  } else if (r.open && r.close < r.open) {
    const body = ((r.open - r.close) / r.open) * 100;
    if (body >= 2) { score -= 1; reasons.push("長黑K棒"); }
    else { score -= 0.3; reasons.push("黑K"); }
  }

  // 4. 跳空
  if (r.open && r.close && r.change !== null) {
    const prevClose = r.close - r.change;
    if (r.low > prevClose) { score += 1; reasons.push("向上跳空"); }
    else if (r.high < prevClose) { score -= 1; reasons.push("向下跳空"); }
  }

  // 5. 振幅過大警示
  if (range > 0 && r.close > 0) {
    const amp = (range / r.close) * 100;
    if (amp >= 7) { score -= 0.5; reasons.push("振幅劇烈"); }
  }

  let verdict;
  if (score >= 5) verdict = "強力買進";
  else if (score >= 2.5) verdict = "買進";
  else if (score > -2.5) verdict = "觀望";
  else if (score > -5) verdict = "賣出";
  else verdict = "強力賣出";

  return { verdict, reason: reasons.slice(0, 3).join("、"), score };
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
    const out = data.content?.filter(i => i.type === "text").map(i => i.text).join("\n") || "";
    const usedSearch = data.content?.some(i => i.type === "server_tool_use" || i.type === "web_search_tool_result");
    return { text: out, grounded: !!usedSearch };
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
    let data, grounded = false;
    try {
      data = await makeRequest(true);
      // Check if search grounding actually returned sources
      const meta = data?.candidates?.[0]?.groundingMetadata;
      grounded = !!(meta?.groundingChunks?.length || meta?.webSearchQueries?.length);
    } catch (e) {
      // If google_search not available, retry without
      try {
        data = await makeRequest(false);
        grounded = false;
      } catch (e2) {
        throw e2;
      }
    }
    const out = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("\n");
    return { text: out, grounded };
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
      const r = await callAI("台積電2330今天的收盤價是多少？只回答數字。", input, apiKey.provider);
      if (r.grounded) {
        setTestResult({ ok: true, msg: "✅ 驗證成功，且即時搜尋可用！股價資料會是真實的。" });
      } else {
        setTestResult({ ok: true, warn: true, msg: "⚠️ Key 可用，但「即時搜尋」沒有啟用。AI 會用舊資料推測股價，數字不可信。建議改用 Anthropic Claude，或到 Google Cloud 啟用 Grounding with Google Search。" });
      }
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
        <div style={{ padding: 12, borderRadius: 8, fontSize: 15, lineHeight: 1.7,
          background: testResult.warn ? "#2a1510" : testResult.ok ? "#052e16" : "#2a1515",
          color: testResult.warn ? "#fcd34d" : testResult.ok ? "#86efac" : "#fca5a5",
          border: "1px solid " + (testResult.warn ? "#f59e0b" : testResult.ok ? "#16a34a" : "#dc2626") }}>
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
      const { text: techText, grounded: g1 } = await callAI(`你是台股首席分析師。用戶查詢：「${searchQ}」

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
      const { text: finText } = await callAI(`你是台股財報分析師。請搜尋「${searchQ}」這檔股票的最新財報數據。

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
      const { text: newsText } = await callAI(`搜尋「${searchQ}」台股 最近一週的重要新聞，找出 3-5 則最關鍵的新聞。

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
      setResult({ query: searchQ, techText, finText, newsText, verdict, ...info, finScores, grounded: g1, time: new Date() });
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
          {result.grounded === false && (
            <div style={{ background: "#2a1510", border: "2px solid #f59e0b", borderRadius: 10, padding: 12, marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>⚠️ 未使用即時搜尋</div>
              <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.7 }}>
                以下數字可能是 AI 推測的舊資料，不是今日真實股價。下單前請到券商 App 確認。
              </div>
            </div>
          )}
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
      const { text, grounded } = await callAI(`你是台股分析師。請搜尋「${item.name || item.id}」的最新股價與今日漲跌幅，以及目前該買進還是賣出。

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
// TAB 3/4: AI 即時掃描 買進 / 賣出
// ====================================
const SCAN_STOCKS = ["2330 台積電", "2317 鴻海", "2454 聯發科", "2382 廣達", "3231 緯創", "2308 台達電", "2881 富邦金", "2882 國泰金", "2603 長榮", "3661 世芯-KY", "2345 智邦", "6669 緯穎", "2357 華碩", "2409 友達", "2002 中鋼", "6770 力積電"];

function TabScan({ mode, watchlist, apiKey, scanState }) {
  const { stocks, scanning: loading, scanError: progress, rawText, lastScan, scan } = scanState;
  const [selected, setSelected] = useState(null);


  const verdictColors = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" };
  const verdictScore = { "強力買進": 5, "買進": 4, "觀望": 3, "賣出": 2, "強力賣出": 1 };

  const filtered = stocks.filter(s => {
    if (mode === "buy" && (s.verdict === "賣出" || s.verdict === "強力賣出")) return false;
    if (mode === "sell" && (s.verdict === "買進" || s.verdict === "強力買進" || s.verdict === "觀望")) return false;
    return true;
  }).sort((a, b) => {
    if (mode === "buy") return (verdictScore[b.verdict] || 0) - (verdictScore[a.verdict] || 0);
    return (verdictScore[a.verdict] || 0) - (verdictScore[b.verdict] || 0);
  });

  const buyCount = stocks.filter(s => s.verdict === "買進" || s.verdict === "強力買進").length;
  const sellCount = stocks.filter(s => s.verdict === "賣出" || s.verdict === "強力賣出").length;

  return (
    <div>
      {/* Scan header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {mode === "buy" ? "📈 可買進" : "📉 應賣出"}
            {stocks.length > 0 && <span style={{ fontSize: 15, color: "#999", marginLeft: 8 }}>({filtered.length} 檔)</span>}
          </div>
          {lastScan && <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>上次掃描：{lastScan}</div>}
        </div>
        <button onClick={scan} disabled={loading}
          style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: loading ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "掃描中…" : stocks.length > 0 ? "🔄 重新掃描" : "🔍 開始掃描"}
        </button>
      </div>



      {/* Loading */}
      {loading && (
        <div style={{ padding: 36, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #222", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ marginTop: 12, fontSize: 15, color: "#ccc" }}>AI 正在掃描 16 檔熱門股…</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "#999" }}>搜尋最新股價、分析買賣訊號中</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error */}
      {progress && !loading && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ padding: 12, background: "#2a1515", borderRadius: 8, fontSize: 14, color: "#fca5a5" }}>
            ❌ {progress}
            <button onClick={scan} style={{ marginLeft: 10, padding: "4px 12px", borderRadius: 6, border: "1px solid #dc2626", background: "#1a1a1a", color: "#fca5a5", fontSize: 13, cursor: "pointer" }}>
              重試
            </button>
          </div>
          {rawText && (
            <div style={{ marginTop: 8, padding: 12, background: "#0a0a0a", borderRadius: 8, fontSize: 12, color: "#999", whiteSpace: "pre-wrap", maxHeight: 300, overflowY: "auto", border: "1px solid #222" }}>
              {rawText}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && stocks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {filtered.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "#999", fontSize: 15 }}>
              {mode === "buy" ? "目前沒有建議買進的股票" : "目前沒有建議賣出的股票"}
            </div>
          )}
          {filtered.map(stock => {
            const isUp = stock.change?.startsWith("+");
            const open = selected === stock.id;
            const vc = verdictColors[stock.verdict] || "#999";
            return (
              <div key={stock.id} onClick={() => setSelected(open ? null : stock.id)}
                style={{ background: open ? "#151515" : "#0f0f0f", border: `1px solid ${open ? "#2a2a2a" : "#181818"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: vc, flexShrink: 0 }} />
                  <div style={{ minWidth: 60 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{stock.name}</div>
                    <div style={{ fontSize: 13, color: "#999" }}>{stock.id}{stock.sector ? ` · ${stock.sector}` : ""}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: isUp ? "#ef4444" : "#22c55e" }}>{stock.price}</div>
                    <div style={{ fontSize: 14, color: isUp ? "#ef4444" : "#22c55e" }}>{stock.change}</div>
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 6, fontSize: 14, fontWeight: 600, background: vc + "18", color: vc, whiteSpace: "nowrap" }}>
                    {stock.verdict}
                  </div>
                </div>
                {open && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e1e1e" }} onClick={e => e.stopPropagation()}>
                    <div style={{ fontSize: 15, color: "#ccc", lineHeight: 1.8, marginBottom: 8 }}>
                      📝 {stock.reason}
                    </div>
                    {stock.open && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginBottom: 10 }}>
                        {[["開", stock.open], ["高", stock.high], ["低", stock.low], ["量", stock.volume ? Math.round(stock.volume / 1000) + "張" : "—"]].map(([l, v]) => (
                          <div key={l} style={{ background: "#0a0a0a", borderRadius: 6, padding: "6px 4px", textAlign: "center" }}>
                            <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{typeof v === "number" ? v.toFixed(2) : v}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={() => watchlist.add({ id: stock.id, name: stock.name, verdict: stock.verdict })}
                      disabled={watchlist.has(stock.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: watchlist.has(stock.id) ? "#666" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                      {watchlist.has(stock.id) ? "✓ 已追蹤" : "⭐ 加入自選股"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && stocks.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>{mode === "buy" ? "📈" : "📉"}</div>
          <div style={{ fontSize: 16, color: "#ccc", marginBottom: 6 }}>尚未掃描</div>
          <div style={{ fontSize: 14, color: "#999" }}>點上方「開始掃描」，從證交所抓取 16 檔熱門股的真實收盤資料</div>
        </div>
      )}
    </div>
  );
}

// ====================================
// MAIN APP
// ====================================
export default function App() {
  const [tab, setTab] = useState("buy");
  const [showSettings, setShowSettings] = useState(false);
  const [now] = useState(new Date());
  const watchlist = useWatchlist();
  const apiKey = useApiKey();

  // Shared scan state across buy/sell tabs
  const [stocks, setStocks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-scan")) || []; }
    catch { return []; }
  });
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const [rawText, setRawText] = useState("");
  const [lastScan, setLastScan] = useState(() => localStorage.getItem("tw-stock-scan-time") || "");
  const [grounded, setGrounded] = useState(() => localStorage.getItem("tw-stock-grounded") === "1");

  // Market index
  const [index, setIndex] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-index")) || null; }
    catch { return null; }
  });

  const fetchIndex = async () => {
    try {
      const idx = await fetchTaiex();
      if (idx) {
        setIndex(idx);
        localStorage.setItem("tw-stock-index", JSON.stringify(idx));
      }
    } catch (e) {
      console.warn("加權指數抓取失敗:", e.message);
    }
  };

  const scan = async () => {
    if (scanning) return;
    setScanning(true); setScanError(""); setRawText("");
    try {
      // 1. 先從證交所抓真實股價
      const priceMap = await fetchAllStockPrices();
      const rows = SCAN_STOCKS.map(s => {
        const code = s.split(" ")[0];
        const name = s.split(" ")[1];
        const p = priceMap[code];
        return p ? { ...p, name: p.name || name } : { code, name, close: null };
      }).filter(r => r.close !== null);

      if (rows.length === 0) {
        setScanError("證交所尚無今日資料（可能未開盤或非交易日）");
        setScanning(false);
        return;
      }

      // 2. 用真實數據計算買賣訊號（不需 API Key）
      const base = rows.map(r => {
        const v = calcVerdict(r);
        return {
          id: r.code,
          name: r.name,
          price: r.close.toFixed(2),
          change: (r.pct >= 0 ? "+" : "") + (r.pct?.toFixed(2) ?? "0") + "%",
          verdict: v.verdict,
          reason: v.reason,
          sector: "",
          open: r.open, high: r.high, low: r.low, volume: r.volume,
        };
      });
      setStocks(base);
      setGrounded(true);

      // 3. 有 API Key 的話，請 AI 根據真實數據給判定
      if (apiKey.hasKey) {
        const dataLines = rows.map(r =>
          `${r.code} ${r.name} 收盤${r.close} 開${r.open} 高${r.high} 低${r.low} 漲跌${r.change >= 0 ? "+" : ""}${r.change} (${r.pct?.toFixed(2)}%) 量${Math.round(r.volume / 1000)}張`
        ).join("\n");

        const { text } = await callAI(`以下是台灣證交所今日官方收盤資料，請根據這些真實數據給出買賣判定。

${dataLines}

輸出規則：每檔一行，欄位用半形直線 | 分隔，不要加編號或項目符號，不要其他說明文字。
格式：代號|判定|理由|產業

判定只能填：強力買進、買進、觀望、賣出、強力賣出
理由用一句話（20字內），根據當日漲跌幅、開高低收型態、成交量來判斷

直接輸出 ${rows.length} 行：`, apiKey.key, apiKey.provider);

        setRawText(text);
        const verdicts = ["強力買進", "強力賣出", "買進", "賣出", "觀望"];
        const aiMap = {};
        for (let rawLine of text.split("\n")) {
          let line = rawLine.trim();
          if (!line.includes("|")) continue;
          line = line.replace(/^[\s\-\*>#`]+/, "").replace(/^\|/, "").replace(/\|$/, "").trim();
          const parts = line.split("|").map(s => s.replace(/\*\*/g, "").trim());
          const code = (parts[0].match(/\d{4}/) || [])[0];
          if (!code) continue;
          let verdict = "觀望", vi = -1;
          for (let i = 0; i < parts.length; i++) {
            const f = verdicts.find(v => parts[i].includes(v));
            if (f) { verdict = f; vi = i; break; }
          }
          aiMap[code] = { verdict, reason: vi >= 0 ? (parts[vi + 1] || "") : "", sector: vi >= 0 ? (parts[vi + 2] || "") : "" };
        }
        const merged = base.map(b => aiMap[b.id] ? { ...b, ...aiMap[b.id] } : b);
        setStocks(merged);
        localStorage.setItem("tw-stock-scan", JSON.stringify(merged));
      } else {
        localStorage.setItem("tw-stock-scan", JSON.stringify(base));
      }

      localStorage.setItem("tw-stock-grounded", "1");
      const t = new Date().toLocaleString("zh-TW");
      setLastScan(t);
      localStorage.setItem("tw-stock-scan-time", t);
    } catch (e) {
      setScanError("掃描失敗：" + e.message);
    }
    setScanning(false);
  };

  // 進站自動抓證交所資料（不需 API Key）
  useEffect(() => {
    const stale = !lastScan || (Date.now() - new Date(lastScan).getTime()) > 30 * 60 * 1000;
    if (stocks.length === 0 || stale) scan();
    if (!index || stale) fetchIndex();
  }, [apiKey.hasKey]);

  const scanState = { stocks, scanning, scanError, rawText, lastScan, scan };
  const buyCount = stocks.filter(s => s.verdict === "買進" || s.verdict === "強力買進").length;
  const sellCount = stocks.filter(s => s.verdict === "賣出" || s.verdict === "強力賣出").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', 'Noto Sans TC', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 16px 12px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>台股雷達</span>
            <span style={{ fontSize: 14, color: "#aaa" }}>v4.1</span>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => setShowSettings(!showSettings)}
                style={{ background: apiKey.hasKey ? "#1a1a1a" : "#2a1510", border: `1px solid ${apiKey.hasKey ? "#333" : "#f59e0b"}`, borderRadius: 8, padding: "6px 12px", color: apiKey.hasKey ? "#ccc" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                ⚙️ {apiKey.hasKey ? "已設定" : "設定 API Key"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#aaa" }}>{now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</span>
            {(
              <button onClick={() => { scan(); fetchIndex(); }} disabled={scanning}
                style={{ background: "none", border: "none", color: scanning ? "#666" : "#f97316", fontSize: 13, cursor: scanning ? "wait" : "pointer", padding: 0 }}>
                {scanning ? "更新中…" : "🔄 全部更新"}
              </button>
            )}
            {lastScan && !scanning && <span style={{ fontSize: 12, color: "#777" }}>{lastScan}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* Market cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, margin: "12px 0" }}>
          {[
            { label: "加權指數", val: index?.value || "—", sub: index ? `${index.change} (${index.pct})` : (apiKey.hasKey ? "查詢中…" : "需設定 Key"), col: index?.pct?.startsWith("-") ? "#22c55e" : "#ef4444" },
            { label: "可買進", val: stocks.length ? `${buyCount}` : "—", sub: stocks.length ? "檔" : (scanning ? "掃描中…" : "待掃描"), col: "#ef4444" },
            { label: "應賣出", val: stocks.length ? `${sellCount}` : "—", sub: stocks.length ? "檔" : (scanning ? "掃描中…" : "待掃描"), col: "#22c55e" },
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

        {/* Data source badge */}
        {stocks.length > 0 && (
          <div style={{ background: "#0d1f0d", border: "1px solid #16a34a44", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#86efac" }}>
            ✅ 資料來自臺灣證券交易所官方 OpenAPI，訊號依當日開高低收與量能計算
            {!apiKey.hasKey && <span style={{ color: "#f59e0b" }}>　·　設定 ⚙️ API Key 可加上 AI 深度解讀</span>}
          </div>
        )}

        {/* Settings panel */}
        {showSettings && <SettingsPanel apiKey={apiKey} onClose={() => setShowSettings(false)} />}

        {/* Tab content */}
        {tab === "search" && <TabDiagnosis watchlist={watchlist} apiKey={apiKey} />}
        {tab === "watchlist" && <TabWatchlist watchlist={watchlist} apiKey={apiKey} />}
        {tab === "buy" && <TabScan mode="buy" watchlist={watchlist} apiKey={apiKey} scanState={scanState} />}
        {tab === "sell" && <TabScan mode="sell" watchlist={watchlist} apiKey={apiKey} scanState={scanState} />}

        {/* Footer */}
        <div style={{ marginTop: 20, padding: 12, background: "#0d0d0d", borderRadius: 10, border: "1px solid #151515" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#aaa", marginBottom: 4 }}>📐 分析方法</div>
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>
            六維綜合評分（KD/RSI/MACD/均線/法人/估值）＋ AI 即時財報健檢（營收成長/EPS/毛利率/ROE/負債比）＋ 即時新聞 AI 解讀利多利空。自選股追蹤儲存於瀏覽器。所有內容僅供參考，不構成投資建議。
          </div>
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#777" }}>台股雷達 v4.1 © 2026</div>
      </div>
    </div>
  );
}
