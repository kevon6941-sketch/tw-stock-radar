// 抓取三大法人買賣超（T86），維護最近 25 個交易日的滾動資料
import fs from "fs";
import path from "path";

const OUT = "public/data/institutional.json";
const KEEP = 25;

function ymd(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

async function fetchDay(dateStr) {
  const url = `https://www.twse.com.tw/fund/T86?response=json&date=${dateStr}&selectType=ALL`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return null;
    const j = await r.json();
    if (j.stat !== "OK" || !j.data?.length) return null;

    // 欄位順序：代號,名稱,外陸資買進,外陸資賣出,外陸資買賣超,外資自營買進,賣出,買賣超,
    //            投信買進,賣出,買賣超,自營商買賣超,自營(自行)買進,賣出,買賣超,
    //            自營(避險)買進,賣出,買賣超,三大法人買賣超
    const fields = j.fields || [];
    const iCode = 0;
    const iForeign = fields.findIndex(f => f.includes("外陸資買賣超") && !f.includes("自營"));
    const iTrust = fields.findIndex(f => f.includes("投信買賣超"));
    const iTotal = fields.findIndex(f => f.includes("三大法人買賣超"));

    const out = {};
    for (const row of j.data) {
      const code = String(row[iCode]).trim();
      if (!/^\d{4}$/.test(code)) continue;
      const num = (v) => parseInt(String(v ?? "0").replace(/[,\s]/g, "")) || 0;
      out[code] = [
        Math.round(num(row[iTotal]) / 1000),      // 三大法人（張）
        Math.round(num(row[iForeign]) / 1000),    // 外資（張）
        Math.round(num(row[iTrust]) / 1000),      // 投信（張）
      ];
    }
    return Object.keys(out).length ? out : null;
  } catch (e) {
    return null;
  }
}

async function main() {
  let store = { dates: [], data: {} };
  if (fs.existsSync(OUT)) {
    try { store = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
  }
  const have = new Set(store.dates || []);

  // 往前找 40 個日曆日，挑出還沒抓過的工作日
  const need = [];
  const today = new Date();
  for (let i = 0; i < 40 && need.length < KEEP; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const s = ymd(d);
    if (!have.has(s)) need.push(s);
  }
  need.sort();

  console.log(`已有 ${have.size} 天，待抓 ${need.length} 天`);

  const fetched = {};
  for (const ds of need) {
    const day = await fetchDay(ds);
    if (day) {
      fetched[ds] = day;
      console.log(`  ${ds} ✓ ${Object.keys(day).length} 檔`);
    } else {
      console.log(`  ${ds} － 無資料（假日或未開盤）`);
    }
    await new Promise(r => setTimeout(r, 3500));   // 禮貌性延遲
  }

  // 合併
  const allDates = [...(store.dates || [])];
  const data = { ...(store.data || {}) };

  for (const ds of Object.keys(fetched).sort()) {
    const idx = allDates.length;
    allDates.push(ds);
    for (const [code, vals] of Object.entries(fetched[ds])) {
      if (!data[code]) data[code] = [];
      while (data[code].length < idx) data[code].push(null);
      data[code][idx] = vals;
    }
    // 沒有資料的股票補 null
    for (const code of Object.keys(data)) {
      while (data[code].length < idx + 1) data[code].push(null);
    }
  }

  // 只保留最近 KEEP 天
  if (allDates.length > KEEP) {
    const cut = allDates.length - KEEP;
    allDates.splice(0, cut);
    for (const code of Object.keys(data)) {
      data[code] = data[code].slice(cut);
      if (data[code].every(v => v === null)) delete data[code];
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ dates: allDates, data }));
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`\n完成：${allDates.length} 個交易日、${Object.keys(data).length} 檔、${kb} KB`);
  console.log(`日期範圍：${allDates[0]} ~ ${allDates[allDates.length - 1]}`);
}

main();
