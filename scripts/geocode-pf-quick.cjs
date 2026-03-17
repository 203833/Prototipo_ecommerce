const fs = require("fs");
const path = require("path");
const https = require("https");

const CACHE_PATH = path.resolve(__dirname, "geocache.json");
const RAW_TSV_PATH = path.resolve(__dirname, "stores-raw.tsv");

const PF_IDS = new Set([
  "11","12","14","16","22","25","26","33","39","49","58","66","70","86",
  "100","148","318","335","342","387","403","487","527","529","807","847",
  "1073","1282","1317","1383","1433","1532","1622","1649"
]);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function nominatimSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;
    https.get(url, { headers: { "User-Agent": "FarmaciaSaoJoao-Geocoder/1.0" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch { reject(new Error("JSON parse error")); } });
    }).on("error", reject);
  });
}

async function main() {
  const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")) : {};

  const raw = fs.readFileSync(RAW_TSV_PATH, "utf-8");
  const stores = raw.trim().split("\n").slice(1)
    .map((line) => line.split("\t"))
    .filter((c) => c.length >= 16 && PF_IDS.has(c[0].trim()))
    .map((c) => ({
      id: c[0].trim(),
      name: (c[2]||"").trim(),
      city: (c[3]||"").trim(),
      district: (c[5]||"").trim(),
      logradouro: (c[6]||"").trim(),
      numero: (c[7]||"").trim(),
      state: (c[15]||"").trim(),
    }));

  const missing = stores.filter((s) => !cache[s.id] || cache[s.id].lat === null);
  console.log(`PF stores missing coords: ${missing.length}`);

  for (const s of missing) {
    const addr = s.logradouro !== "0" ? `${s.logradouro} ${s.numero}, ${s.city}, ${s.state}, Brasil` : `${s.district}, ${s.city}, ${s.state}, Brasil`;
    console.log(`  Geocoding ID ${s.id} (${s.name}): "${addr}"`);

    try {
      const res = await nominatimSearch(addr);
      if (res && res.length > 0) {
        cache[s.id] = { lat: parseFloat(res[0].lat), lng: parseFloat(res[0].lon), query: addr, displayName: res[0].display_name };
        console.log(`    -> ${cache[s.id].lat}, ${cache[s.id].lng}`);
      } else {
        const fallback = `${s.district}, ${s.city}, ${s.state}, Brasil`;
        await sleep(1100);
        const res2 = await nominatimSearch(fallback);
        if (res2 && res2.length > 0) {
          cache[s.id] = { lat: parseFloat(res2[0].lat), lng: parseFloat(res2[0].lon), query: fallback, fallback: true };
          console.log(`    -> ${cache[s.id].lat}, ${cache[s.id].lng} (FALLBACK)`);
        } else {
          console.log(`    -> NOT FOUND`);
          cache[s.id] = { lat: null, lng: null, query: addr, error: "not_found" };
        }
      }
    } catch (err) {
      console.log(`    -> ERROR: ${err.message}`);
      cache[s.id] = { lat: null, lng: null, query: addr, error: err.message };
    }
    await sleep(1100);
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
  console.log(`\nDone! Cache updated.`);

  const pfCached = stores.filter((s) => cache[s.id] && cache[s.id].lat !== null);
  console.log(`PF stores with coords: ${pfCached.length}/${stores.length}`);
}

main().catch(console.error);
