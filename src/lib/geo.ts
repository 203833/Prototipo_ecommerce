export function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

export function formatCEP(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function normalizeText(text: string) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type CustomerLocation = {
  cep: string;
  street: string;
  district: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
};

/**
 * Coordenadas de cidades do Sul do Brasil.
 * Evita dependência do Nominatim para geocodificação.
 */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // RS
  "porto alegre-rs": { lat: -30.0346, lng: -51.2177 },
  "canoas-rs": { lat: -29.9178, lng: -51.1742 },
  "novo hamburgo-rs": { lat: -29.6878, lng: -51.1306 },
  "sao leopoldo-rs": { lat: -29.7600, lng: -51.1473 },
  "gravatai-rs": { lat: -29.9447, lng: -50.9919 },
  "cachoeirinha-rs": { lat: -29.9511, lng: -51.0939 },
  "viamao-rs": { lat: -30.0811, lng: -51.0233 },
  "alvorada-rs": { lat: -29.9908, lng: -51.0810 },
  "sapucaia do sul-rs": { lat: -29.8275, lng: -51.1497 },
  "esteio-rs": { lat: -29.8614, lng: -51.1786 },
  "guaiba-rs": { lat: -30.1139, lng: -51.3250 },
  "eldorado do sul-rs": { lat: -30.0864, lng: -51.3708 },
  "sapiranga-rs": { lat: -29.6350, lng: -51.0058 },
  "campo bom-rs": { lat: -29.6736, lng: -51.0603 },
  "taquara-rs": { lat: -29.6506, lng: -50.7814 },
  "tres coroas-rs": { lat: -29.5156, lng: -50.7758 },
  "igrejinha-rs": { lat: -29.5750, lng: -50.7906 },
  "parobé-rs": { lat: -29.6286, lng: -50.8344 },
  "parobe-rs": { lat: -29.6286, lng: -50.8344 },
  "caxias do sul-rs": { lat: -29.1681, lng: -51.1794 },
  "bento goncalves-rs": { lat: -29.1717, lng: -51.5181 },
  "farroupilha-rs": { lat: -29.2250, lng: -51.3486 },
  "carlos barbosa-rs": { lat: -29.2975, lng: -51.5033 },
  "garibaldi-rs": { lat: -29.2567, lng: -51.5336 },
  "flores da cunha-rs": { lat: -29.0286, lng: -51.1839 },
  "veranopolis-rs": { lat: -28.9392, lng: -51.5519 },
  "vacaria-rs": { lat: -28.4761, lng: -50.7069 },
  "antonio prado-rs": { lat: -28.8569, lng: -51.2833 },
  "sao marcos-rs": { lat: -28.9697, lng: -51.0686 },
  "pelotas-rs": { lat: -31.7719, lng: -52.3425 },
  "rio grande-rs": { lat: -32.0350, lng: -52.0986 },
  "bage-rs": { lat: -31.3289, lng: -54.1069 },
  "santa maria-rs": { lat: -29.6842, lng: -53.8069 },
  "passo fundo-rs": { lat: -28.2622, lng: -52.4083 },
  "erechim-rs": { lat: -27.6342, lng: -52.2739 },
  "carazinho-rs": { lat: -28.2839, lng: -52.7869 },
  "cruz alta-rs": { lat: -28.6386, lng: -53.6064 },
  "ijui-rs": { lat: -28.3878, lng: -53.9147 },
  "santo angelo-rs": { lat: -28.2994, lng: -54.2631 },
  "santa rosa-rs": { lat: -27.8711, lng: -54.4814 },
  "tres passos-rs": { lat: -27.4553, lng: -53.9317 },
  "tres de maio-rs": { lat: -27.7736, lng: -54.2392 },
  "santiago-rs": { lat: -29.1917, lng: -54.8667 },
  "uruguaiana-rs": { lat: -29.7547, lng: -57.0883 },
  "alegrete-rs": { lat: -29.7833, lng: -55.7914 },
  "sao borja-rs": { lat: -28.6603, lng: -56.0042 },
  "sao gabriel-rs": { lat: -30.3366, lng: -54.3200 },
  "sarandi-rs": { lat: -27.9439, lng: -52.9228 },
  "soledade-rs": { lat: -28.8283, lng: -52.5128 },
  "marau-rs": { lat: -28.4492, lng: -52.1997 },
  "lagoa vermelha-rs": { lat: -28.2100, lng: -51.5258 },
  "nao-me-toque-rs": { lat: -28.4597, lng: -52.8194 },
  "lajeado-rs": { lat: -29.4669, lng: -51.9614 },
  "estrela-rs": { lat: -29.5011, lng: -51.9614 },
  "teutonia-rs": { lat: -29.4483, lng: -51.8014 },
  "arroio do meio-rs": { lat: -29.4014, lng: -51.9447 },
  "venancio aires-rs": { lat: -29.6061, lng: -52.1914 },
  "santa cruz do sul-rs": { lat: -29.7178, lng: -52.4258 },
  "torres-rs": { lat: -29.3353, lng: -49.7267 },
  "tramandai-rs": { lat: -29.9839, lng: -50.1308 },
  "capao da canoa-rs": { lat: -29.7458, lng: -50.0094 },
  "osorio-rs": { lat: -29.8878, lng: -50.2703 },
  "santo antonio da patrulha-rs": { lat: -29.8264, lng: -50.5178 },
  "sao lourenco do sul-rs": { lat: -31.3653, lng: -51.9767 },
  "camaqua-rs": { lat: -30.8514, lng: -51.8117 },
  "tapes-rs": { lat: -30.6728, lng: -51.3958 },
  "santa vitoria do palmar-rs": { lat: -33.5186, lng: -53.3697 },
  "arroio grande-rs": { lat: -32.2361, lng: -53.0867 },
  "sao jose do norte-rs": { lat: -32.0158, lng: -52.0442 },
  "tupancireta-rs": { lat: -29.0847, lng: -53.8397 },
  "julio de castilhos-rs": { lat: -29.2275, lng: -53.6814 },
  "sao sepe-rs": { lat: -30.1608, lng: -53.5650 },
  "cacapava do sul-rs": { lat: -30.5117, lng: -53.4908 },
  "dom pedrito-rs": { lat: -30.9822, lng: -54.6731 },
  "santana do livramento-rs": { lat: -30.8908, lng: -55.5328 },
  "rosario do sul-rs": { lat: -30.2564, lng: -54.9147 },
  "sao luiz gonzaga-rs": { lat: -28.4081, lng: -54.9606 },
  "montenegro-rs": { lat: -29.6886, lng: -51.4611 },
  "triunfo-rs": { lat: -29.9367, lng: -51.7183 },
  "charqueadas-rs": { lat: -29.9539, lng: -51.6239 },
  "arroio dos ratos-rs": { lat: -30.0772, lng: -51.7303 },
  "sao jeronimo-rs": { lat: -29.9597, lng: -51.7267 },
  "barra do ribeiro-rs": { lat: -30.2942, lng: -51.3039 },
  "butiá-rs": { lat: -30.1197, lng: -51.9617 },
  "butia-rs": { lat: -30.1197, lng: -51.9617 },
  "vera cruz-rs": { lat: -29.7178, lng: -52.5114 },
  "arvorezinha-rs": { lat: -28.8736, lng: -52.1781 },
  "barros cassal-rs": { lat: -29.0942, lng: -52.5836 },
  "seberi-rs": { lat: -27.4831, lng: -53.4028 },
  "frederico westphalen-rs": { lat: -27.3594, lng: -53.3947 },
  "palmeira das missoes-rs": { lat: -27.8994, lng: -53.3133 },
  // SC
  "florianopolis-sc": { lat: -27.5954, lng: -48.5480 },
  "joinville-sc": { lat: -26.3045, lng: -48.8487 },
  "blumenau-sc": { lat: -26.9194, lng: -49.0661 },
  "balneario camboriu-sc": { lat: -26.9908, lng: -48.6346 },
  "itajai-sc": { lat: -26.9078, lng: -48.6619 },
  "criciuma-sc": { lat: -28.6775, lng: -49.3697 },
  "chapeco-sc": { lat: -27.1006, lng: -52.6157 },
  "lages-sc": { lat: -27.8161, lng: -50.3261 },
  "sao jose-sc": { lat: -27.5954, lng: -48.6348 },
  "palhoca-sc": { lat: -27.6453, lng: -48.6681 },
  "tubarao-sc": { lat: -28.4669, lng: -49.0067 },
  "ararangua-sc": { lat: -28.9347, lng: -49.4856 },
  "sombrio-sc": { lat: -29.1053, lng: -49.6319 },
  "videira-sc": { lat: -27.0083, lng: -51.1519 },
  "barra velha-sc": { lat: -26.6314, lng: -48.6864 },
  "tijucas-sc": { lat: -27.2378, lng: -48.6339 },
  "timbo-sc": { lat: -26.8231, lng: -49.2736 },
  "sao bento do sul-sc": { lat: -26.2506, lng: -49.3786 },
  "sao miguel do oeste-sc": { lat: -26.7258, lng: -53.5153 },
  "sao joaquim-sc": { lat: -28.2942, lng: -49.9317 },
  "seara-sc": { lat: -27.1500, lng: -52.3081 },
  "sao joao batista-sc": { lat: -27.2761, lng: -48.8481 },
  // PR
  "curitiba-pr": { lat: -25.4284, lng: -49.2733 },
  "londrina-pr": { lat: -23.3045, lng: -51.1696 },
  "maringa-pr": { lat: -23.4205, lng: -51.9333 },
  "cascavel-pr": { lat: -24.9573, lng: -53.4593 },
  "foz do iguacu-pr": { lat: -25.5478, lng: -54.5882 },
  "ponta grossa-pr": { lat: -25.0950, lng: -50.1619 },
  "toledo-pr": { lat: -24.7136, lng: -53.7431 },
  "apucarana-pr": { lat: -23.5508, lng: -51.4608 },
  "arapongas-pr": { lat: -23.3531, lng: -51.4243 },
  "araucaria-pr": { lat: -25.5928, lng: -49.4103 },
  "ampere-pr": { lat: -25.9167, lng: -53.4667 },
  "umuarama-pr": { lat: -23.7664, lng: -53.3250 },
  "campo mourao-pr": { lat: -24.0453, lng: -52.3831 },
  "sarandi-pr": { lat: -23.4431, lng: -51.8728 },
  "sao mateus do sul-pr": { lat: -25.8744, lng: -50.3822 },
  "sao miguel do iguacu-pr": { lat: -25.3489, lng: -54.2364 },
};

function lookupCityCoords(city: string, state: string): { lat: number; lng: number } | null {
  const normalized = normalizeText(`${city}-${state}`);
  if (CITY_COORDS[normalized]) return CITY_COORDS[normalized];

  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(key.split("-")[0]) && key.endsWith(`-${state.toLowerCase()}`)) {
      return coords;
    }
  }
  return null;
}

export async function fetchAddressByCEP(cep: string): Promise<CustomerLocation> {
  const clean = onlyDigits(cep);
  if (clean.length !== 8) throw new Error("CEP inválido");

  let viaCepData;
  try {
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!viaCepResponse.ok) throw new Error("Erro ao consultar ViaCEP");
    viaCepData = await viaCepResponse.json();
  } catch {
    throw new Error("Não foi possível consultar o CEP. Verifique sua conexão.");
  }

  if (viaCepData.erro) throw new Error("CEP não encontrado");

  const city = viaCepData.localidade || "";
  const state = viaCepData.uf || "";

  const street = viaCepData.logradouro || "";
  const district = viaCepData.bairro || "";

  const nominatimHeaders = {
    "Accept-Language": "pt-BR",
    "User-Agent": "FarmaciaSaoJoao-PromiseEngine/1.0",
  };

  if (street) {
    try {
      const fullAddr = encodeURIComponent(`${street}, ${district}, ${city}, ${state}, Brasil`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${fullAddr}`,
        { headers: nominatimHeaders }
      );
      const data = await res.json();
      if (data?.length) {
        return {
          cep: viaCepData.cep,
          street,
          district,
          city,
          state,
          lat: Number(data[0].lat),
          lng: Number(data[0].lon),
        };
      }
    } catch {
      // street-level Nominatim failed, try fallbacks
    }
  }

  const localCoords = lookupCityCoords(city, state);
  if (localCoords) {
    return {
      cep: viaCepData.cep,
      street,
      district,
      city,
      state,
      lat: localCoords.lat,
      lng: localCoords.lng,
    };
  }

  try {
    const query = encodeURIComponent(`${city}, ${state}, Brasil`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${query}`,
      { headers: nominatimHeaders }
    );
    const data = await res.json();
    if (data?.length) {
      return {
        cep: viaCepData.cep,
        street,
        district,
        city,
        state,
        lat: Number(data[0].lat),
        lng: Number(data[0].lon),
      };
    }
  } catch {
    // city-level Nominatim also failed
  }

  throw new Error(
    `Cidade "${city}/${state}" não está na base de coordenadas. Tente um CEP de RS, SC ou PR.`
  );
}
