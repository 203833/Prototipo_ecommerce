const https = require("https");
const http = require("http");

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MOTO_COST_TABLE = {
  1: 5.99, 2: 6.49, 3: 6.99, 4: 7.99, 5: 8.99,
  6: 9.99, 7: 11.49, 8: 12.99, 9: 14.99, 10: 15.99,
  11: 17.49, 12: 18.99, 13: 20.49, 14: 21.99, 15: 23.49,
  16: 24.99, 17: 26.49, 18: 27.99, 19: 29.49, 20: 30.99,
};

function calcShippingCost(distanceKm) {
  const km = Math.max(1, Math.ceil(distanceKm));
  if (km <= 20) return MOTO_COST_TABLE[km];
  return Number((30.99 + (km - 20) * 1.5).toFixed(2));
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const opts = typeof url === "string" ? new URL(url) : url;
    mod.get(opts, { headers: { "User-Agent": "FarmaciaSaoJoao-Test/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve(null); } });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const CEP = "99060468";

  console.log(`\n🔍 Testando CEP: ${CEP.slice(0,5)}-${CEP.slice(5)}\n`);

  const viaCep = await fetchJSON(`https://viacep.com.br/ws/${CEP}/json/`);
  if (viaCep.erro) { console.error("CEP não encontrado"); return; }

  console.log("📍 Endereço ViaCEP:");
  console.log(`   Rua: ${viaCep.logradouro}`);
  console.log(`   Bairro: ${viaCep.bairro}`);
  console.log(`   Cidade: ${viaCep.localidade}/${viaCep.uf}`);
  console.log(`   CEP: ${viaCep.cep}\n`);

  let coords;
  const fullAddr = `${viaCep.logradouro}, ${viaCep.bairro}, ${viaCep.localidade}, ${viaCep.uf}, Brasil`;
  console.log(`🔎 Geocodificando endereço: "${fullAddr}"`);
  try {
    const geoData = await fetchJSON(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(fullAddr)}`);
    if (geoData && geoData.length > 0) {
      coords = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
      console.log(`📌 Coordenadas do cliente (Nominatim - rua): lat=${coords.lat}, lng=${coords.lng}\n`);
    }
  } catch {}
  if (!coords) {
    const cityQuery = `${viaCep.localidade}, ${viaCep.uf}, Brasil`;
    try {
      const geoData = await fetchJSON(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(cityQuery)}`);
      if (geoData && geoData.length > 0) {
        coords = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
        console.log(`📌 Coordenadas do cliente (Nominatim - cidade): lat=${coords.lat}, lng=${coords.lng}\n`);
      }
    } catch {}
  }
  if (!coords) {
    coords = { lat: -28.2622, lng: -52.4083 };
    console.log(`📌 Coordenadas do cliente (fallback centro): lat=${coords.lat}, lng=${coords.lng}\n`);
  }

  let stores;
  {
    const fs = require("fs");
    const path = require("path");
    const content = fs.readFileSync(path.resolve(__dirname, "../src/data/stores.ts"), "utf-8");

    const match = content.match(/const STORES_WITH_COORDS: RawStore\[\] = \[([\s\S]*?)\];/);
    if (!match) { console.error("Não encontrou array de stores"); return; }

    stores = [];
    const lineRegex = /\{ code: "([^"]+)", name: "([^"]+)", address: "([^"]*)", district: "([^"]*)", zip: "([^"]*)", city: "([^"]*)", state: "([^"]*)", lat: ([\d.-]+), lng: ([\d.-]+) \}/g;
    let m;
    while ((m = lineRegex.exec(match[1])) !== null) {
      stores.push({
        id: Number(m[1]),
        code: m[1],
        name: m[2],
        address: m[3],
        district: m[4],
        zip: m[5],
        city: m[6],
        state: m[7],
        lat: parseFloat(m[8]),
        lng: parseFloat(m[9]),
      });
    }
  }

  console.log(`🏪 Total de filiais carregadas: ${stores.length}\n`);

  const ranked = stores
    .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
    .map((s) => ({
      ...s,
      distanceKm: haversineDistanceKm(coords.lat, coords.lng, s.lat, s.lng),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  TOP 10 FILIAIS MAIS PRÓXIMAS DO CEP 99060-468 (Passo Fundo)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  for (let i = 0; i < Math.min(10, ranked.length); i++) {
    const s = ranked[i];
    const frete = calcShippingCost(s.distanceKm);
    const marker = i === 0 ? "⭐" : `  ${i + 1}.`;
    console.log(`${marker} ${s.name} (ID: ${s.code})`);
    console.log(`      📍 ${s.address}, ${s.district}`);
    console.log(`      🏙️  ${s.city}/${s.state} - CEP: ${s.zip}`);
    console.log(`      📏 Distância: ${s.distanceKm.toFixed(2)} km`);
    console.log(`      💰 Frete estimado: R$ ${frete.toFixed(2)}`);
    console.log();
  }

  const nearest = ranked[0];
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  ✅ FILIAL MAIS PRÓXIMA: ${nearest.name} (${nearest.distanceKm.toFixed(2)} km)`);
  console.log(`     Frete: R$ ${calcShippingCost(nearest.distanceKm).toFixed(2)}`);
  console.log("═══════════════════════════════════════════════════════════════\n");
}

main().catch(console.error);
