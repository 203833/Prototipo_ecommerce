const fs = require("fs");
const path = require("path");
const https = require("https");

const RAW_TSV_PATH = path.resolve(__dirname, "stores-raw.tsv");
const CACHE_PATH = path.resolve(__dirname, "geocache.json");

const SKIP_IDS = new Set([
  "0", "104", "377", "560", "945", "960", "992", "993",
  "1244", "1441", "1604", "1646", "1667", "3001", "4001", "5001",
]);

const DELAY_MS = 1100;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nominatimSearch(query) {
  return new Promise((resolve, reject) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;
    https
      .get(url, { headers: { "User-Agent": "FarmaciaSaoJoao-Geocoder/1.0", "Accept-Language": "pt-BR" } }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("Invalid JSON"));
          }
        });
      })
      .on("error", reject);
  });
}

function parseStores() {
  const raw = fs.readFileSync(RAW_TSV_PATH, "utf-8");
  const lines = raw.trim().split("\n");
  return lines
    .slice(1)
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 16)
    .map((cols) => ({
      id: cols[0].trim(),
      name: (cols[2] || "").trim(),
      city: (cols[3] || "").trim(),
      cep: (cols[4] || "").replace(/\D/g, ""),
      district: (cols[5] || "").trim(),
      logradouro: (cols[6] || "").trim(),
      numero: (cols[7] || "").trim(),
      state: (cols[15] || "").trim(),
    }))
    .filter((s) => !SKIP_IDS.has(s.id));
}

function buildQuery(store) {
  const parts = [];
  if (store.logradouro && store.logradouro !== "0") {
    parts.push(store.logradouro);
    if (store.numero && store.numero !== "0") parts.push(store.numero);
  }
  parts.push(store.district);
  parts.push(store.city);
  parts.push(store.state);
  parts.push("Brasil");
  return parts.join(", ");
}

function buildFallbackQuery(store) {
  return `${store.district}, ${store.city}, ${store.state}, Brasil`;
}

async function main() {
  const stores = parseStores();
  console.log(`Total stores to geocode: ${stores.length}`);

  let cache = {};
  if (fs.existsSync(CACHE_PATH)) {
    cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    console.log(`Loaded cache with ${Object.keys(cache).length} entries`);
  }

  let done = 0;
  let hits = 0;
  let misses = 0;
  let skipped = 0;

  for (const store of stores) {
    if (cache[store.id]) {
      skipped++;
      done++;
      continue;
    }

    const query = buildQuery(store);
    try {
      const results = await nominatimSearch(query);
      if (results && results.length > 0) {
        cache[store.id] = {
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          query,
          displayName: results[0].display_name,
        };
        hits++;
      } else {
        const fallback = buildFallbackQuery(store);
        await sleep(DELAY_MS);
        const results2 = await nominatimSearch(fallback);
        if (results2 && results2.length > 0) {
          cache[store.id] = {
            lat: parseFloat(results2[0].lat),
            lng: parseFloat(results2[0].lon),
            query: fallback,
            displayName: results2[0].display_name,
            fallback: true,
          };
          hits++;
        } else {
          cache[store.id] = { lat: null, lng: null, query, error: "not_found" };
          misses++;
        }
      }
    } catch (err) {
      cache[store.id] = { lat: null, lng: null, query, error: err.message };
      misses++;
    }

    done++;

    if (done % 10 === 0 || done === stores.length) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
      const remaining = stores.length - done;
      const eta = Math.ceil((remaining * DELAY_MS) / 60000);
      console.log(`[${done}/${stores.length}] hits=${hits} misses=${misses} skipped=${skipped} ETA ~${eta}min`);
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");

  const nullEntries = Object.values(cache).filter((v) => v.lat === null).length;
  console.log(`\nDone! Total cached: ${Object.keys(cache).length}, with coords: ${Object.keys(cache).length - nullEntries}, missing: ${nullEntries}`);
  console.log(`Cache saved to: ${CACHE_PATH}`);
}

main().catch(console.error);
