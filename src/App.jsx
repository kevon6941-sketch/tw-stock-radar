import { useState, useEffect } from "react";

// --- Verdict Card ---
function VerdictCard({ verdict, stockName, price, change }) {
  const map = {
    "強力買進": { bg: "linear-gradient(135deg, #7f1d1d, #991b1b)", border: "#dc2626", color: "#fca5a5", sub: "技術面與籌碼面高度偏多，短線有強勢上攻動能" },
    "買進": { bg: "linear-gradient(135deg, #1a1a1a, #2a1515)", border: "#ef4444", color: "#ef4444", sub: "多項指標偏多，可考慮逢低分批佈局" },
    "觀望": { bg: "linear-gradient(135deg, #1a1a1a, #1a1a1a)", border: "#f59e0b", color: "#f59e0b", sub: "多空訊號交雜，建議等待方向明確再進場" },
    "賣出": { bg: "linear-gradient(135deg, #1a1a1a, #0d1f0d)", border: "#22c55e", color: "#22c55e", sub: "技術面轉弱或估值偏高，可考慮獲利了結或減碼" },
    "強力賣出": { bg: "linear-gradient(135deg, #052e16, #14532d)", border: "#16a34a", color: "#86efac", sub: "多項指標高度偏空，建議盡速減碼避險" },
  };
  const v = map[verdict] || map["觀望"];
  return (
    <div style={{ background: v.bg, border: `2px solid ${v.border}`, borderRadius: 12, padding: "16px 16px 14px", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size/2} ${size/2})`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth="4" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s" }} />
        </g>
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill={col} fontSize={size * 0.34} fontWeight="700"
          fontFamily="'Inter', 'Noto Sans TC', system-ui, sans-serif">
          {pct}
        </text>
      </svg>
      <div style={{ fontSize: 13, color: "#ccc" }}>{label}</div>
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
  const nm = text.match(/(?:|股票|個股)[^\n]*?([^\s(（]+)\s*[（(](\d{4})[)）]/);
  if (nm) stockName = `${nm[1]} (${nm[2]})`;
  const pm = text.match(/(?:|股價|收盤|最新)[^\n]*?(\d+(?:\.\d+)?)\s*元/);
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

// --- 美股連動對應表 ---
// 美股代號 → { 中文名, 連動的台股題材, 說明 }
const US_LINKS = {
  "NVDA": { name: "NVIDIA", themes: ["AI伺服器", "AI晶片/IP"], note: "AI 晶片龍頭，台廠代工與供應鏈直接受惠" },
  "AMD":  { name: "AMD", themes: ["AI伺服器", "半導體"], note: "資料中心 CPU/GPU，牽動伺服器供應鏈" },
  "AVGO": { name: "博通", themes: ["AI晶片/IP", "網通/光通訊"], note: "客製化 ASIC 與網通晶片" },
  "MU":   { name: "美光", themes: ["半導體"], note: "記憶體報價指標" },
  "INTC": { name: "英特爾", themes: ["半導體", "AI伺服器"], note: "PC 與伺服器平台需求" },
  "TSM":  { name: "台積電ADR", themes: ["半導體", "AI晶片/IP"], note: "台積電 ADR，通常領先反映台股走勢" },
  "SMCI": { name: "美超微", themes: ["AI伺服器"], note: "AI 伺服器整機廠，台廠是其主要代工夥伴" },
  "DELL": { name: "戴爾", themes: ["AI伺服器"], note: "伺服器出貨動能" },
  "AAPL": { name: "蘋果", themes: ["半導體"], note: "蘋概股供應鏈" },
  "QCOM": { name: "高通", themes: ["半導體", "AI晶片/IP"], note: "手機晶片需求" },
  "ARM":  { name: "安謀", themes: ["AI晶片/IP"], note: "IP 授權指標" },
  "MRVL": { name: "邁威爾", themes: ["AI晶片/IP", "網通/光通訊"], note: "資料中心互連晶片" },
  "ASML": { name: "艾斯摩爾", themes: ["半導體"], note: "曝光機設備，反映晶圓廠資本支出" },
  "AMAT": { name: "應用材料", themes: ["半導體"], note: "半導體設備需求" },
  "LRCX": { name: "科林研發", themes: ["半導體"], note: "蝕刻設備需求" },
  "MSFT": { name: "微軟", themes: ["AI伺服器"], note: "雲端資本支出" },
  "GOOGL":{ name: "Alphabet", themes: ["AI伺服器", "AI晶片/IP"], note: "自研 TPU 與雲端投資" },
  "AMZN": { name: "亞馬遜", themes: ["AI伺服器"], note: "AWS 資本支出" },
  "META": { name: "Meta", themes: ["AI伺服器"], note: "AI 基礎建設投資" },
  "TSLA": { name: "特斯拉", themes: ["電動車"], note: "電動車供應鏈" },
};

const US_INDEXES = {
  "^SPX": { name: "標普500", note: "美股大盤" },
  "^NDQ": { name: "那斯達克", note: "科技股指標" },
  "^DJI": { name: "道瓊", note: "傳產藍籌" },
  "^SOX": { name: "費城半導體", note: "與台股電子股連動最強" },
};

async function fetchUSMarket() {
  const base = import.meta.env.BASE_URL || "/";
  const r = await fetch(`${base}data/us_market.json`);
  if (!r.ok) throw new Error("讀取失敗");
  const rows = await r.json();
  if (!Array.isArray(rows) || rows.length === 0) throw new Error("無資料");
  return rows.map(x => {
    const sym = String(x.symbol || "").toUpperCase().replace(/\.US$/, "");
    const pct = x.open > 0 ? ((x.close - x.open) / x.open) * 100 : null;
    return { ...x, sym, pct };
  });
}

// 由美股表現推導出台股題材的連動提示
function buildLinkageHints(usRows) {
  if (!usRows?.length) return { hints: [], themeBias: {} };
  const hints = [];
  const themeBias = {};   // 題材 → { score, drivers: [] }

  usRows.forEach(r => {
    const link = US_LINKS[r.sym];
    if (!link || r.pct === null) return;
    const p = r.pct;
    // 只在漲跌明顯時才提示
    if (Math.abs(p) < 2) return;
    const dir = p > 0 ? "上漲" : "下跌";
    const strength = Math.abs(p) >= 5 ? "大幅" : "";
    hints.push({
      sym: r.sym, name: link.name, pct: p,
      themes: link.themes, note: link.note,
      text: `${link.name} ${strength}${dir} ${p > 0 ? "+" : ""}${p.toFixed(2)}%`,
    });
    link.themes.forEach(t => {
      if (!themeBias[t]) themeBias[t] = { score: 0, drivers: [] };
      themeBias[t].score += p;
      themeBias[t].drivers.push({ name: link.name, pct: p });
    });
  });

  hints.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  return { hints, themeBias };
}

// --- 美股連動對應表結束 ---

// --- 美股連動提示面板 ---
function USLinkagePanel({ usRows, onPickTheme }) {
  const [open, setOpen] = useState(false);
  if (!usRows?.length) return null;

  const { hints, themeBias } = buildLinkageHints(usRows);
  const indexes = usRows.filter(r => US_INDEXES[r.sym]);
  const sox = usRows.find(r => r.sym === "^SOX");

  // 題材依連動強度排序
  const themes = Object.entries(themeBias)
    .map(([t, v]) => ({ theme: t, avg: v.score / v.drivers.length, drivers: v.drivers }))
    .filter(t => Math.abs(t.avg) >= 1.5)
    .sort((a, b) => Math.abs(b.avg) - Math.abs(a.avg));

  const col = p => p > 0 ? "#ef4444" : p < 0 ? "#22c55e" : "#999";
  const dateStr = usRows[0]?.date || "";

  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>美股連動</span>
          {sox && sox.pct !== null && (
            <span style={{ fontSize: 13, color: col(sox.pct) }}>
              費半 {sox.pct > 0 ? "+" : ""}{sox.pct.toFixed(2)}%
            </span>
          )}
          {themes.length > 0 && (
            <span style={{ fontSize: 13, color: col(themes[0].avg) }}>
              {themes[0].theme}{themes[0].avg > 0 ? "偏多" : "偏空"}
            </span>
          )}
        </div>
        <span style={{ fontSize: 12, color: "#777" }}>{open ? "收合" : "展開"}</span>
      </button>

      {open && (
        <div style={{ padding: "0 12px 12px" }}>
          {dateStr && <div style={{ fontSize: 12, color: "#777", marginBottom: 10 }}>美股收盤日：{dateStr}</div>}

          {/* 指數 */}
          {indexes.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 12 }}>
              {indexes.map(r => (
                <div key={r.sym} style={{ background: "#0a0a0a", borderRadius: 6, padding: "7px 4px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#888" }}>{US_INDEXES[r.sym].name}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: col(r.pct) }}>
                    {r.pct !== null ? `${r.pct > 0 ? "+" : ""}${r.pct.toFixed(2)}%` : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 題材連動推論 */}
          {themes.length > 0 ? (
            <>
              <div style={{ fontSize: 13, color: "#bbb", marginBottom: 7 }}>可能受影響的台股題材</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {themes.slice(0, 5).map(t => (
                  <button key={t.theme} onClick={() => onPickTheme?.(t.theme)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
                      background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 8, padding: "8px 10px", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: "#ddd", marginBottom: 2 }}>
                        {t.theme}
                        <span style={{ color: col(t.avg), marginLeft: 6, fontSize: 13 }}>
                          {t.avg > 0 ? "偏多" : "偏空"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>
                        {t.drivers.map(d => `${d.name} ${d.pct > 0 ? "+" : ""}${d.pct.toFixed(1)}%`).join("、")}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: "#f97316", whiteSpace: "nowrap" }}>篩選</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "#999", marginBottom: 12, lineHeight: 1.7 }}>
              美股個股漲跌幅都在 2% 以內，今日無明顯連動訊號。
            </div>
          )}

          {/* 個股明細 */}
          {hints.length > 0 && (
            <>
              <div style={{ fontSize: 13, color: "#bbb", marginBottom: 7 }}>美股主要變動</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {hints.slice(0, 6).map(h => (
                  <div key={h.sym} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
                    <span style={{ minWidth: 58, color: col(h.pct), fontWeight: 600 }}>
                      {h.pct > 0 ? "+" : ""}{h.pct.toFixed(2)}%
                    </span>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: "#ddd" }}>{h.name}</span>
                      <span style={{ color: "#888", fontSize: 12 }}>（{h.sym}）</span>
                      <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>{h.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ fontSize: 11, color: "#777", marginTop: 10, lineHeight: 1.6 }}>
            連動僅為產業關聯推論，台股實際走勢仍受本地籌碼與消息面影響。
          </div>
        </div>
      )}
    </div>
  );
}

// --- 由診斷結果解析出正確的股票代號 ---
function resolveStock(result, stocks) {
  const q = (result.query || "").trim();
  const nameGuess = (result.stockName || "").replace(/\s*[（(]\d{4}[)）]/, "").trim();

  // 1. 使用者直接輸入四碼代號
  let code = (q.match(/^\d{4}$/) || [])[0];
  // 2. AI 回覆的「名稱 (代號)」格式
  if (!code) code = (result.stockName?.match(/\d{4}/) || [])[0];
  // 3. 從技術面全文找四碼代號
  if (!code) code = (result.techText?.match(/[（(](\d{4})[)）]/) || [])[1];
  // 4. 用名稱到全市場清單反查
  if (!code && stocks?.length) {
    const key = nameGuess || q;
    const hit = stocks.find(s => s.name === key)
             || stocks.find(s => key && (s.name?.includes(key) || key.includes(s.name)));
    if (hit) code = hit.id;
  }
  // 5. 查名稱：若已有代號，優先用全市場清單的正式名稱
  let name = nameGuess || q;
  if (code && stocks?.length) {
    const hit = stocks.find(s => s.id === code);
    if (hit?.name) name = hit.name;
  }
  return { code: code || q, name, resolved: !!code };
}

// --- Watchlist hook ---
function useWatchlist() {
  const [list, setList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-watchlist")) || []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem("tw-stock-watchlist", JSON.stringify(list)); }, [list]);

  const norm = (s) => (s || "").toString().trim();

  const add = (item) => setList(prev => {
    const id = norm(item.id), name = norm(item.name);
    // 同代號或同名稱都視為重複
    const dupIdx = prev.findIndex(p =>
      norm(p.id) === id || (name && norm(p.name) === name)
    );
    if (dupIdx >= 0) {
      // 已存在：若新資料帶了正確代號就補上去（修正舊的錯誤紀錄）
      const copy = [...prev];
      const old = copy[dupIdx];
      copy[dupIdx] = {
        ...old,
        id: /^\d{4}$/.test(id) ? id : old.id,
        name: name || old.name,
      };
      return copy;
    }
    return [{ ...item, addedAt: new Date().toISOString() }, ...prev];
  });

  const remove = (id) => setList(prev => prev.filter(p => norm(p.id) !== norm(id)));
  const has = (idOrName) => {
    const q = norm(idOrName);
    return list.some(p => norm(p.id) === q || norm(p.name) === q);
  };
  const update = (id, data) => setList(prev => prev.map(p => norm(p.id) === norm(id) ? { ...p, ...data } : p));
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

// 本益比、殖利率、股價淨值比
async function fetchValuation() {
  const rows = await fetchTWSE("https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL", "bwibbu_all.json");
  const map = {};
  for (const r of rows) {
    const code = r.Code || r.證券代號;
    if (!code) continue;
    map[code] = {
      pe: parseFloat(r.PEratio || r.本益比) || null,
      dy: parseFloat(r.DividendYield || r.殖利率) || null,
      pb: parseFloat(r.PBratio || r.股價淨值比) || null,
    };
  }
  return map;
}

// 個股近期日線（用於 K 線圖與技術指標）
async function fetchStockHistory(code) {
  const now = new Date();
  // 試本月，資料不足再補上個月
  const months = [
    new Date(now.getFullYear(), now.getMonth(), 1),
    new Date(now.getFullYear(), now.getMonth() - 1, 1),
  ];

  const fetchMonth = async (dt) => {
    const ym = `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}01`;
    const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${ym}&stockNo=${code}`;
    for (const wrap of CORS_PROXIES) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 9000);
        const r = await fetch(wrap(url), { signal: ctrl.signal });
        clearTimeout(timer);
        if (!r.ok) continue;
        let txt = await r.text();
        let j = JSON.parse(txt);
        if (j && typeof j.contents === "string") j = JSON.parse(j.contents);
        if (!j?.data?.length) continue;
        return j.data.map(row => ({
          date: row[0],
          open: parseFloat(String(row[3]).replace(/,/g, "")),
          high: parseFloat(String(row[4]).replace(/,/g, "")),
          low: parseFloat(String(row[5]).replace(/,/g, "")),
          close: parseFloat(String(row[6]).replace(/,/g, "")),
          volume: parseInt(String(row[1]).replace(/,/g, "")) || 0,
        })).filter(x => isFinite(x.close) && x.close > 0);
      } catch {}
    }
    return [];
  };

  let out = await fetchMonth(months[0]);
  if (out.length < 26) {
    const prev = await fetchMonth(months[1]);
    out = [...prev, ...out];
  }
  if (out.length === 0) throw new Error("無法取得歷史資料");
  return out;
}

// --- 產業分類（依代號區間，台股編碼規則）---
function getSector(code) {
  const n = parseInt(code);
  if (n >= 1100 && n <= 1110) return "水泥";
  if (n >= 1201 && n <= 1240) return "食品";
  if (n >= 1301 && n <= 1338) return "塑膠";
  if (n >= 1401 && n <= 1479) return "紡織";
  if (n >= 1503 && n <= 1591) return "電機機械";
  if (n >= 1603 && n <= 1618) return "電器電纜";
  if (n >= 1701 && n <= 1795) return "生技醫療";
  if (n >= 1802 && n <= 1815) return "玻璃陶瓷";
  if (n >= 1901 && n <= 1909) return "造紙";
  if (n >= 2002 && n <= 2069) return "鋼鐵";
  if (n >= 2101 && n <= 2114) return "橡膠";
  if (n >= 2201 && n <= 2247) return "汽車";
  if (n >= 2301 && n <= 2499) return "電子";
  if (n >= 2501 && n <= 2548) return "營建";
  if (n >= 2601 && n <= 2649) return "航運";
  if (n >= 2701 && n <= 2739) return "觀光餐旅";
  if (n >= 2801 && n <= 2899) return "金融保險";
  if (n >= 2901 && n <= 2936) return "貿易百貨";
  if (n >= 3000 && n <= 3999) return "電子";
  if (n >= 4100 && n <= 4199) return "生技醫療";
  if (n >= 4200 && n <= 4999) return "其他";
  if (n >= 5000 && n <= 5999) return "電子";
  if (n >= 6000 && n <= 6999) return "電子";
  if (n >= 8000 && n <= 8999) return "其他";
  if (n >= 9000 && n <= 9999) return "其他";
  return "其他";
}

const SECTOR_LIST = ["全部", "電子", "金融保險", "航運", "鋼鐵", "塑膠", "生技醫療", "食品", "營建", "汽車", "紡織", "電機機械", "觀光餐旅", "貿易百貨", "水泥", "橡膠", "造紙", "玻璃陶瓷", "電器電纜", "其他"];

// --- K 線圖元件 ---
function KLineChart({ data, height = 160 }) {
  if (!data || data.length < 2) return null;
  const w = 320, padL = 4, padR = 40, padT = 8, padB = 18;
  const cw = w - padL - padR, ch = height - padT - padB;
  const highs = data.map(d => d.high), lows = data.map(d => d.low);
  const max = Math.max(...highs), min = Math.min(...lows);
  const range = max - min || 1;
  const y = v => padT + ch - ((v - min) / range) * ch;
  const bw = Math.max(2, (cw / data.length) * 0.65);
  const x = i => padL + (i + 0.5) * (cw / data.length);

  // 5日均線
  const ma5 = data.map((_, i) => {
    if (i < 4) return null;
    return data.slice(i - 4, i + 1).reduce((s, d) => s + d.close, 0) / 5;
  });
  const maPath = ma5.map((v, i) => v === null ? null : `${x(i)},${y(v)}`).filter(Boolean).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", display: "block" }}>
      {/* 水平參考線 */}
      {[0, 0.5, 1].map(t => (
        <g key={t}>
          <line x1={padL} y1={padT + ch * t} x2={padL + cw} y2={padT + ch * t} stroke="#1e1e1e" strokeWidth="1" />
          <text x={w - padR + 4} y={padT + ch * t + 4} fill="#777" fontSize="10">
            {(max - range * t).toFixed(1)}
          </text>
        </g>
      ))}
      {/* K 棒 */}
      {data.map((d, i) => {
        const up = d.close >= d.open;
        const col = up ? "#ef4444" : "#22c55e";
        const bodyTop = y(Math.max(d.open, d.close));
        const bodyH = Math.max(1, Math.abs(y(d.open) - y(d.close)));
        return (
          <g key={i}>
            <line x1={x(i)} y1={y(d.high)} x2={x(i)} y2={y(d.low)} stroke={col} strokeWidth="1" />
            <rect x={x(i) - bw / 2} y={bodyTop} width={bw} height={bodyH} fill={up ? col : "none"} stroke={col} strokeWidth="1" />
          </g>
        );
      })}
      {/* 5MA */}
      {maPath && <polyline points={maPath} fill="none" stroke="#f59e0b" strokeWidth="1.2" opacity="0.85" />}
      {/* 日期標示 */}
      <text x={padL} y={height - 4} fill="#777" fontSize="10">{data[0]?.date?.slice(-5)}</text>
      <text x={padL + cw} y={height - 4} fill="#777" fontSize="10" textAnchor="end">{data[data.length - 1]?.date?.slice(-5)}</text>
    </svg>
  );
}

// --- 題材概念股分類（依實際產業歸屬手動整理）---
const THEMES = {
  "AI伺服器": ["2382","3231","6669","2356","2376","2317","3017","3653","6215","2408","3005","6230","8112","2377","4915","3661","5388","6669","2345","3702"],
  "半導體": ["2330","2303","2454","3711","6770","2408","5347","3105","8069","3035","3443","6533","4966","3529","6789","3034","2379","3227","8016","6239","2449","6488","3260","5269","3532"],
  "AI晶片/IP": ["3661","6533","4966","3529","5274","6643","3035","8299","6531","3443"],
  "電動車": ["2207","1319","1536","2231","2371","6213","2313","3563","1609","2062","6605","4552","1590"],
  "綠能/儲能": ["6806","6443","3576","1519","6282","4739","2308","1513","6438","3266","1504","6244"],
  "生技醫療": ["4174","6446","1795","6547","4147","1789","4154","6491","3705","6535","4737","1762","4142","6469","1723"],
  "金融保險": ["2881","2882","2883","2884","2885","2886","2887","2888","2890","2891","2892","5880","2801","2809","2812","2820","2834","2845","2849","2855","2867","2880","2889"],
  "航運": ["2603","2609","2615","2606","2607","2608","2610","2612","2613","2617","2618","5608","2637","2642","5607"],
  "傳產原物料": ["1301","1303","1326","1101","1102","2002","2006","2014","2015","2023","2027","2031","1304","1305","1308","1309","1310","1312","1313","1314"],
  "被動元件": ["2327","2492","2375","6153","2456","3044","5285","6285","2308"],
  "網通/光通訊": ["2345","4977","3450","6143","2419","3062","4979","6462","2314","3491","6187","3234"],
  "面板/光電": ["2409","3481","6116","2393","3019","3031","6176","8039","3714","2426","6120"],
  "重電/電力": ["1503","1504","1513","1514","1519","1533","1540","1560","1584","6412","2371"],
  "食品內需": ["1216","1210","1201","1229","1231","1233","1234","2912","2903","2915","5903","2923","1218","1227"],
  "營建資產": ["2501","2504","2505","2506","2509","2511","2515","2520","2534","2542","2545","2547","5515","5522","5534"],
  "觀光餐飲": ["2701","2702","2704","2705","2707","2712","2727","2729","2731","2739","5706","1259","2748"],
};

function getThemes(code) {
  const out = [];
  for (const [name, list] of Object.entries(THEMES)) {
    if (list.includes(code)) out.push(name);
  }
  return out;
}


// --- 價格等級 ---
function getPriceTier(price) {
  const p = parseFloat(price);
  if (p >= 500) return "高價股";
  if (p >= 100) return "中價股";
  if (p >= 50) return "低價股";
  return "銅板股";
}
const PRICE_TIERS = [
  { key: "all", label: "不限" },
  { key: "高價股", label: "高價 ≥500" },
  { key: "中價股", label: "中價 100-500" },
  { key: "低價股", label: "低價 50-100" },
  { key: "銅板股", label: "銅板 <50" },
];

// --- 成交量等級（張）---
function getVolumeTier(volume) {
  const lots = (volume || 0) / 1000;
  if (lots >= 20000) return "爆量";
  if (lots >= 5000) return "大量";
  if (lots >= 1000) return "中量";
  return "小量";
}
const VOLUME_TIERS = [
  { key: "all", label: "不限" },
  { key: "爆量", label: "爆量 ≥2萬張" },
  { key: "大量", label: "大量 ≥5千張" },
  { key: "中量", label: "中量 ≥1千張" },
  { key: "小量", label: "小量 <1千張" },
];

// --- 漲跌幅區間 ---
function getChangeTier(changeStr) {
  const p = parseFloat(changeStr);
  if (!isFinite(p)) return "平盤";
  if (p >= 9.5) return "漲停";
  if (p >= 5) return "大漲";
  if (p >= 1) return "上漲";
  if (p > -1) return "平盤";
  if (p > -5) return "下跌";
  if (p > -9.5) return "大跌";
  return "跌停";
}
const CHANGE_TIERS = [
  { key: "all", label: "不限" },
  { key: "漲停", label: "漲停" },
  { key: "大漲", label: "大漲 ≥5%" },
  { key: "上漲", label: "上漲 1-5%" },
  { key: "平盤", label: "平盤 ±1%" },
  { key: "下跌", label: "下跌 1-5%" },
  { key: "大跌", label: "大跌 ≥5%" },
  { key: "跌停", label: "跌停" },
];

// --- 篩選列元件（多選）---
function FilterRow({ label, options, values, onToggle, onClear, last }) {
  const active = values && values.length > 0;
  return (
    <div style={{ marginBottom: last ? 0 : 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: "#bbb" }}>{label}</span>
        {active && (
          <button onClick={onClear}
            style={{ fontSize: 12, color: "#888", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            清除
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {options.map(o => {
          const on = values.includes(o.key);
          return (
            <button key={String(o.key)} onClick={() => onToggle(o.key)}
              style={{ padding: "4px 10px", fontSize: 13, borderRadius: 8, cursor: "pointer",
                border: on ? "1px solid #f97316" : "1px solid #222",
                background: on ? "#1a1510" : "#111",
                color: on ? "#f97316" : "#999" }}>
              {on ? "✓ " : ""}{o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- 真正的技術指標（需要歷史資料）---
function calcMA(data, n) {
  if (data.length < n) return null;
  return data.slice(-n).reduce((s, d) => s + d.close, 0) / n;
}

function calcRSI(data, n = 14) {
  if (data.length < n + 1) return null;
  let gain = 0, loss = 0;
  for (let i = data.length - n; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff > 0) gain += diff; else loss -= diff;
  }
  if (loss === 0) return 100;
  const rs = (gain / n) / (loss / n);
  return 100 - 100 / (1 + rs);
}

function calcKD(data, n = 9) {
  if (data.length < n) return null;
  let k = 50, d = 50;
  for (let i = n - 1; i < data.length; i++) {
    const win = data.slice(i - n + 1, i + 1);
    const high = Math.max(...win.map(x => x.high));
    const low = Math.min(...win.map(x => x.low));
    const rsv = high === low ? 50 : ((data[i].close - low) / (high - low)) * 100;
    k = (2 / 3) * k + (1 / 3) * rsv;
    d = (2 / 3) * d + (1 / 3) * k;
  }
  return { k, d };
}

function calcMACD(data) {
  if (data.length < 26) return null;
  const ema = (arr, n) => {
    const mult = 2 / (n + 1);
    let e = arr.slice(0, n).reduce((s, v) => s + v, 0) / n;
    for (let i = n; i < arr.length; i++) e = (arr[i] - e) * mult + e;
    return e;
  };
  const closes = data.map(d => d.close);
  const difLine = [];
  for (let i = 26; i <= closes.length; i++) {
    const sub = closes.slice(0, i);
    difLine.push(ema(sub, 12) - ema(sub, 26));
  }
  if (difLine.length < 9) return { dif: difLine[difLine.length - 1], macd: 0, osc: 0 };
  const macd = ema(difLine, 9);
  const dif = difLine[difLine.length - 1];
  return { dif, macd, osc: dif - macd };
}

// 完整技術面評分（0-100）+ 買賣判定
function analyzeTechnical(data) {
  if (!data || data.length < 20) return null;
  const last = data[data.length - 1];
  const prev = data[data.length - 2];
  const close = last.close;

  const ma5 = calcMA(data, 5);
  const ma10 = calcMA(data, 10);
  const ma20 = calcMA(data, 20);
  const rsi = calcRSI(data, 14);
  const kd = calcKD(data, 9);
  const macd = calcMACD(data);

  let score = 0;
  const signals = [];
  const detail = [];
  const add = (pts, label, note) => {
    score += pts;
    if (pts !== 0) { signals.push(label); detail.push({ pts, label, note }); }
  };

  // 1. 均線多空排列（權重最高）
  if (ma5 && ma10 && ma20) {
    if (ma5 > ma10 && ma10 > ma20)
      add(2.5, "均線多頭排列", `5MA ${ma5.toFixed(1)} > 10MA ${ma10.toFixed(1)} > 20MA ${ma20.toFixed(1)}，短中期趨勢向上`);
    else if (ma5 < ma10 && ma10 < ma20)
      add(-2.5, "均線空頭排列", `5MA ${ma5.toFixed(1)} < 10MA ${ma10.toFixed(1)} < 20MA ${ma20.toFixed(1)}，趨勢向下`);

    if (close > ma20) add(1, "站上月線", `收盤 ${close} 高於 20MA ${ma20.toFixed(1)}，中期偏多`);
    else add(-1, "跌破月線", `收盤 ${close} 低於 20MA ${ma20.toFixed(1)}，中期轉弱`);

    const bias = ((close - ma20) / ma20) * 100;
    if (bias > 15) add(-1.5, "正乖離過大", `離月線 +${bias.toFixed(1)}%，短線漲多有回檔風險`);
    else if (bias < -15) add(1, "負乖離大", `離月線 ${bias.toFixed(1)}%，跌深可能反彈`);
  }

  // 2. KD
  if (kd) {
    if (kd.k < 20 && kd.k > kd.d)
      add(2, "KD低檔黃金交叉", `K ${kd.k.toFixed(0)} 在低檔向上穿越 D ${kd.d.toFixed(0)}，落底轉強訊號`);
    else if (kd.k > 80 && kd.k < kd.d)
      add(-2, "KD高檔死亡交叉", `K ${kd.k.toFixed(0)} 在高檔向下跌破 D ${kd.d.toFixed(0)}，見頂訊號`);
    else if (kd.k > kd.d && kd.k < 70)
      add(1, "KD黃金交叉", `K ${kd.k.toFixed(0)} 高於 D ${kd.d.toFixed(0)}，動能轉強`);
    else if (kd.k < kd.d && kd.k > 30)
      add(-1, "KD死亡交叉", `K ${kd.k.toFixed(0)} 低於 D ${kd.d.toFixed(0)}，動能轉弱`);

    if (kd.k > 85) add(-1, "KD超買", `K 值 ${kd.k.toFixed(0)} 過高，短線過熱`);
    if (kd.k < 15) add(1, "KD超賣", `K 值 ${kd.k.toFixed(0)} 過低，接近超賣區`);
  }

  // 3. RSI
  if (rsi !== null) {
    if (rsi > 75) add(-1.5, "RSI過熱", `RSI ${rsi.toFixed(0)}（>70 為超買），追高風險提高`);
    else if (rsi < 25) add(1.5, "RSI超賣", `RSI ${rsi.toFixed(0)}（<30 為超賣），有反彈機會`);
    else if (rsi > 55) add(0.5, "RSI偏強", `RSI ${rsi.toFixed(0)}，多方稍佔優勢`);
    else if (rsi < 45) add(-0.5, "RSI偏弱", `RSI ${rsi.toFixed(0)}，空方稍佔優勢`);
  }

  // 4. MACD
  if (macd) {
    if (macd.osc > 0 && macd.dif > 0)
      add(1.5, "MACD多方", `柱狀體 +${macd.osc.toFixed(2)} 且 DIF 為正，中期動能偏多`);
    else if (macd.osc < 0 && macd.dif < 0)
      add(-1.5, "MACD空方", `柱狀體 ${macd.osc.toFixed(2)} 且 DIF 為負，中期動能偏空`);
    else if (macd.osc > 0) add(0.5, "MACD轉強", `柱狀體翻正 +${macd.osc.toFixed(2)}`);
    else add(-0.5, "MACD轉弱", `柱狀體翻負 ${macd.osc.toFixed(2)}`);
  }

  // 5. 量價關係
  const avgVol = data.slice(-20).reduce((s, d) => s + d.volume, 0) / 20;
  const volRatio = avgVol > 0 ? last.volume / avgVol : 1;
  const priceUp = close > prev.close;
  if (volRatio > 1.8 && priceUp)
    add(1.5, "帶量上攻", `成交量是 20 日均量的 ${volRatio.toFixed(1)} 倍且上漲，有資金進場`);
  else if (volRatio > 1.8 && !priceUp)
    add(-1.5, "爆量下殺", `成交量 ${volRatio.toFixed(1)} 倍但下跌，疑似出貨`);
  else if (volRatio < 0.6 && !priceUp)
    add(0.5, "量縮止跌", `量縮至 ${volRatio.toFixed(1)} 倍，賣壓減輕`);
  else if (volRatio < 0.6 && priceUp)
    add(-0.5, "量縮上漲乏力", `上漲但量縮至 ${volRatio.toFixed(1)} 倍，追價意願低`);

  // 6. 近月相對位置
  const monthHigh = Math.max(...data.slice(-20).map(d => d.high));
  const monthLow = Math.min(...data.slice(-20).map(d => d.low));
  const posInRange = monthHigh > monthLow ? (close - monthLow) / (monthHigh - monthLow) : 0.5;
  if (posInRange > 0.95) add(0.5, "創月新高", `突破近 20 日高點 ${monthHigh.toFixed(1)}`);
  else if (posInRange < 0.05) add(-0.5, "創月新低", `跌破近 20 日低點 ${monthLow.toFixed(1)}`);

  let verdict;
  if (score >= 6) verdict = "強力買進";
  else if (score >= 2.5) verdict = "買進";
  else if (score > -2.5) verdict = "觀望";
  else if (score > -6) verdict = "賣出";
  else verdict = "強力賣出";

  return {
    verdict, score, detail, mode: "deep",
    reason: signals.slice(0, 4).join("、"),
    indicators: { ma5, ma10, ma20, rsi, k: kd?.k, d: kd?.d, macd: macd?.osc, volRatio },
  };
}

// --- 評分明細說明 ---
function ScoreBreakdown({ detail, score, verdict, mode }) {
  if (!detail || detail.length === 0) return null;

  const thresholds = mode === "deep"
    ? [["強力買進", 6], ["買進", 2.5], ["觀望", -2.5], ["賣出", -6]]
    : [["強力買進", 5], ["買進", 2.5], ["觀望", -2.5], ["賣出", -5]];

  const vc = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" }[verdict] || "#888";
  const plus = detail.filter(d => d.pts > 0);
  const minus = detail.filter(d => d.pts < 0);

  return (
    <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 12, marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 14, color: "#ccc", fontWeight: 600 }}>
          為什麼判定「{verdict}」
        </span>
        <span style={{ fontSize: 13, color: "#888" }}>
          {mode === "deep" ? "深度分析" : "當日快篩"}
        </span>
      </div>

      {/* 明細條列 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
        {[...plus, ...minus].map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{
              minWidth: 42, textAlign: "center", padding: "2px 0", borderRadius: 5,
              fontSize: 13, fontWeight: 700,
              background: d.pts > 0 ? "#2a1515" : "#0d1f0d",
              color: d.pts > 0 ? "#ef4444" : "#22c55e",
            }}>
              {d.pts > 0 ? "+" : ""}{d.pts}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: "#ddd" }}>{d.label}</div>
              {d.note && <div style={{ fontSize: 12, color: "#999", lineHeight: 1.6, marginTop: 1 }}>{d.note}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* 總分 */}
      <div style={{ borderTop: "1px solid #1e1e1e", paddingTop: 9 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14, color: "#ccc" }}>總分</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: vc }}>
            {score > 0 ? "+" : ""}{score.toFixed(1)}
          </span>
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {thresholds.map(([name, min], i) => {
            const on = verdict === name || (i === thresholds.length - 1 && verdict === "強力賣出" && score <= min);
            const isCur = verdict === name;
            return (
              <div key={name} style={{
                flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 5, fontSize: 11,
                background: isCur ? vc + "22" : "#111",
                color: isCur ? vc : "#777",
                border: isCur ? `1px solid ${vc}66` : "1px solid #1a1a1a",
                fontWeight: isCur ? 700 : 400,
              }}>
                <div>{name}</div>
                <div style={{ fontSize: 10, marginTop: 1 }}>≥{min}</div>
              </div>
            );
          })}
          <div style={{
            flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 5, fontSize: 11,
            background: verdict === "強力賣出" ? "#16a34a22" : "#111",
            color: verdict === "強力賣出" ? "#16a34a" : "#777",
            border: verdict === "強力賣出" ? "1px solid #16a34a66" : "1px solid #1a1a1a",
            fontWeight: verdict === "強力賣出" ? 700 : 400,
          }}>
            <div>強力賣出</div>
            <div style={{ fontSize: 10, marginTop: 1 }}>更低</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 用證交所真實數據計算買賣訊號（不需 AI）---
function calcVerdict(r) {
  let score = 0;
  const reasons = [];
  const detail = [];   // 每項加減分的明細
  const pct = r.pct ?? 0;
  const range = (r.high && r.low) ? (r.high - r.low) : 0;
  const pos = range > 0 ? (r.close - r.low) / range : 0.5;

  const add = (pts, label, note) => {
    score += pts;
    if (pts !== 0) { reasons.push(label); detail.push({ pts, label, note }); }
  };

  // 1. 漲跌幅
  if (pct >= 5) add(2, "強勢大漲", `今日漲 ${pct.toFixed(2)}%，買盤積極`);
  else if (pct >= 2) add(1.5, "明顯上漲", `今日漲 ${pct.toFixed(2)}%`);
  else if (pct > 0) add(0.5, "收紅", `今日漲 ${pct.toFixed(2)}%`);
  else if (pct <= -5) add(-2, "重挫", `今日跌 ${pct.toFixed(2)}%，賣壓沉重`);
  else if (pct <= -2) add(-1.5, "明顯下跌", `今日跌 ${pct.toFixed(2)}%`);
  else if (pct < 0) add(-0.5, "收黑", `今日跌 ${pct.toFixed(2)}%`);

  // 2. 收盤位置
  const posPct = (pos * 100).toFixed(0);
  if (pos >= 0.8) add(1.5, "收最高附近", `收盤落在當日高低區間第 ${posPct}%，尾盤買盤強`);
  else if (pos >= 0.6) add(0.5, "收盤偏高", `收盤落在區間第 ${posPct}%`);
  else if (pos <= 0.2) add(-1.5, "收最低附近", `收盤落在區間第 ${posPct}%，尾盤被殺`);
  else if (pos <= 0.4) add(-0.5, "收盤偏低", `收盤落在區間第 ${posPct}%`);

  // 3. K 棒實體
  if (r.open && r.close > r.open) {
    const body = ((r.close - r.open) / r.open) * 100;
    if (body >= 2) add(1, "長紅K棒", `開 ${r.open} 收 ${r.close}，實體 ${body.toFixed(1)}%`);
    else add(0.3, "紅K", `開低走高，實體 ${body.toFixed(1)}%`);
  } else if (r.open && r.close < r.open) {
    const body = ((r.open - r.close) / r.open) * 100;
    if (body >= 2) add(-1, "長黑K棒", `開 ${r.open} 收 ${r.close}，實體 ${body.toFixed(1)}%`);
    else add(-0.3, "黑K", `開高走低，實體 ${body.toFixed(1)}%`);
  }

  // 4. 跳空
  if (r.open && r.close && r.change !== null) {
    const prevClose = r.close - r.change;
    if (r.low > prevClose) add(1, "向上跳空", `最低 ${r.low} 仍高於昨收 ${prevClose.toFixed(2)}`);
    else if (r.high < prevClose) add(-1, "向下跳空", `最高 ${r.high} 仍低於昨收 ${prevClose.toFixed(2)}`);
  }

  // 5. 振幅
  if (range > 0 && r.close > 0) {
    const amp = (range / r.close) * 100;
    if (amp >= 7) add(-0.5, "振幅劇烈", `當日振幅 ${amp.toFixed(1)}%，波動風險高`);
  }

  let verdict;
  if (score >= 5) verdict = "強力買進";
  else if (score >= 2.5) verdict = "買進";
  else if (score > -2.5) verdict = "觀望";
  else if (score > -5) verdict = "賣出";
  else verdict = "強力賣出";

  return { verdict, reason: reasons.slice(0, 3).join("、"), score, detail, mode: "quick" };
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
        setTestResult({ ok: true, msg: "驗證成功，且即時搜尋可用，股價資料會是真實的。" });
      } else {
        setTestResult({ ok: true, warn: true, msg: "Key 可用，但「即時搜尋」沒有啟用。AI 會用舊資料推測股價，數字不可信。建議改用 Anthropic Claude，或到 Google Cloud 啟用 Grounding with Google Search。" });
      }
      apiKey.save(input);
    } catch (e) {
      setTestResult({ ok: false, msg: "驗證失敗：" + e.message });
    }
    setTesting(false);
  };

  return (
    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 20, marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>API 設定</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#ccc", fontSize: 22, cursor: "pointer" }}>×</button>
      </div>

      <div style={{ fontSize: 15, color: "#ccc", marginBottom: 8 }}>選擇 AI 引擎</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { id: "gemini", name: "Google Gemini", tag: "免費", desc: "每天可用 500 次" },
          { id: "anthropic", name: "Anthropic Claude", tag: "付費", desc: "需儲值 $5 美金起" },
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
          <div style={{ fontWeight: 600, marginBottom: 4, color: "#22c55e", fontSize: 15 }}>免費取得 Gemini API Key</div>
          1. 到 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style={{ color: "#f97316" }}>aistudio.google.com/apikey</a> 用 Google 帳號登入<br/>
          2. 點「建立 API 金鑰」→ 選一個專案<br/>
          3. 複製金鑰（AIzaSy... 開頭）貼到上方<br/>
          <strong style={{ color: "#22c55e" }}>完全免費，不需信用卡</strong>
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
function TabDiagnosis({ watchlist, apiKey, stocks }) {
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
    if (!apiKey.hasKey) { setError("請先在右上角設定 API Key 才能使用 AI 診斷"); return; }
    setLoading(true); setResult(null); setError("");
    try {
      // Step 1: Technical + Verdict
      setStep("搜尋股價與技術指標…");
      const { text: techText, grounded: g1 } = await callAI(`你是台股首席分析師。用戶查詢：「${searchQ}」

請搜尋這檔股票最新資料，嚴格按以下格式回答（繁體中文）：

股票：[名稱] ([代號])
股價：[最新收盤價] 元（[漲跌金額] / [漲跌幅%]）
技術面：KD=[K值]/[D值]（[狀態]）、RSI=[數值]、MACD=[紅柱/綠柱]
均線：vs 5日/20日/60日均線（站上或跌破）
法人：外資[買超/賣超]、投信[買超/賣超]（近5日累計）

===== 診斷結論 =====
判定：【買進】或【賣出】或【觀望】（三選一，必須明確）
信心度：[高/中/低]
一句話理由：[為什麼應該買或賣]
建議策略：[具體操作，例如「分批買進，停損設在XX元」]
最大風險：[主要風險]`, apiKey.key, apiKey.provider);

      // Step 2: Financial report
      setStep("分析財報數據…");
      const { text: finText } = await callAI(`你是台股財報分析師。請搜尋「${searchQ}」這檔股票的最新財報數據。

請嚴格按照以下格式回答，每項給出 0-100 的評分：

財報健檢結果：

營收成長力 [評分]/100
   - 近四季營收年增率：[數據]
   - 趨勢：[連續成長/衰退/持平]

獲利能力 EPS [評分]/100
   - 近四季 EPS：[數據]
   - 年增率：[數據]

毛利率表現 [評分]/100
   - 最新毛利率：[數據]%
   - vs 同業平均：[高於/低於]

股東權益 ROE [評分]/100
   - 最新 ROE：[數據]%
   - 趨勢：[改善/惡化/穩定]

財務體質（負債比）[評分]/100
   - 負債比率：[數據]%
   - 流動比率：[數據]%

財報總評：[用2句話總結這家公司的財務狀況，是否值得投資]`, apiKey.key, apiKey.provider);

      // Step 3: News
      setStep("搜尋最新相關新聞…");
      const { text: newsText } = await callAI(`搜尋「${searchQ}」台股 最近一週的重要新聞，找出 3-5 則最關鍵的新聞。

請嚴格按以下格式回答（繁體中文）：

最新消息（近一週）

/[利多/利空] [新聞標題摘要]
   → 影響：[對股價的可能影響，1句話]

/[利多/利空] [新聞標題摘要]
   → 影響：[對股價的可能影響，1句話]

（列出 3-5 則）

新聞面總評：整體偏[利多/利空/中性]，[1句話說明]`, apiKey.key, apiKey.provider);

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
          <div style={{ fontSize: 28, marginBottom: 8 }}></div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#f59e0b", marginBottom: 6 }}>需要設定 API Key</div>
          <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.7 }}>
            AI 診斷功能需要 Anthropic API Key。<br/>
            請點右上角「設定 API Key」進行設定。
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ margin: "8px 16px", padding: 12, background: "#2a1515", border: "1px solid #dc2626", borderRadius: 8, fontSize: 14, color: "#fca5a5" }}>
          {error}
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
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>未使用即時搜尋</div>
              <div style={{ fontSize: 13, color: "#ddd", lineHeight: 1.7 }}>
                以下數字可能是 AI 推測的舊資料，不是今日真實股價。下單前請到券商 App 確認。
              </div>
            </div>
          )}
          <VerdictCard verdict={result.verdict} stockName={result.stockName} price={result.price} change={result.change} />

          {/* Add to watchlist button */}
          {(() => {
            const resolved = resolveStock(result, stocks);
            const wlCode = resolved.code;
            const wlName = resolved.name;
            const added = watchlist.has(wlCode) || watchlist.has(wlName);
            return (
              <>
                <button onClick={() => watchlist.add({ id: wlCode, name: wlName, verdict: result.verdict, time: new Date().toISOString(), techText: result.techText, finText: result.finText })}
                  disabled={added}
                  style={{ width: "100%", padding: "8px 0", borderRadius: 8, border: "1px solid #333", background: added ? "#1a1a1a" : "#141414", color: added ? "#555" : "#f59e0b", fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: resolved.resolved ? 12 : 6 }}>
                  {added ? "已加入自選股" : `加入自選股追蹤${resolved.resolved ? `（${wlName} ${wlCode}）` : ""}`}
                </button>
                {!resolved.resolved && (
                  <div style={{ fontSize: 13, color: "#fcd34d", background: "#2a1510", border: "1px solid #f59e0b44", borderRadius: 8, padding: "8px 10px", marginBottom: 12, lineHeight: 1.6 }}>
                    找不到對應的股票代號，加入後可能無法顯示股價。建議改用四碼代號查詢（例如 2330），或先到「買進／排行」頁掃描一次。
                  </div>
                )}
              </>
            );
          })()}

          {/* Financial Score Rings */}
          {result.finScores && Object.keys(result.finScores).length > 0 && (
            <div style={{ padding: "14px 10px 12px", marginBottom: 12, background: "#0d0d0d", borderRadius: 10, border: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 14, color: "#aaa", marginBottom: 10, paddingLeft: 4 }}>財報健檢評分</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                {[
                  ["revenue", "營收", "營收成長力"],
                  ["eps", "EPS", "每股盈餘"],
                  ["margin", "毛利", "毛利率"],
                  ["roe", "ROE", "股東權益報酬率"],
                  ["debt", "體質", "財務健全度"],
                ].map(([k, l, full]) => (
                  <div key={k} title={full} style={{ display: "flex", justifyContent: "center" }}>
                    <ScoreRing score={result.finScores[k] || 50} label={l} size={56} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 8, textAlign: "center" }}>
                分數越高越好 · 70以上綠燈、40以下紅燈
              </div>
            </div>
          )}

          {/* Collapsible sections */}
          {[
            { key: "tech", title: "技術面 + 買賣判定", content: result.techText },
            { key: "fin", title: "財報健檢", content: result.finText },
            { key: "news", title: "即時新聞 AI 解讀", content: result.newsText },
          ].filter(s => s.content).map(section => (
            <div key={section.key} style={{ marginBottom: 8 }}>
              <button onClick={() => setOpenSection(prev => ({ ...prev, [section.key]: !prev[section.key] }))}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: openSection[section.key] ? "8px 8px 0 0" : 8, color: "#ccc", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                <span>{section.title}</span>
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
            <button onClick={() => search(result.query)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#ddd", fontSize: 15, cursor: "pointer" }}>重新分析</button>
            <button onClick={() => setResult(null)} style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #222", background: "#141414", color: "#ddd", fontSize: 15, cursor: "pointer" }}>查詢其他</button>
          </div>
          <div style={{ marginTop: 6, padding: "5px 10px", background: "#0a0a0a", borderRadius: 6, fontSize: 13, color: "#999", textAlign: "center" }}>
            AI 分析僅供學習參考，不構成投資建議。投資有風險，請自行判斷。
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
function TabWatchlist({ watchlist, apiKey, priceMap }) {
  const [refreshing, setRefreshing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [aiInfo, setAiInfo] = useState({});
  const [localPrices, setLocalPrices] = useState(null);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [priceError, setPriceError] = useState("");

  const verdictColors = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" };

  const effectiveMap = { ...(priceMap || {}), ...(localPrices || {}) };

  // 自選股專用的股價更新：直接抓證交所全市場資料
  const refreshPrices = async () => {
    if (loadingPrices) return;
    setLoadingPrices(true);
    setPriceError("");
    try {
      const full = await fetchAllStockPrices();

      // 修復舊紀錄：ID 不是四碼代號的，用名稱反查補正
      const allRows = Object.values(full);
      watchlist.list.forEach(w => {
        if (/^\d{4}$/.test(String(w.id))) return;
        const key = (w.name || w.id || "").trim();
        const hit = allRows.find(r => r.name === key)
                 || allRows.find(r => key && r.name && (r.name.includes(key) || key.includes(r.name)));
        if (hit) {
          watchlist.remove(w.id);
          watchlist.add({ ...w, id: hit.code, name: hit.name });
        }
      });

      const slim = {};
      watchlist.list.forEach(w => {
        if (full[w.id]) { slim[w.id] = full[w.id]; return; }
        // 也把剛修復的代號一併帶入
        const key = (w.name || "").trim();
        const hit = allRows.find(r => r.name === key);
        if (hit) slim[hit.code] = hit;
      });

      const missing = watchlist.list.filter(w => {
        if (full[w.id]) return false;
        const key = (w.name || "").trim();
        return !allRows.some(r => r.name === key);
      });

      setLocalPrices(slim);
      try { localStorage.setItem("tw-stock-pricemap", JSON.stringify({ ...(priceMap || {}), ...slim })); } catch {}
      if (missing.length > 0) {
        setPriceError(`${missing.map(m => m.name || m.id).join("、")} 查無對應的上市股票資料`);
      }
    } catch (e) {
      setPriceError("更新失敗：" + e.message);
    }
    setLoadingPrices(false);
  };

  // 進入頁面時，若有自選股但沒股價就自動抓一次
  useEffect(() => {
    if (watchlist.list.length === 0) return;
    const anyMissing = watchlist.list.some(w => !effectiveMap[w.id]);
    if (anyMissing && !loadingPrices && !localPrices) refreshPrices();
  }, [watchlist.list.length]);

  // 用證交所即時資料算出每檔的最新狀態
  const enriched = watchlist.list.map(item => {
    const p = effectiveMap[item.id];
    if (!p) return { ...item, live: null };
    const v = calcVerdict(p);
    return {
      ...item,
      live: {
        price: p.close,
        pct: p.pct,
        change: p.change,
        open: p.open, high: p.high, low: p.low, volume: p.volume,
        verdict: v.verdict,
        reason: v.reason,
        detail: v.detail,
        score: v.score,
      },
    };
  });

  const askAI = async (item) => {
    if (!apiKey.hasKey) return;
    setRefreshing(item.id);
    try {
      const p = effectiveMap[item.id];
      const ctx = p ? `證交所今日資料：收盤${p.close} 開${p.open} 高${p.high} 低${p.low} 漲跌${p.change} (${p.pct?.toFixed(2)}%) 量${Math.round(p.volume/1000)}張` : "";
      const { text } = await callAI(`你是台股分析師。請分析「${item.name || item.id}」這檔股票。
${ctx}

請簡潔回答（繁體中文，200字內）：
技術面：[目前趨勢與關鍵價位]
籌碼面：[法人動向，若查得到]
近期題材：[重要利多或利空]
操作建議：[具體怎麼做，含停損參考]`, apiKey.key, apiKey.provider);
      setAiInfo(prev => ({ ...prev, [item.id]: { text, time: new Date().toLocaleString("zh-TW") } }));
    } catch (e) {
      setAiInfo(prev => ({ ...prev, [item.id]: { text: "分析失敗：" + e.message, time: "" } }));
    }
    setRefreshing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>自選股追蹤 ({watchlist.list.length})</div>
        {watchlist.list.length > 0 && (
          <button onClick={refreshPrices} disabled={loadingPrices}
            style={{ padding: "7px 13px", borderRadius: 8, border: "none", background: loadingPrices ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loadingPrices ? "wait" : "pointer" }}>
            {loadingPrices ? "更新中…" : "更新股價"}
          </button>
        )}
      </div>

      {priceError && (
        <div style={{ padding: "9px 12px", background: "#2a1510", border: "1px solid #f59e0b44", borderRadius: 8, fontSize: 13, color: "#fcd34d", marginBottom: 10, lineHeight: 1.6 }}>
          {priceError}
        </div>
      )}

      {watchlist.list.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          
          <div style={{ fontSize: 17, color: "#ccc", marginBottom: 4 }}>還沒有自選股</div>
          <div style={{ fontSize: 15, color: "#aaa" }}>在「買進」「賣出」或「診斷」頁點「加入自選股」即可追蹤</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {enriched.map(item => {
            const open = expanded === item.id;
            const live = item.live;
            const verdict = live?.verdict || item.verdict || "觀望";
            const vc = verdictColors[verdict] || "#888";
            const isUp = live ? live.pct >= 0 : null;
            const ai = aiInfo[item.id];
            return (
              <div key={item.id}
                onClick={() => setExpanded(open ? null : item.id)}
                style={{ background: open ? "#151515" : "#111", border: `1px solid ${open ? "#2a2a2a" : "#1e1e1e"}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer" }}>

                {/* 主列 */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: vc, flexShrink: 0 }} />
                  <div style={{ minWidth: 60 }}>
                    <div style={{ fontSize: 17, fontWeight: 700 }}>{item.name || item.id}</div>
                    <div style={{ fontSize: 13, color: "#999" }}>{item.id}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    {live ? (
                      <>
                        <div style={{ fontSize: 20, fontWeight: 700, color: isUp ? "#ef4444" : "#22c55e" }}>{live.price.toFixed(2)}</div>
                        <div style={{ fontSize: 14, color: isUp ? "#ef4444" : "#22c55e" }}>
                          {isUp ? "+" : ""}{live.change?.toFixed(2)} ({isUp ? "+" : ""}{live.pct?.toFixed(2)}%)
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 14, color: "#888" }}>{loadingPrices ? "載入中…" : "無資料"}</div>
                    )}
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 6, fontSize: 14, fontWeight: 600, background: vc + "18", color: vc, whiteSpace: "nowrap" }}>
                    {verdict}
                  </div>
                </div>

                {/* 展開詳細 */}
                {open && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e1e1e" }} onClick={e => e.stopPropagation()}>
                    {live ? (
                      <>
                        {live.detail?.length > 0
                          ? <ScoreBreakdown detail={live.detail} score={live.score} verdict={live.verdict} mode="quick" />
                          : <div style={{ fontSize: 15, color: "#ccc", lineHeight: 1.8, marginBottom: 10 }}>當日無明顯訊號</div>}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginBottom: 12 }}>
                          {[["開盤", live.open], ["最高", live.high], ["最低", live.low], ["成交量", live.volume ? Math.round(live.volume/1000) + "張" : "—"]].map(([l, v]) => (
                            <div key={l} style={{ background: "#0a0a0a", borderRadius: 6, padding: "7px 4px", textAlign: "center" }}>
                              <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#ddd" }}>{typeof v === "number" ? v.toFixed(2) : v}</div>
                            </div>
                          ))}
                        </div>
                        {/* 當日區間視覺化 */}
                        {live.high > live.low && (
                          <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>當日價格區間</div>
                            <div style={{ position: "relative", height: 8, background: "#1a1a1a", borderRadius: 4 }}>
                              <div style={{
                                position: "absolute", top: 0, height: 8, width: 3, borderRadius: 2, background: "#f97316",
                                left: `${((live.price - live.low) / (live.high - live.low)) * 100}%`,
                              }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#999", marginTop: 3 }}>
                              <span>{live.low?.toFixed(2)}</span>
                              <span style={{ color: "#f97316" }}>收 {live.price.toFixed(2)}</span>
                              <span>{live.high?.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ fontSize: 15, color: "#999", marginBottom: 10, lineHeight: 1.7 }}>
                        尚未取得股價資料。
                        <button onClick={refreshPrices} disabled={loadingPrices}
                          style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: "#f59e0b", fontSize: 13, cursor: "pointer" }}>
                          {loadingPrices ? "更新中…" : "立即更新"}
                        </button>
                      </div>
                    )}

                    {/* AI 深度分析 */}
                    {ai && (
                      <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 12, fontSize: 15, lineHeight: 1.9, color: "#bbb", whiteSpace: "pre-wrap", borderLeft: "3px solid #f97316", marginBottom: 10 }}>
                        {ai.text}
                        {ai.time && <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>{ai.time}</div>}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 6 }}>
                      {apiKey.hasKey && (
                        <button onClick={() => askAI(item)} disabled={refreshing === item.id}
                          style={{ flex: 1, padding: "8px 0", borderRadius: 6, border: "1px solid #333", background: "#141414", color: "#f97316", fontSize: 14, cursor: "pointer" }}>
                          {refreshing === item.id ? "分析中…" : ai ? "重新分析" : "AI 深度分析"}
                        </button>
                      )}
                      <button onClick={() => watchlist.remove(item.id)}
                        style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: "#ef4444", fontSize: 14, cursor: "pointer" }}>
                        移除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ====================================
// TAB: 排行榜
// ====================================
function TabRanking({ stocks, watchlist, scanCount, lastScan, scan, scanning }) {
  const [rankType, setRankType] = useState("gain");
  const [selected, setSelected] = useState(null);

  const types = [
    { key: "gain", label: "漲幅榜", sort: (a, b) => parseFloat(b.change) - parseFloat(a.change) },
    { key: "loss", label: "跌幅榜", sort: (a, b) => parseFloat(a.change) - parseFloat(b.change) },
    { key: "volume", label: "成交量榜", sort: (a, b) => (b.volume || 0) - (a.volume || 0) },
    { key: "amp", label: "振幅榜", sort: (a, b) => {
      const ampA = a.high && a.low ? (a.high - a.low) / a.low : 0;
      const ampB = b.high && b.low ? (b.high - b.low) / b.low : 0;
      return ampB - ampA;
    }},
  ];

  const cur = types.find(t => t.key === rankType);
  const ranked = [...stocks].sort(cur.sort).slice(0, 30);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>每日排行榜</div>
          {lastScan && <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>{scanCount ? `${scanCount} 檔 · ` : ""}{lastScan}</div>}
        </div>
        <button onClick={scan} disabled={scanning}
          style={{ padding: "7px 13px", borderRadius: 8, border: "none", background: scanning ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: scanning ? "wait" : "pointer" }}>
          {scanning ? "更新中…" : "更新"}
        </button>
      </div>

      {/* 榜單切換 */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
        {types.map(t => (
          <button key={t.key} onClick={() => setRankType(t.key)}
            style={{ flex: 1, minWidth: 80, padding: "8px 4px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14,
              fontWeight: rankType === t.key ? 600 : 400,
              background: rankType === t.key ? "#1f1f1f" : "#111",
              color: rankType === t.key ? "#f97316" : "#888" }}>
            {t.label}
          </button>
        ))}
      </div>

      {stocks.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          
          <div style={{ fontSize: 16, color: "#ccc" }}>尚未掃描</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ranked.map((s, i) => {
            const isUp = s.change?.startsWith("+");
            const open = selected === s.id;
            const amp = s.high && s.low ? (((s.high - s.low) / s.low) * 100).toFixed(2) : null;
            return (
              <div key={s.id} onClick={() => setSelected(open ? null : s.id)}
                style={{ background: open ? "#151515" : "#0f0f0f", border: `1px solid ${open ? "#2a2a2a" : "#181818"}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 24, fontSize: 15, fontWeight: 700, color: i < 3 ? "#f59e0b" : "#666", textAlign: "center" }}>{i + 1}</div>
                  <div style={{ minWidth: 62 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>{s.id} · {getSector(s.id)}</div>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: isUp ? "#ef4444" : "#22c55e" }}>{s.price}</div>
                    <div style={{ fontSize: 13, color: isUp ? "#ef4444" : "#22c55e" }}>{s.change}</div>
                  </div>
                  <div style={{ minWidth: 62, textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {rankType === "volume" ? "成交量" : rankType === "amp" ? "振幅" : "量"}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>
                      {rankType === "amp" ? `${amp}%` : `${Math.round((s.volume || 0) / 1000).toLocaleString()}張`}
                    </div>
                  </div>
                </div>
                {open && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1e1e1e" }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 8 }}>
                      {[["開", s.open], ["高", s.high], ["低", s.low]].map(([l, v]) => (
                        <div key={l} style={{ background: "#0a0a0a", borderRadius: 6, padding: "6px 4px", textAlign: "center" }}>
                          <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{typeof v === "number" ? v.toFixed(2) : "—"}</div>
                        </div>
                      ))}
                    </div>
                    {s.detail?.length > 0 && <ScoreBreakdown detail={s.detail} score={s.score} verdict={s.verdict} mode={s.scoreMode} />}
                    <button onClick={() => watchlist.add({ id: s.id, name: s.name, verdict: s.verdict })}
                      disabled={watchlist.has(s.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: watchlist.has(s.id) ? "#666" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                      {watchlist.has(s.id) ? "已追蹤" : "加入自選股"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ====================================
// TAB 3/4: AI 即時掃描 買進 / 賣出
// ====================================

function TabScan({ mode, watchlist, scanState }) {
  const { stocks, scanning: loading, scanError: progress, lastScan, scan, scanCount, valuation, usRows } = scanState;
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);
  const [sectors, setSectors] = useState([]);
  const [themes, setThemes] = useState([]);
  const [priceTiers, setPriceTiers] = useState([]);
  const [volTiers, setVolTiers] = useState([]);
  const [chgTiers, setChgTiers] = useState([]);
  const [peRanges, setPeRanges] = useState([]);
  const [dyRanges, setDyRanges] = useState([]);
  const [pbRanges, setPbRanges] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [history, setHistory] = useState({});
  const [loadingHist, setLoadingHist] = useState(null);
  const [deepResults, setDeepResults] = useState({});
  const [deepRunning, setDeepRunning] = useState(false);
  const [deepProgress, setDeepProgress] = useState({ done: 0, total: 0 });
  const [deepError, setDeepError] = useState("");
  const [useDeep, setUseDeep] = useState(false);

  const verdictColors = { "強力買進": "#dc2626", "買進": "#ef4444", "觀望": "#f59e0b", "賣出": "#22c55e", "強力賣出": "#16a34a" };

  const loadHistory = async (code) => {
    if (history[code]) return;
    setLoadingHist(code);
    try {
      const d = await fetchStockHistory(code);
      setHistory(prev => ({ ...prev, [code]: d.slice(-20) }));
    } catch {
      setHistory(prev => ({ ...prev, [code]: [] }));
    }
    setLoadingHist(null);
  };

  // 多選切換工具
  const toggle = (setter) => (key) => {
    setter(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
    setLimit(50);
  };

  // 共用篩選條件（同項目多選＝OR，跨項目＝AND）
  const passFilters = (s) => {
    if (sectors.length && !sectors.includes(getSector(s.id))) return false;
    if (themes.length) {
      const st = getThemes(s.id);
      if (!themes.some(t => st.includes(t))) return false;
    }
    if (priceTiers.length && !priceTiers.includes(getPriceTier(s.price))) return false;
    if (volTiers.length && !volTiers.includes(getVolumeTier(s.volume))) return false;
    if (chgTiers.length && !chgTiers.includes(getChangeTier(s.change))) return false;
    if (search) {
      const q = search.trim();
      if (!s.name?.includes(q) && !s.id?.includes(q)) return false;
    }
    const v = valuation?.[s.id];
    // 數值型多選：符合任一區間即可
    if (peRanges.length) {
      if (!v?.pe || v.pe <= 0) return false;
      if (!peRanges.some(max => v.pe <= max)) return false;
    }
    if (dyRanges.length) {
      if (!v?.dy) return false;
      if (!dyRanges.some(min => v.dy >= min)) return false;
    }
    if (pbRanges.length) {
      if (!v?.pb || v.pb <= 0) return false;
      if (!pbRanges.some(max => v.pb <= max)) return false;
    }
    return true;
  };

  // 快篩結果（深度分析的候選來源）
  const matchedRaw = stocks.filter(s => {
    if (mode === "buy" && !(s.verdict === "買進" || s.verdict === "強力買進")) return false;
    if (mode === "sell" && !(s.verdict === "賣出" || s.verdict === "強力賣出")) return false;
    return passFilters(s);
  }).sort((a, b) => {
    const as = Math.abs(a.score ?? 0), bs = Math.abs(b.score ?? 0);
    return bs - as;
  });

  const runDeepAnalysis = async () => {
    setDeepRunning(true);
    setDeepError("");

    // 直接分析目前清單上的股票（最多 40 檔）
    const candidates = matchedRaw.slice(0, 40);

    if (candidates.length === 0) {
      setDeepError("清單上沒有股票可分析");
      setDeepRunning(false);
      return;
    }

    setDeepProgress({ done: 0, total: candidates.length });
    const results = {};
    let failed = 0;

    const BATCH = 3;
    for (let i = 0; i < candidates.length; i += BATCH) {
      const batch = candidates.slice(i, i + BATCH);
      await Promise.all(batch.map(async (s) => {
        try {
          const hist = await fetchStockHistory(s.id);
          const a = analyzeTechnical(hist);
          if (a) {
            results[s.id] = a;
            setHistory(prev => ({ ...prev, [s.id]: hist.slice(-20) }));
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }));
      setDeepProgress({ done: Math.min(i + BATCH, candidates.length), total: candidates.length });
      setDeepResults({ ...results });
    }

    setDeepResults(results);
    const okCount = Object.keys(results).length;
    if (okCount === 0) {
      setDeepError(`全部 ${candidates.length} 檔都抓不到歷史資料，可能是代理伺服器不穩，請稍後再試`);
      setUseDeep(false);
    } else {
      if (failed > 0) setDeepError(`${okCount} 檔成功、${failed} 檔失敗（歷史資料抓取不穩定）`);
      setUseDeep(true);
    }
    setDeepRunning(false);
  };

  // 套用深度分析結果（若有）
  const applyDeep = (s) => {
    const d = deepResults[s.id];
    if (useDeep && d) return { ...s, verdict: d.verdict, score: d.score, reason: d.reason, detail: d.detail, scoreMode: "deep", deep: d };
    return s;
  };

  const matched = stocks.map(applyDeep).filter(s => {
    if (useDeep && !deepResults[s.id]) return false;
    if (mode === "buy" && !(s.verdict === "買進" || s.verdict === "強力買進")) return false;
    if (mode === "sell" && !(s.verdict === "賣出" || s.verdict === "強力賣出")) return false;
    return passFilters(s);
  }).sort((a, b) => {
    const as = a.score ?? 0, bs = b.score ?? 0;
    return mode === "buy" ? bs - as : as - bs;
  });

  const filtered = matched.slice(0, limit);
  const activeFilters =
    sectors.length + themes.length + priceTiers.length +
    volTiers.length + chgTiers.length +
    peRanges.length + dyRanges.length + pbRanges.length;

  const clearAll = () => {
    setSectors([]); setThemes([]); setPriceTiers([]);
    setVolTiers([]); setChgTiers([]);
    setPeRanges([]); setDyRanges([]); setPbRanges([]);
    setLimit(50);
  };

  const buyCount = stocks.filter(s => s.verdict === "買進" || s.verdict === "強力買進").length;
  const sellCount = stocks.filter(s => s.verdict === "賣出" || s.verdict === "強力賣出").length;

  return (
    <div>
      {/* Scan header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            {mode === "buy" ? "可買進" : "應賣出"}
            {matched.length > 0 && <span style={{ fontSize: 15, color: "#999", marginLeft: 8 }}>{matched.length} 檔</span>}
          </div>
          {lastScan && (
            <div style={{ fontSize: 13, color: "#999", marginTop: 2 }}>
              {scanCount ? `已掃 ${scanCount} 檔 · ` : ""}{lastScan}
            </div>
          )}
        </div>
        <button onClick={scan} disabled={loading}
          style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: loading ? "#333" : "linear-gradient(135deg, #ef4444, #f97316)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "wait" : "pointer" }}>
          {loading ? "掃描中…" : stocks.length > 0 ? "重新掃描" : "開始掃描"}
        </button>
      </div>

      {/* 美股連動 */}
      <USLinkagePanel usRows={usRows} onPickTheme={(t) => {
        setThemes([t]);
        setShowFilters(true);
        setLimit(50);
      }} />

      {/* Search + Filters */}
      {stocks.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setLimit(50); }}
              placeholder="搜尋代號或名稱"
              style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "9px 12px", color: "#e5e5e5", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            <button onClick={() => setShowFilters(v => !v)}
              style={{ padding: "9px 14px", borderRadius: 8, border: `1px solid ${activeFilters ? "#f97316" : "#1e1e1e"}`, background: activeFilters ? "#1a1510" : "#111", color: activeFilters ? "#f97316" : "#888", fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" }}>
              篩選{activeFilters ? ` ${activeFilters}` : ""}
            </button>
          </div>

          {/* 分析模式 */}
          <div style={{ background: useDeep ? "#0d1f0d" : "#0d0d0d", border: `1px solid ${useDeep ? "#16a34a44" : "#1e1e1e"}`, borderRadius: 10, padding: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: useDeep ? "#86efac" : "#ccc" }}>
                  {useDeep ? "深度技術分析" : "當日 K 棒快篩"}
                </div>
                <div style={{ fontSize: 12, color: "#999", marginTop: 2, lineHeight: 1.6 }}>
                  {useDeep
                    ? `已分析 ${Object.keys(deepResults).length} 檔：均線排列、KD、RSI、MACD、量價`
                    : `將分析清單前 ${Math.min(matchedRaw.length, 40)} 檔，計算均線、KD、RSI、MACD`}
                </div>
              </div>
              {!deepRunning && (
                useDeep ? (
                  <button onClick={() => setUseDeep(false)}
                    style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #333", background: "#141414", color: "#999", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                    回快篩
                  </button>
                ) : (
                  <button onClick={runDeepAnalysis} disabled={stocks.length === 0}
                    style={{ padding: "8px 13px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #16a34a, #22c55e)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                    深度分析
                  </button>
                )
              )}
            </div>
            {deepRunning && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 13, color: "#f59e0b", marginBottom: 5 }}>
                  抓取歷史資料計算指標中… {deepProgress.done} / {deepProgress.total}
                </div>
                <div style={{ height: 5, background: "#1a1a1a", borderRadius: 3 }}>
                  <div style={{ height: 5, borderRadius: 3, background: "linear-gradient(90deg,#f59e0b,#22c55e)", width: `${deepProgress.total ? (deepProgress.done / deepProgress.total) * 100 : 0}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
            {deepError && !deepRunning && (
              <div style={{ marginTop: 8, padding: "8px 10px", background: "#2a1510", borderRadius: 6, fontSize: 13, color: "#fcd34d", lineHeight: 1.6 }}>
                {deepError}
              </div>
            )}
          </div>

          {showFilters && (
            <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 12, marginBottom: 10 }}>

              <div style={{ fontSize: 12, color: "#888", marginBottom: 10, lineHeight: 1.6 }}>
                同一項目可複選（符合任一即可），不同項目之間要同時符合
              </div>

              <FilterRow label="題材概念股" options={Object.keys(THEMES).map(t => ({ key: t, label: t }))}
                values={themes} onToggle={toggle(setThemes)} onClear={() => { setThemes([]); setLimit(50); }} />

              <FilterRow label="產業分類" options={SECTOR_LIST.filter(t => t !== "全部").map(t => ({ key: t, label: t }))}
                values={sectors} onToggle={toggle(setSectors)} onClear={() => { setSectors([]); setLimit(50); }} />

              <FilterRow label="股價區間" options={PRICE_TIERS.filter(t => t.key !== "all")}
                values={priceTiers} onToggle={toggle(setPriceTiers)} onClear={() => { setPriceTiers([]); setLimit(50); }} />

              <FilterRow label="成交量等級" options={VOLUME_TIERS.filter(t => t.key !== "all")}
                values={volTiers} onToggle={toggle(setVolTiers)} onClear={() => { setVolTiers([]); setLimit(50); }} />

              <FilterRow label="漲跌幅區間" options={CHANGE_TIERS.filter(t => t.key !== "all")}
                values={chgTiers} onToggle={toggle(setChgTiers)} onClear={() => { setChgTiers([]); setLimit(50); }} />

              <FilterRow label="本益比上限（低＝便宜）"
                options={[{key:10,label:"≤10"},{key:15,label:"≤15"},{key:20,label:"≤20"},{key:30,label:"≤30"}]}
                values={peRanges} onToggle={toggle(setPeRanges)} onClear={() => { setPeRanges([]); setLimit(50); }} />

              <FilterRow label="殖利率下限（高＝配息好）"
                options={[{key:3,label:"≥3%"},{key:4,label:"≥4%"},{key:5,label:"≥5%"},{key:6,label:"≥6%"}]}
                values={dyRanges} onToggle={toggle(setDyRanges)} onClear={() => { setDyRanges([]); setLimit(50); }} />

              <FilterRow label="股價淨值比上限（低＝可能被低估）"
                options={[{key:0.8,label:"≤0.8"},{key:1,label:"≤1.0"},{key:1.5,label:"≤1.5"},{key:2,label:"≤2.0"}]}
                values={pbRanges} onToggle={toggle(setPbRanges)} onClear={() => { setPbRanges([]); setLimit(50); }} last />

              {activeFilters > 0 && (
                <button onClick={clearAll}
                  style={{ width: "100%", marginTop: 12, padding: "9px 0", borderRadius: 8, border: "1px solid #333", background: "#141414", color: "#ef4444", fontSize: 14, cursor: "pointer" }}>
                  清除所有篩選（{activeFilters}）
                </button>
              )}
            </div>
          )}
        </>
      )}


      {/* Loading */}
      {loading && (
        <div style={{ padding: 36, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          <div style={{ display: "inline-block", width: 36, height: 36, border: "3px solid #222", borderTopColor: "#ef4444", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <div style={{ marginTop: 12, fontSize: 15, color: "#ccc" }}>正在掃描全市場…</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "#999" }}>從證交所讀取全市場資料並計算訊號</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* Error */}
      {progress && !loading && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ padding: 12, background: "#2a1515", borderRadius: 8, fontSize: 14, color: "#fca5a5" }}>
            {progress}
            <button onClick={scan} style={{ marginLeft: 10, padding: "4px 12px", borderRadius: 6, border: "1px solid #dc2626", background: "#1a1a1a", color: "#fca5a5", fontSize: 13, cursor: "pointer" }}>
              重試
            </button>
          </div>
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
                    <div style={{ fontSize: 13, color: "#999" }}>{stock.id} · {getSector(stock.id)}</div>
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
                    <ScoreBreakdown detail={stock.detail} score={stock.score} verdict={stock.verdict} mode={stock.scoreMode} />
                    {getThemes(stock.id).length > 0 && (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
                        {getThemes(stock.id).map(t => (
                          <span key={t} style={{ padding: "3px 9px", borderRadius: 8, fontSize: 12, background: "#1a1510", color: "#f59e0b", border: "1px solid #f5970b33" }}>{t}</span>
                        ))}
                      </div>
                    )}
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

                    {/* 技術指標（深度分析後才有）*/}
                    {stock.deep?.indicators && (
                      <div style={{ background: "#0a0a0a", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                        <div style={{ fontSize: 13, color: "#86efac", marginBottom: 8 }}>技術指標</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
                          {[
                            ["5MA", stock.deep.indicators.ma5],
                            ["10MA", stock.deep.indicators.ma10],
                            ["20MA", stock.deep.indicators.ma20],
                          ].map(([l, v]) => (
                            <div key={l} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: v && parseFloat(stock.price) >= v ? "#ef4444" : "#22c55e" }}>
                                {v ? v.toFixed(2) : "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                          {[
                            ["K", stock.deep.indicators.k, v => v?.toFixed(0), v => v > 80 ? "#ef4444" : v < 20 ? "#22c55e" : "#ddd"],
                            ["D", stock.deep.indicators.d, v => v?.toFixed(0), v => v > 80 ? "#ef4444" : v < 20 ? "#22c55e" : "#ddd"],
                            ["RSI", stock.deep.indicators.rsi, v => v?.toFixed(0), v => v > 70 ? "#ef4444" : v < 30 ? "#22c55e" : "#ddd"],
                            ["量比", stock.deep.indicators.volRatio, v => v?.toFixed(1) + "x", v => v > 1.8 ? "#f59e0b" : "#ddd"],
                          ].map(([l, v, fmt, col]) => (
                            <div key={l} style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: v != null ? col(v) : "#888" }}>
                                {v != null ? fmt(v) : "—"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 估值資料 */}
                    {valuation?.[stock.id] && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 10 }}>
                        {[
                          ["本益比", valuation[stock.id].pe, v => v > 0 ? v.toFixed(1) : "—"],
                          ["殖利率", valuation[stock.id].dy, v => v > 0 ? v.toFixed(2) + "%" : "—"],
                          ["股價淨值比", valuation[stock.id].pb, v => v > 0 ? v.toFixed(2) : "—"],
                        ].map(([l, v, fmt]) => (
                          <div key={l} style={{ background: "#0a0a0a", borderRadius: 6, padding: "6px 4px", textAlign: "center" }}>
                            <div style={{ fontSize: 12, color: "#888" }}>{l}</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: "#f59e0b" }}>{v ? fmt(v) : "—"}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* K 線圖 */}
                    {history[stock.id] === undefined ? (
                      <button onClick={() => loadHistory(stock.id)} disabled={loadingHist === stock.id}
                        style={{ width: "100%", padding: "9px 0", borderRadius: 8, border: "1px solid #2a2a2a", background: "#111", color: "#f97316", fontSize: 14, cursor: "pointer", marginBottom: 10 }}>
                        {loadingHist === stock.id ? "載入中…" : "顯示近 20 日 K 線"}
                      </button>
                    ) : history[stock.id].length > 0 ? (
                      <div style={{ background: "#0a0a0a", borderRadius: 8, padding: "8px 4px", marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: "#888", paddingLeft: 6, marginBottom: 2 }}>
                          近 20 日 K 線　<span style={{ color: "#f59e0b" }}>— 5MA</span>
                        </div>
                        <KLineChart data={history[stock.id]} />
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>K 線資料載入失敗</div>
                    )}

                    <button onClick={() => watchlist.add({ id: stock.id, name: stock.name, verdict: stock.verdict })}
                      disabled={watchlist.has(stock.id)}
                      style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #333", background: "#141414", color: watchlist.has(stock.id) ? "#666" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                      {watchlist.has(stock.id) ? "已追蹤" : "加入自選股"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {matched.length > filtered.length && (
            <button onClick={() => setLimit(l => l + 50)}
              style={{ padding: "12px 0", borderRadius: 10, border: "1px solid #2a2a2a", background: "#111", color: "#f97316", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
              載入更多（還有 {matched.length - filtered.length} 檔）
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && stocks.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", background: "#111", borderRadius: 12, border: "1px solid #1e1e1e" }}>
          
          <div style={{ fontSize: 16, color: "#ccc", marginBottom: 6 }}>尚未掃描</div>
          <div style={{ fontSize: 14, color: "#999" }}>點上方「開始掃描」，分析全上市約 1000 檔股票的真實收盤資料</div>
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
  const [lastScan, setLastScan] = useState(() => localStorage.getItem("tw-stock-scan-time") || "");
  const [lastScanISO, setLastScanISO] = useState(() => localStorage.getItem("tw-stock-scan-iso") || "");
  const [scanCount, setScanCount] = useState(() => parseInt(localStorage.getItem("tw-stock-count")) || 0);
  const [valuation, setValuation] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-valuation")) || null; }
    catch { return null; }
  });
  const [priceMap, setPriceMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-pricemap")) || null; }
    catch { return null; }
  });

  // Market index
  const [index, setIndex] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tw-stock-index")) || null; }
    catch { return null; }
  });

  const [usRows, setUsRows] = useState(null);

  const fetchUS = async () => {
    try { setUsRows(await fetchUSMarket()); } catch {}
  };

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
    setScanning(true); setScanError("");
    try {
      // 1. 從證交所抓全市場真實股價
      const fullMap = await fetchAllStockPrices();
      const all = Object.values(fullMap);

      // 2. 過濾：只留有流動性、正常價格的個股（排除權證、ETF零股等）
      const MIN_VOLUME = 500000;   // 至少 500 張成交量
      const tradable = all.filter(r =>
        /^[1-9]\d{3}$/.test(r.code) &&    // 四碼純數字（排除權證、ETN）
        r.close > 0 &&
        r.volume >= MIN_VOLUME &&
        r.high && r.low
      );

      if (tradable.length === 0) {
        setScanError("證交所尚無今日資料（可能未開盤或非交易日）");
        setScanning(false);
        return;
      }

      // 3. 全部計算訊號
      const scored = tradable.map(r => {
        const v = calcVerdict(r);
        return {
          id: r.code,
          name: r.name,
          price: r.close.toFixed(2),
          change: (r.pct >= 0 ? "+" : "") + (r.pct?.toFixed(2) ?? "0") + "%",
          verdict: v.verdict,
          reason: v.reason,
          score: v.score,
          detail: v.detail,
          scoreMode: "quick",
          sector: "",
          open: r.open, high: r.high, low: r.low, volume: r.volume,
        };
      });

      setStocks(scored);
      setScanCount(tradable.length);

      // 抓本益比、殖利率（失敗不影響主流程）
      try {
        const val = await fetchValuation();
        setValuation(val);
        const codes = new Set(tradable.map(t => t.code));
        const slimVal = {};
        codes.forEach(c => { if (val[c]) slimVal[c] = val[c]; });
        try { localStorage.setItem("tw-stock-valuation", JSON.stringify(slimVal)); } catch {}
      } catch {}

      // 保留自選股的完整資料供追蹤頁使用
      const keep = new Set(watchlist.list.map(w => w.id));
      const slim = {};
      keep.forEach(c => { if (fullMap[c]) slim[c] = fullMap[c]; });
      setPriceMap(slim);
      try { localStorage.setItem("tw-stock-pricemap", JSON.stringify(slim)); } catch {}

      // localStorage 有 5MB 上限，存精簡欄位；超量時逐步降量重試
      const compact = scored.map(s => ({
        id: s.id, name: s.name, price: s.price, change: s.change,
        verdict: s.verdict, reason: s.reason, score: s.score, detail: s.detail,
        open: s.open, high: s.high, low: s.low, volume: s.volume,
      }));
      for (const n of [compact.length, 800, 400, 200]) {
        try {
          localStorage.setItem("tw-stock-scan", JSON.stringify(compact.slice(0, n)));
          break;
        } catch {}
      }
      localStorage.setItem("tw-stock-count", String(tradable.length));
      const nowD = new Date();
      const t = nowD.toLocaleString("zh-TW");
      setLastScan(t);
      setLastScanISO(nowD.toISOString());
      localStorage.setItem("tw-stock-scan-time", t);
      localStorage.setItem("tw-stock-scan-iso", nowD.toISOString());
    } catch (e) {
      setScanError("掃描失敗：" + e.message);
    }
    setScanning(false);
  };

  // 進站自動抓證交所資料（不需 API Key），30 分鐘內用快取
  useEffect(() => {
    const ts = lastScanISO ? Date.parse(lastScanISO) : NaN;
    const stale = !isFinite(ts) || (Date.now() - ts) > 30 * 60 * 1000;
    if (stocks.length === 0 || stale) scan();
    if (!index || stale) fetchIndex();
    fetchUS();
  }, []);

  const scanState = { stocks, scanning, scanError, lastScan, scan, scanCount, valuation, usRows };
  const buyCount = stocks.filter(s => s.verdict === "買進" || s.verdict === "強力買進").length;
  const sellCount = stocks.filter(s => s.verdict === "賣出" || s.verdict === "強力賣出").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "'Inter', 'Noto Sans TC', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 16px 12px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, background: "linear-gradient(90deg, #ef4444, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>台股雷達</span>
            <span style={{ fontSize: 14, color: "#aaa" }}>v6.0</span>
            <div style={{ marginLeft: "auto" }}>
              <button onClick={() => setShowSettings(!showSettings)}
                style={{ background: apiKey.hasKey ? "#1a1a1a" : "#2a1510", border: `1px solid ${apiKey.hasKey ? "#333" : "#f59e0b"}`, borderRadius: 8, padding: "6px 12px", color: apiKey.hasKey ? "#ccc" : "#f59e0b", fontSize: 14, cursor: "pointer" }}>
                {apiKey.hasKey ? "已設定" : "設定 API Key"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, color: "#aaa" }}>{now.toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}</span>
            {(
              <button onClick={() => { scan(); fetchIndex(); }} disabled={scanning}
                style={{ background: "none", border: "none", color: scanning ? "#666" : "#f97316", fontSize: 13, cursor: scanning ? "wait" : "pointer", padding: 0 }}>
                {scanning ? "更新中…" : "全部更新"}
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
            { label: "可買進", val: stocks.length ? `${buyCount}` : "—", sub: stocks.length ? `/ ${scanCount} 檔` : (scanning ? "掃描中…" : "待掃描"), col: "#ef4444" },
            { label: "應賣出", val: stocks.length ? `${sellCount}` : "—", sub: stocks.length ? `/ ${scanCount} 檔` : (scanning ? "掃描中…" : "待掃描"), col: "#22c55e" },
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
            { key: "search", label: "診斷" },
            { key: "watchlist", label: `自選${watchlist.list.length > 0 ? ` ${watchlist.list.length}` : ""}` },
            { key: "buy", label: "買進" },
            { key: "sell", label: "賣出" },
            { key: "rank", label: "排行" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ flex: 1, padding: "7px 1px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === t.key ? 600 : 400, transition: "all 0.2s",
                background: tab === t.key ? "#1f1f1f" : "transparent",
                color: tab === t.key ? (t.key === "sell" ? "#22c55e" : t.key === "buy" ? "#ef4444" : t.key === "watchlist" ? "#f59e0b" : t.key === "rank" ? "#60a5fa" : "#f97316") : "#555" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Data source badge */}
        {stocks.length > 0 && (
          <div style={{ background: "#0d1f0d", border: "1px solid #16a34a44", borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#86efac" }}>
            資料來自臺灣證券交易所官方 OpenAPI，訊號依當日開高低收與量能計算
            {!apiKey.hasKey && <span style={{ color: "#f59e0b" }}>　·　設定 API Key 可加上 AI 深度解讀</span>}
          </div>
        )}

        {/* Settings panel */}
        {showSettings && <SettingsPanel apiKey={apiKey} onClose={() => setShowSettings(false)} />}

        {/* Tab content */}
        {tab === "search" && <TabDiagnosis watchlist={watchlist} apiKey={apiKey} stocks={stocks} />}
        {tab === "watchlist" && <TabWatchlist watchlist={watchlist} apiKey={apiKey} priceMap={priceMap} />}
        {tab === "buy" && <TabScan mode="buy" watchlist={watchlist} scanState={scanState} />}
        {tab === "sell" && <TabScan mode="sell" watchlist={watchlist} scanState={scanState} />}
        {tab === "rank" && <TabRanking stocks={stocks} watchlist={watchlist} scanCount={scanCount} lastScan={lastScan} scan={scan} scanning={scanning} />}

        {/* Footer */}
        <div style={{ marginTop: 20, padding: 12, background: "#0d0d0d", borderRadius: 10, border: "1px solid #151515" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#aaa", marginBottom: 4 }}>分析方法</div>
          <div style={{ fontSize: 13, color: "#999", lineHeight: 1.7 }}>
            股價與成交量來自臺灣證券交易所官方 OpenAPI。快篩模式依當日開高低收與量能評分；深度分析模式另抓近月歷史資料，計算均線排列、乖離率、KD、RSI、MACD 與量價關係。設定 API Key 後可另外取得 AI 財報健檢與新聞解讀。自選股與設定儲存於瀏覽器本機。所有內容僅供參考，不構成投資建議。
          </div>
        </div>
        <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "#777" }}>台股雷達 v6.0 © 2026</div>
      </div>
    </div>
  );
}
