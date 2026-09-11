import { useState, useEffect, useRef } from "react";

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

function Spark({ stock, w = 72, h = 24 }) {
  const seed = parseInt(stock.id) % 100;
  const pts = Array.from({ length: 20 }, (_, i) => {
    const base = stock.prev + (stock.price - stock.prev) * (i / 19);
    return base + Math.sin(seed + i * 0.8) * (stock.price * 0.007) + Math.cos(seed * 0.3 + i * 1.2) * (stock.price * 0.004);
  });
  const min = Math.min(...pts), max = Math.max(...pts), range = max - min || 1;
  const path = pts.map((v, i) => `${(i / 19) * w},${h - ((v - min) / range) * h}`).join(" ");
  const up = stock.price >= stock.prev;
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={path} fill="none" stroke={up ? "#ef4444" : "#22c55e"} strokeWidth="1.5" strokeLinejoin="round" /></svg>;
}

function GaugeBar({ value, label, max = 100, zones }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  let col = "#888";
  zones?.forEach(z => { if (value >= z.from && value <= z.to) col = z.color; });
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: "#666" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: col }}>{value}</span>
      </div>
      <div style={{ height: 3, background: "#222", borderRadius: 2 }}>
        <div style={{ height: 3, width: `${pct}%`, background: col, borderRadius: 2, transition: "width 0.3s" }} />
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
          <span style={{ fontSize: 28 }}>{v.icon}</span>
          <div>
            <div style={{ fontSize: 10, color: "#888" }}>AI 診斷結論</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: v.color, letterSpacing: 2 }}>{verdict}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {stockName && <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>{stockName}</div>}
          {price && <div style={{ fontSize: 12, color: v.color }}>{price} {change || ""}</div>}
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>{v.sub}</div>
    </div>
  );
}

// --- Parse verdict from AI text ---
function parseVerdict(text) {
  const t = text.toUpperCase();
  // Check for verdict keywords
  if (/強力買進|強烈買進|積極買進/.test(text)) return "強力買進";
  if (/強力賣出|強烈賣出|積極賣出/.test(text)) return "強力賣出";
  // Count buy/sell signals in text
  const buyWords = (text.match(/買進|買入|做多|看多|偏多|建議買|可以買|逢低布局|逢低佈局|加碼|有利買方/g) || []).length;
  const sellWords = (text.match(/賣出|做空|看空|偏空|建議賣|減碼|獲利了結|出場|應賣|宜賣/g) || []).length;
  const holdWords = (text.match(/觀望|中性|持平|等待|暫時不宜|不建議進場|靜待/g) || []).length;
  if (buyWords > sellWords && buyWords > holdWords) return buyWords >= 3 ? "強力買進" : "買進";
  if (sellWords > buyWords && sellWords > holdWords) return sellWords >= 3 ? "強力賣出" : "賣出";
  return "觀望";
}

function parseStockInfo(text) {
  // Try to extract stock name and price from AI text
  let stockName = null, price = null, change = null;
  const nameMatch = text.match(/(?:📊|股票|個股)[^\n]*?([^\s(（]+)\s*[（(](\d{4})[)）]/);
  if (nameMatch) stockName = `${nameMatch[1]} (${nameMatch[2]})`;
  const priceMatch = text.match(/(?:💰|股價|收盤|最新)[^\n]*?(\d+(?:\.\d+)?)\s*元/);
  if (priceMatch) price = priceMatch[1] + " 元";
  const changeMatch = text.match(/[漲跌][^\n]*?([+-]?\d+(?:\.\d+)?%)/);
  if (changeMatch) change = changeMatch[1];
  return { stockName, price, change };
}

// --- AI Search Panel ---
function AIStockSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const search = async (q) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `你是台股首席分析師。用戶查詢：「${searchQ}」

你必須搜尋這檔股票的最新即時資料，然後給出明確的買或賣判定。

請嚴格按照以下格式回答（繁體中文），每一項都必須填寫：

📊 股票：[名稱] ([代號])
💰 股價：[最新收盤價] 元（[漲跌金額] / [漲跌幅%]）
📈 技術面：KD=[K值]/[D值]（[黃金交叉/死亡交叉/高檔鈍化/低檔超賣]）、RSI=[數值]（[過買/過賣/中性]）、MACD=[紅柱/綠柱]
📊 均線：股價 vs 5日/20日/60日均線的關係（站上或跌破）
🏦 法人：外資[買超/賣超][金額]、投信[買超/賣超][金額]
⚡ 題材：[近期最重要的 1-2 個催化劑或利空]

===== 診斷結論 =====
🎯 判定：【買進】或【賣出】或【觀望】（三選一，必須明確選一個）
💪 信心度：[高/中/低]
📝 一句話理由：[用一句話說明為什麼應該買或賣]
🎯 建議策略：[具體操作建議，例如「分批買進，停損設在XX元」或「獲利了結，目標價XX元」]
⚠️ 最大風險：[這個操作最大的風險是什麼]

重要：你一定要在「判定」那行明確寫出【買進】或【賣出】或【觀望】其中一個。不可以模糊帶過。` }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.filter(i => i.type === "text").map(i => i.text).join("\n") || "暫時無法取得分析結果，請稍後再試。";
      const verdict = parseVerdict(text);
      const info = parseStockInfo(text);
      setResult({ query: searchQ, text, verdict, ...info, time: new Date() });
      setHistory(h => [{ query: searchQ, verdict, time: new Date() }, ...h.slice(0, 9)]);
    } catch {
      setResult({ query: searchQ, text: "連線失敗，請檢查網路後再試。", verdict: "觀望", time: new Date() });
    }
    setLoading(false);
  };

  const quickStocks = ["台積電", "鴻海", "聯發科", "廣達", "緯創", "世芯-KY", "富邦金", "長榮"];
  const verdictColors = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" };

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, overflow: "hidden" }}>
      {/* Search header */}
      <div style={{ padding: "16px 16px 12px", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔍</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e5e5e5" }}>個股 AI 診斷</div>
            <div style={{ fontSize: 10, color: "#666" }}>輸入任何台股，AI 搜尋最新資料告訴你該買還是該賣</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="輸入股票代號或名稱，例：2330、台積電"
            style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#e5e5e5", fontSize: 14, outline: "none" }}
          />
          <button onClick={() => search()} disabled={loading}
            style={{ background: loading ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap", minWidth: 80 }}>
            {loading ? "分析中…" : "該買該賣？"}
          </button>
        </div>
      </div>

      {/* Quick picks */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a", display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#444", lineHeight: "24px" }}>快速查：</span>
        {quickStocks.map(s => (
          <button key={s} onClick={() => { setQuery(s); search(s); }}
            style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, border: "1px solid #222", background: "#141414", color: "#888", cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: 36, textAlign: "center" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #222", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ marginTop: 12, fontSize: 13, color: "#888" }}>正在搜尋「{query}」的最新資料…</div>
          <div style={{ marginTop: 4, fontSize: 11, color: "#444" }}>分析股價、技術指標、法人籌碼、近期消息</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Result with Verdict Card */}
      {result && !loading && (
        <div style={{ padding: 16 }}>
          {/* BIG VERDICT CARD */}
          <VerdictCard verdict={result.verdict} stockName={result.stockName} price={result.price} change={result.change} />

          {/* Detailed analysis */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888" }}>詳細分析報告</div>
            <div style={{ fontSize: 10, color: "#333" }}>{result.time.toLocaleTimeString("zh-TW")}</div>
          </div>
          <div style={{
            background: "#0a0a0a", borderRadius: 10, padding: 14, fontSize: 12, lineHeight: 1.9, color: "#bbb",
            whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 400, overflowY: "auto"
          }}>
            {result.text}
          </div>

          {/* Re-search */}
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button onClick={() => search(result.query)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#888", fontSize: 11, cursor: "pointer" }}>
              🔄 重新分析
            </button>
            <button onClick={() => setResult(null)}
              style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#888", fontSize: 11, cursor: "pointer" }}>
              🔍 查詢其他股票
            </button>
          </div>

          <div style={{ marginTop: 8, padding: "6px 10px", background: "#0a0a0a", borderRadius: 6, fontSize: 9, color: "#333", textAlign: "center" }}>
            ⚠️ AI 分析僅供學習參考，不構成投資建議。股市有風險，投資需謹慎。
          </div>
        </div>
      )}

      {/* Search history with verdict badges */}
      {history.length > 0 && !loading && !result && (
        <div style={{ padding: "12px 16px 14px" }}>
          <div style={{ fontSize: 10, color: "#444", marginBottom: 8 }}>最近查詢紀錄</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {history.map((h, i) => (
              <button key={i} onClick={() => { setQuery(h.query); search(h.query); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, border: "1px solid #1a1a1a", background: "#0d0d0d", color: "#888", cursor: "pointer", fontSize: 12, textAlign: "left" }}>
                <span>{h.query}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: verdictColors[h.verdict] || "#888", padding: "1px 6px", borderRadius: 4, background: (verdictColors[h.verdict] || "#888") + "15" }}>
                  {h.verdict}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main App ---
export default function TaiwanStockRadar() {
  const [sector, setSector] = useState("全部");
  const [sortKey, setSortKey] = useState("score");
  const [sortDir, setSortDir] = useState("desc");
  const [listSearch, setListSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("search");
  const [now] = useState(new Date());

  const sectors = ["全部", ...Array.from(new Set(STOCKS.map(s => s.sector)))];
  const enriched = STOCKS.map(s => {
    const sig = getSignal(s);
    const change = s.price - s.prev;
    const pct = ((change / s.prev) * 100).toFixed(2);
    return { ...s, ...sig, change: change.toFixed(2), pct, isUp: change > 0 };
  });

  const filtered = enriched.filter(s => {
    if (sector !== "全部" && s.sector !== sector) return false;
    if (listSearch && !s.name.includes(listSearch) && !s.id.includes(listSearch)) return false;
    if (tab === "buy" && s.score < 0) return false;
    if (tab === "sell" && s.score >= 0) return false;
    return true;
  }).sort((a, b) => {
    const keys = { score: "score", change: "pct", volume: "volume", pe: "pe", dy: "dy" };
    const av = keys[sortKey] ? parseFloat(a[keys[sortKey]]) : a.price;
    const bv = keys[sortKey] ? parseFloat(b[keys[sortKey]]) : b.price;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const buyCount = enriched.filter(s => s.score >= 0).length;
  const sellCount = enriched.filter(s => s.score < 0).length;
  const strongBuy = enriched.filter(s => s.score >= 3).length;
  const avgChange = (enriched.reduce((a, s) => a + parseFloat(s.pct), 0) / enriched.length).toFixed(2);

  const toggleSort = k => { if (sortKey === k) setSortDir(d => d === "desc" ? "asc" : "desc"); else { setSortKey(k); setSortDir("desc"); } };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', 'Noto Sans TC', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)", borderBottom: "1px solid #1a1a1a", padding: "18px 16px 14px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>台股雷達</span>
            <span style={{ fontSize: 10, color: "#444" }}>v2.0</span>
          </div>
          <div style={{ fontSize: 10, color: "#444" }}>
            {now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })} · AI 驅動即時分析
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 16px 40px" }}>
        {/* Market cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, margin: "14px 0" }}>
          <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px", border: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 9, color: "#555" }}>加權指數</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#ef4444" }}>47,183</div>
            <div style={{ fontSize: 10, color: "#ef4444" }}>▲ 0.16%</div>
          </div>
          <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px", border: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 9, color: "#555" }}>可買進</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#ef4444" }}>{buyCount}</div>
            <div style={{ fontSize: 10, color: "#f97316" }}>{strongBuy} 檔強力買進</div>
          </div>
          <div style={{ background: "#111", borderRadius: 8, padding: "8px 10px", border: "1px solid #1a1a1a" }}>
            <div style={{ fontSize: 9, color: "#555" }}>應賣出</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#22c55e" }}>{sellCount}</div>
            <div style={{ fontSize: 10, color: "#888" }}>均漲 {avgChange}%</div>
          </div>
        </div>

        {/* Tab navigation */}
        <div style={{ display: "flex", background: "#111", borderRadius: 10, padding: 3, marginBottom: 14, border: "1px solid #1a1a1a" }}>
          {[
            { key: "search", icon: "🔍", label: "個股診斷" },
            { key: "buy", icon: "📈", label: `買進 ${buyCount}` },
            { key: "sell", icon: "📉", label: `賣出 ${sellCount}` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: tab === t.key ? 600 : 400, transition: "all 0.2s",
                background: tab === t.key ? (t.key === "sell" ? "rgba(34,197,94,0.12)" : t.key === "buy" ? "rgba(239,68,68,0.12)" : "rgba(249,115,22,0.12)") : "transparent",
                color: tab === t.key ? (t.key === "sell" ? "#22c55e" : t.key === "buy" ? "#ef4444" : "#f97316") : "#555" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* AI Search Tab */}
        {tab === "search" && <AIStockSearch />}

        {/* Buy / Sell Tabs */}
        {(tab === "buy" || tab === "sell") && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
              <input value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="搜尋代號/名稱"
                style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 6, padding: "6px 10px", color: "#e5e5e5", fontSize: 12, outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
              {sectors.map(s => (
                <button key={s} onClick={() => setSector(s)}
                  style={{ padding: "2px 8px", fontSize: 10, borderRadius: 8, border: sector === s ? "1px solid #333" : "1px solid #1a1a1a", cursor: "pointer",
                    background: sector === s ? "#1f1f1f" : "#0d0d0d", color: sector === s ? "#e5e5e5" : "#555" }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
              {[["score", "訊號"], ["change", "漲跌"], ["volume", "量"], ["pe", "PE"], ["dy", "殖利率"]].map(([k, l]) => (
                <button key={k} onClick={() => toggleSort(k)}
                  style={{ padding: "2px 8px", fontSize: 10, borderRadius: 4, border: sortKey === k ? "1px solid #333" : "1px solid transparent",
                    background: sortKey === k ? "#1a1a1a" : "transparent", color: sortKey === k ? "#ccc" : "#444", cursor: "pointer" }}>
                  {l}{sortKey === k ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </button>
              ))}
            </div>

            {/* Stock cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {filtered.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#444", fontSize: 12 }}>無符合條件的股票</div>}
              {filtered.map(stock => {
                const open = selected === stock.id;
                const ti = stock.foreignBuy + stock.trustBuy + stock.dealerBuy;
                return (
                  <div key={stock.id} onClick={() => setSelected(open ? null : stock.id)}
                    style={{ background: open ? "#151515" : "#0f0f0f", border: `1px solid ${open ? "#2a2a2a" : "#181818"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Signal dot */}
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: stock.color, flexShrink: 0 }} />
                      {/* Name */}
                      <div style={{ minWidth: 52 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{stock.name}</div>
                        <div style={{ fontSize: 10, color: "#555" }}>{stock.id}</div>
                      </div>
                      {/* Spark */}
                      <Spark stock={stock} />
                      {/* Price */}
                      <div style={{ flex: 1, textAlign: "right" }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: stock.isUp ? "#ef4444" : "#22c55e" }}>{stock.price}</div>
                        <div style={{ fontSize: 10, color: stock.isUp ? "#ef4444" : "#22c55e" }}>
                          {stock.isUp ? "+" : ""}{stock.pct}%
                        </div>
                      </div>
                      {/* Signal badge */}
                      <div style={{ padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: stock.color + "15", color: stock.color, whiteSpace: "nowrap" }}>
                        {stock.signal}
                      </div>
                    </div>

                    {open && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e1e1e" }} onClick={e => e.stopPropagation()}>
                        {/* Gauges */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <GaugeBar label="K" value={stock.k} zones={[{ from: 0, to: 20, color: "#22c55e" }, { from: 20, to: 80, color: "#f97316" }, { from: 80, to: 100, color: "#ef4444" }]} />
                          <GaugeBar label="D" value={stock.d} zones={[{ from: 0, to: 20, color: "#22c55e" }, { from: 20, to: 80, color: "#f97316" }, { from: 80, to: 100, color: "#ef4444" }]} />
                          <GaugeBar label="RSI" value={stock.rsi} zones={[{ from: 0, to: 30, color: "#22c55e" }, { from: 30, to: 70, color: "#a3a3a3" }, { from: 70, to: 100, color: "#ef4444" }]} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <GaugeBar label="PE" value={stock.pe} max={50} zones={[{ from: 0, to: 15, color: "#22c55e" }, { from: 15, to: 25, color: "#a3a3a3" }, { from: 25, to: 50, color: "#ef4444" }]} />
                          <GaugeBar label="殖利率" value={stock.dy} max={8} zones={[{ from: 0, to: 2, color: "#ef4444" }, { from: 2, to: 4, color: "#a3a3a3" }, { from: 4, to: 8, color: "#22c55e" }]} />
                          <GaugeBar label="MACD" value={stock.macd} max={50} zones={[{ from: -50, to: 0, color: "#22c55e" }, { from: 0, to: 50, color: "#ef4444" }]} />
                        </div>

                        {/* MA */}
                        <div style={{ display: "flex", gap: 10, fontSize: 10, marginBottom: 10, flexWrap: "wrap" }}>
                          {[["5MA", stock.ma5], ["20MA", stock.ma20], ["60MA", stock.ma60]].map(([l, v]) => (
                            <span key={l} style={{ color: stock.price >= v ? "#ef4444" : "#22c55e" }}>
                              {l} {v} {stock.price >= v ? "✓" : "✗"}
                            </span>
                          ))}
                        </div>

                        {/* Institutional */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 10 }}>
                          {[["外資", stock.foreignBuy], ["投信", stock.trustBuy], ["自營", stock.dealerBuy], ["合計", ti]].map(([l, v]) => (
                            <div key={l} style={{ background: "#0a0a0a", borderRadius: 6, padding: "5px 6px", textAlign: "center" }}>
                              <div style={{ fontSize: 9, color: "#555" }}>{l}</div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: v > 0 ? "#ef4444" : v < 0 ? "#22c55e" : "#666" }}>
                                {v > 0 ? "+" : ""}{(v / 1000).toFixed(1)}k
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Reasons */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {stock.reasons.map((r, i) => (
                            <span key={i} style={{ padding: "2px 6px", borderRadius: 6, fontSize: 9, background: "#141414", color: "#777", border: "1px solid #1e1e1e" }}>{r}</span>
                          ))}
                        </div>
                        <div style={{ marginTop: 8, fontSize: 10, color: "#333" }}>量 {stock.volume.toLocaleString()} 張 · {stock.sector}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Method & disclaimer */}
        <div style={{ marginTop: 20, padding: 14, background: "#0d0d0d", borderRadius: 10, border: "1px solid #151515" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 6 }}>📐 分析方法</div>
          <div style={{ fontSize: 10, color: "#333", lineHeight: 1.8 }}>
            六維綜合評分：KD 隨機指標（黃金/死亡交叉、超買超賣）、RSI 相對強弱（70/30 門檻）、MACD 動能方向、均線位階（5/20/60日）、三大法人籌碼、基本面估值（PE + 殖利率）。個股診斷功能透過 AI 即時搜尋公開資料分析。所有內容僅供學習參考，不構成任何投資建議。
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: "center", fontSize: 9, color: "#222" }}>
          台股雷達 © 2026 · 資料來源：TWSE · 不構成投資建議
        </div>
      </div>
    </div>
  );
}
