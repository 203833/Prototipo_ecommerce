#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SKIP_IDS = new Set([
  "0", "104", "377", "560", "945", "960", "992", "993",
  "1244", "1441", "1604", "1646", "1667", "3001", "4001", "5001",
]);

function normalize(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/,+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const CITY_COORDS = {
  // ── RS ──
  "PASSO FUNDO-RS": { lat: -28.2622, lng: -52.4083 },
  "NOVA PRATA-RS": { lat: -28.7797, lng: -51.6108 },
  "MARAU-RS": { lat: -28.4492, lng: -52.1997 },
  "PALMEIRA DAS MISSOES-RS": { lat: -27.9000, lng: -53.3133 },
  "VERANOPOLIS-RS": { lat: -28.9392, lng: -51.5519 },
  "TRES PASSOS-RS": { lat: -27.4553, lng: -53.9317 },
  "CARAZINHO-RS": { lat: -28.2839, lng: -52.7869 },
  "ERECHIM-RS": { lat: -27.6342, lng: -52.2739 },
  "SARANDI-RS": { lat: -27.9439, lng: -52.9228 },
  "SANTA MARIA-RS": { lat: -29.6842, lng: -53.8069 },
  "PORTO ALEGRE-RS": { lat: -30.0346, lng: -51.2177 },
  "CAXIAS DO SUL-RS": { lat: -29.1681, lng: -51.1794 },
  "PELOTAS-RS": { lat: -31.7719, lng: -52.3425 },
  "RIO GRANDE-RS": { lat: -32.0350, lng: -52.0986 },
  "BAGE-RS": { lat: -31.3289, lng: -54.1069 },
  "ALEGRETE-RS": { lat: -29.7833, lng: -55.7914 },
  "URUGUAIANA-RS": { lat: -29.7547, lng: -57.0883 },
  "SANTO ANGELO-RS": { lat: -28.2994, lng: -54.2631 },
  "SANTA ROSA-RS": { lat: -27.8711, lng: -54.4814 },
  "CRUZ ALTA-RS": { lat: -28.6386, lng: -53.6064 },
  "IJUI-RS": { lat: -28.3878, lng: -53.9147 },
  "SAO BORJA-RS": { lat: -28.6603, lng: -56.0042 },
  "SAO GABRIEL-RS": { lat: -30.3366, lng: -54.3200 },
  "SANTIAGO-RS": { lat: -29.1917, lng: -54.8667 },
  "VACARIA-RS": { lat: -28.4761, lng: -50.7069 },
  "TORRES-RS": { lat: -29.3353, lng: -49.7267 },
  "TRAMANDAI-RS": { lat: -29.9839, lng: -50.1308 },
  "SAO LEOPOLDO-RS": { lat: -29.7600, lng: -51.1473 },
  "NOVO HAMBURGO-RS": { lat: -29.6878, lng: -51.1306 },
  "CANOAS-RS": { lat: -29.9178, lng: -51.1742 },
  "GRAVATAI-RS": { lat: -29.9447, lng: -50.9919 },
  "CACHOEIRINHA-RS": { lat: -29.9511, lng: -51.0939 },
  "VIAMAO-RS": { lat: -30.0811, lng: -51.0233 },
  "ALVORADA-RS": { lat: -29.9908, lng: -51.0810 },
  "SAPUCAIA DO SUL-RS": { lat: -29.8275, lng: -51.1497 },
  "ESTEIO-RS": { lat: -29.8614, lng: -51.1786 },
  "GUAIBA-RS": { lat: -30.1139, lng: -51.3250 },
  "SAPIRANGA-RS": { lat: -29.6350, lng: -51.0058 },
  "TAQUARA-RS": { lat: -29.6506, lng: -50.7814 },
  "TRES COROAS-RS": { lat: -29.5156, lng: -50.7758 },
  "IGREJINHA-RS": { lat: -29.5750, lng: -50.7906 },
  "PAROBE-RS": { lat: -29.6286, lng: -50.8344 },
  "BENTO GONCALVES-RS": { lat: -29.1717, lng: -51.5181 },
  "LAJEADO-RS": { lat: -29.4669, lng: -51.9614 },
  "SANTA CRUZ DO SUL-RS": { lat: -29.7178, lng: -52.4258 },
  "VENANCIO AIRES-RS": { lat: -29.6061, lng: -52.1914 },
  "MONTENEGRO-RS": { lat: -29.6886, lng: -51.4611 },
  "CAPAO DA CANOA-RS": { lat: -29.7458, lng: -50.0094 },
  "CACHOEIRA DO SUL-RS": { lat: -30.0394, lng: -52.8936 },
  "LAGOA VERMELHA-RS": { lat: -28.2100, lng: -51.5258 },
  "NAO-ME-TOQUE-RS": { lat: -28.4597, lng: -52.8194 },
  "SOLEDADE-RS": { lat: -28.8283, lng: -52.5128 },
  "FREDERICO WESTPHALEN-RS": { lat: -27.3594, lng: -53.3947 },
  "SAO LOURENCO DO SUL-RS": { lat: -31.3653, lng: -51.9767 },
  "CAMAQUA-RS": { lat: -30.8514, lng: -51.8117 },
  "TEUTONIA-RS": { lat: -29.4483, lng: -51.8014 },
  "ARROIO DO MEIO-RS": { lat: -29.4014, lng: -51.9447 },
  "ESTRELA-RS": { lat: -29.5011, lng: -51.9614 },
  "ENCANTADO-RS": { lat: -29.2358, lng: -51.8711 },
  "GUAPORE-RS": { lat: -28.8431, lng: -51.8906 },
  "GARIBALDI-RS": { lat: -29.2567, lng: -51.5336 },
  "CARLOS BARBOSA-RS": { lat: -29.2975, lng: -51.5033 },
  "FARROUPILHA-RS": { lat: -29.2250, lng: -51.3486 },
  "FLORES DA CUNHA-RS": { lat: -29.0286, lng: -51.1839 },
  "GRAMADO-RS": { lat: -29.3786, lng: -50.8764 },
  "CANELA-RS": { lat: -29.3653, lng: -50.8117 },
  "NOVA PETROPOLIS-RS": { lat: -29.3750, lng: -51.1139 },
  "SANTANA DO LIVRAMENTO-RS": { lat: -30.8908, lng: -55.5328 },
  "DOM PEDRITO-RS": { lat: -30.9822, lng: -54.6731 },
  "ROSARIO DO SUL-RS": { lat: -30.2564, lng: -54.9147 },
  "SAO LUIZ GONZAGA-RS": { lat: -28.4081, lng: -54.9606 },
  "TUPANCIRETA-RS": { lat: -29.0847, lng: -53.8397 },
  "JULIO DE CASTILHOS-RS": { lat: -29.2275, lng: -53.6814 },
  "SAO SEPE-RS": { lat: -30.1608, lng: -53.5650 },
  "CACAPAVA DO SUL-RS": { lat: -30.5117, lng: -53.4908 },
  "TRIUNFO-RS": { lat: -29.9367, lng: -51.7183 },
  "SAO JERONIMO-RS": { lat: -29.9597, lng: -51.7267 },
  "CHARQUEADAS-RS": { lat: -29.9539, lng: -51.6239 },
  "CHARQUEADA-RS": { lat: -29.9539, lng: -51.6239 },
  "ELDORADO DO SUL-RS": { lat: -30.0864, lng: -51.3708 },
  "ROLANTE-RS": { lat: -29.6483, lng: -50.5758 },
  "ARROIO GRANDE-RS": { lat: -32.2361, lng: -53.0867 },
  "SAO JOSE DO NORTE-RS": { lat: -32.0158, lng: -52.0442 },
  "SAO FRANCISCO DE PAULA-RS": { lat: -29.4483, lng: -50.5833 },
  "JAGUARAO-RS": { lat: -32.5672, lng: -53.3750 },
  "TAPES-RS": { lat: -30.6728, lng: -51.3958 },
  "SANTA VITORIA DO PALMAR-RS": { lat: -33.5186, lng: -53.3697 },
  "CANDELARIA-RS": { lat: -29.6700, lng: -52.7889 },
  "RIO PARDO-RS": { lat: -29.9900, lng: -52.3783 },
  "ESPUMOSO-RS": { lat: -28.7250, lng: -52.8500 },
  "SAO MARCOS-RS": { lat: -28.9697, lng: -51.0686 },
  "PANAMBI-RS": { lat: -28.2928, lng: -53.5017 },
  "IBIRUBA-RS": { lat: -28.6333, lng: -53.0897 },
  "TAPEJARA-RS": { lat: -28.0653, lng: -52.0092 },
  "ANTONIO PRADO-RS": { lat: -28.8569, lng: -51.2833 },
  "OSORIO-RS": { lat: -29.8878, lng: -50.2703 },
  "DOIS IRMAOS-RS": { lat: -29.5797, lng: -51.0850 },
  "CAMPO BOM-RS": { lat: -29.6736, lng: -51.0603 },
  "SAO SEBASTIAO DO CAI-RS": { lat: -29.5878, lng: -51.3750 },
  "IVOTI-RS": { lat: -29.5917, lng: -51.1553 },
  "ESTANCIA VELHA-RS": { lat: -29.6533, lng: -51.1817 },
  "TAQUARI-RS": { lat: -29.7978, lng: -51.8650 },
  "BARRA DO RIBEIRO-RS": { lat: -30.2942, lng: -51.3039 },
  "BUTIA-RS": { lat: -30.1197, lng: -51.9617 },
  "NOVA SANTA RITA-RS": { lat: -29.8533, lng: -51.2833 },
  "ARROIO DOS RATOS-RS": { lat: -30.0772, lng: -51.7303 },
  "DOM FELICIANO-RS": { lat: -30.7006, lng: -52.1050 },
  "RESTINGA SECA-RS": { lat: -29.8167, lng: -53.3750 },
  "BARROS CASSAL-RS": { lat: -29.0942, lng: -52.5836 },
  "SERAFINA CORREA-RS": { lat: -28.7117, lng: -51.9333 },
  "NOVA BASSANO-RS": { lat: -28.7269, lng: -51.7300 },
  "ARVOREZINHA-RS": { lat: -28.8736, lng: -52.1781 },
  "FONTOURA XAVIER-RS": { lat: -28.9833, lng: -52.3500 },
  "TAPERA-RS": { lat: -28.6278, lng: -52.8689 },
  "CHAPADA-RS": { lat: -28.0583, lng: -53.0650 },
  "SANANDUVA-RS": { lat: -28.2833, lng: -51.9500 },
  "RONDA ALTA-RS": { lat: -27.7750, lng: -52.8050 },
  "SALTO DO JACUI-RS": { lat: -29.0947, lng: -53.2133 },
  "SAO FRANCISCO DE ASSIS-RS": { lat: -29.5539, lng: -55.1267 },
  "JAGUARI-RS": { lat: -29.4953, lng: -54.6917 },
  "NONOAI-RS": { lat: -27.3633, lng: -52.7717 },
  "BOM JESUS-RS": { lat: -28.6686, lng: -50.4178 },
  "GETULIO VARGAS-RS": { lat: -27.8867, lng: -52.2283 },
  "HORIZONTINA-RS": { lat: -27.6250, lng: -54.3117 },
  "GIRUA-RS": { lat: -28.0297, lng: -54.3500 },
  "ITAQUI-RS": { lat: -29.1250, lng: -56.5533 },
  "FELIZ-RS": { lat: -29.4517, lng: -51.3050 },
  "PINHEIRO MACHADO-RS": { lat: -31.5786, lng: -53.3817 },
  "CANDIOTA-RS": { lat: -31.5608, lng: -53.6750 },
  "SEBERI-RS": { lat: -27.4831, lng: -53.4028 },
  "SANTO ANTONIO DA PATRULHA-RS": { lat: -29.8264, lng: -50.5178 },
  "CIDREIRA-RS": { lat: -30.1750, lng: -50.2250 },
  "ARROIO DO SAL-RS": { lat: -29.5450, lng: -49.8900 },
  "XANGRI-LA-RS": { lat: -29.8000, lng: -50.0500 },
  "IMBE-RS": { lat: -29.9742, lng: -50.1283 },
  "TERRA DE AREIA-RS": { lat: -29.5783, lng: -50.0683 },
  "TRES CACHOEIRAS-RS": { lat: -29.4483, lng: -49.9267 },
  "GLORINHA-RS": { lat: -29.8783, lng: -50.7717 },
  "PALMARES DO SUL-RS": { lat: -30.2583, lng: -50.5083 },
  "CANGUCU-RS": { lat: -31.3958, lng: -52.6758 },
  "PIRATINI-RS": { lat: -31.4500, lng: -53.1000 },
  "IPE-RS": { lat: -28.8167, lng: -51.2833 },
  "TEUTENIA-RS": { lat: -29.4500, lng: -51.8083 },
  "ITAI-RS": { lat: -29.1264, lng: -56.5533 },
  "MOSTARDAS-RS": { lat: -31.1069, lng: -50.9217 },
  "PORTAO-RS": { lat: -29.5450, lng: -51.2467 },
  "NOVA HARTZ-RS": { lat: -29.5817, lng: -50.9067 },
  "BOM PRINCIPIO-RS": { lat: -29.4850, lng: -51.3550 },
  "BOM RETIRO DO SUL-RS": { lat: -29.6108, lng: -51.9483 },
  "ROCA SALES-RS": { lat: -29.2883, lng: -51.8650 },
  "VERA CRUZ-RS": { lat: -29.7178, lng: -52.5114 },
  "ARROIO DO TIGRE-RS": { lat: -29.3350, lng: -53.0933 },
  "CERRO GRANDE DO SUL-RS": { lat: -30.5917, lng: -51.7383 },
  "CERRO LARGO-RS": { lat: -28.1467, lng: -54.7350 },
  "CONDOR-RS": { lat: -28.2083, lng: -53.4917 },
  "ENTRE IJUIS-RS": { lat: -28.3683, lng: -54.2683 },
  "AGUDO-RS": { lat: -29.6455, lng: -53.2541 },
  "ACEGUA-RS": { lat: -31.8686, lng: -54.1617 },
  "ENCRUZILHADA DO SUL-RS": { lat: -30.5444, lng: -52.5217 },
  "CHUI-RS": { lat: -33.6917, lng: -53.4583 },
  "SANTO CRISTO-RS": { lat: -27.8283, lng: -54.6617 },
  "PLANALTO-RS": { lat: -27.3300, lng: -53.0583 },
  "PORTO XAVIER-RS": { lat: -27.9083, lng: -55.1367 },
  "BARRA DO QUARAI-RS": { lat: -30.2083, lng: -57.5517 },
  "SANTO ANTONIO DAS MISSOES-RS": { lat: -28.5117, lng: -54.9783 },
  "SAO PEDRO DO SUL-RS": { lat: -29.6217, lng: -54.1850 },
  "SANTA CLARA DO SUL-RS": { lat: -29.4717, lng: -52.0850 },
  "TENENTE PORTELA-RS": { lat: -27.3717, lng: -53.7583 },
  "BALNEARIO PINHAL-RS": { lat: -30.2417, lng: -50.2333 },
  "PASSO DE TORRES-RS": { lat: -29.3117, lng: -49.7117 },
  "CACEQUI-RS": { lat: -29.8833, lng: -54.8283 },
  "QUARAI-RS": { lat: -30.3856, lng: -56.4514 },
  "CAPELA DE SANTANA-RS": { lat: -29.7000, lng: -51.3283 },
  "TRES DE MAIO-RS": { lat: -27.7736, lng: -54.2392 },

  // ── SC ──
  "FLORIANOPOLIS-SC": { lat: -27.5954, lng: -48.5480 },
  "JOINVILLE-SC": { lat: -26.3045, lng: -48.8487 },
  "BLUMENAU-SC": { lat: -26.9194, lng: -49.0661 },
  "BALNEARIO CAMBORIU-SC": { lat: -26.9908, lng: -48.6346 },
  "CAMBORIU-SC": { lat: -27.0244, lng: -48.6517 },
  "ITAJAI-SC": { lat: -26.9078, lng: -48.6619 },
  "CHAPECO-SC": { lat: -27.1006, lng: -52.6157 },
  "LAGES-SC": { lat: -27.8161, lng: -50.3261 },
  "SAO JOSE-SC": { lat: -27.6136, lng: -48.6366 },
  "PALHOCA-SC": { lat: -27.6453, lng: -48.6681 },
  "TUBARAO-SC": { lat: -28.4669, lng: -49.0067 },
  "ARARANGUA-SC": { lat: -28.9347, lng: -49.4856 },
  "SOMBRIO-SC": { lat: -29.1053, lng: -49.6319 },
  "VIDEIRA-SC": { lat: -27.0083, lng: -51.1519 },
  "CONCORDIA-SC": { lat: -27.2342, lng: -52.0278 },
  "JOACABA-SC": { lat: -27.1736, lng: -51.5047 },
  "CAMPOS NOVOS-SC": { lat: -27.4017, lng: -51.2253 },
  "CACADOR-SC": { lat: -26.7747, lng: -51.0125 },
  "HERVAL DOESTE-SC": { lat: -27.1917, lng: -51.4917 },
  "HERVAL D'OESTE-SC": { lat: -27.1917, lng: -51.4917 },
  "MARAVILHA-SC": { lat: -26.7633, lng: -53.1717 },
  "BRUSQUE-SC": { lat: -27.0978, lng: -48.9175 },
  "ITAPEMA-SC": { lat: -27.0903, lng: -48.6117 },
  "TIMBO-SC": { lat: -26.8231, lng: -49.2736 },
  "SAO BENTO DO SUL-SC": { lat: -26.2506, lng: -49.3786 },
  "SAO MIGUEL DO OESTE-SC": { lat: -26.7258, lng: -53.5153 },
  "NAVEGANTES-SC": { lat: -26.8928, lng: -48.6550 },
  "GAROPABA-SC": { lat: -28.0283, lng: -48.6233 },
  "BIGUACU-SC": { lat: -27.4939, lng: -48.6553 },
  "SANTO AMARO DA IMPERATRIZ-SC": { lat: -27.6872, lng: -48.7781 },
  "ICARA-SC": { lat: -28.7133, lng: -49.3000 },
  "BRACO DO NORTE-SC": { lat: -28.2744, lng: -49.1650 },
  "SEARA-SC": { lat: -27.1500, lng: -52.3081 },
  "GUABIRUBA-SC": { lat: -27.0883, lng: -48.9800 },
  "CRICIUMA-SC": { lat: -28.6775, lng: -49.3697 },
  "INDAIAL-SC": { lat: -26.8981, lng: -49.2317 },
  "PINHALZINHO-SC": { lat: -26.8483, lng: -52.9917 },
  "CANOINHAS-SC": { lat: -26.1767, lng: -50.3900 },
  "CAPINZAL-SC": { lat: -27.3483, lng: -51.6117 },
  "LAGUNA-SC": { lat: -28.4833, lng: -48.7783 },
  "SAO JOAQUIM-SC": { lat: -28.2942, lng: -49.9317 },
  "PENHA-SC": { lat: -26.7708, lng: -48.6450 },
  "SAO JOAO BATISTA-SC": { lat: -27.2761, lng: -48.8481 },
  "SAO LUDGERO-SC": { lat: -28.3267, lng: -49.1733 },
  "IBIRAMA-SC": { lat: -27.0583, lng: -49.5167 },
  "ILHOTA-SC": { lat: -26.9000, lng: -48.8250 },
  "COCAL DO SUL-SC": { lat: -28.6000, lng: -49.3333 },
  "CORREIA PINTO-SC": { lat: -27.5833, lng: -50.3617 },
  "RIO NEGRO-SC": { lat: -26.1000, lng: -49.7983 },
  "MAFRA-SC": { lat: -26.1117, lng: -49.8050 },
  "PORTO UNIAO-SC": { lat: -26.2350, lng: -51.0783 },
  "LUIZ ALVES-SC": { lat: -26.7183, lng: -48.9317 },
  "GUARAMIRIM-SC": { lat: -26.4733, lng: -49.0017 },
  "POMERODE-SC": { lat: -26.7408, lng: -49.1767 },
  "PORTO BELO-SC": { lat: -27.1583, lng: -48.5533 },
  "JARAGUA DO SUL-SC": { lat: -26.4856, lng: -49.0689 },
  "BARRA VELHA-SC": { lat: -26.6314, lng: -48.6864 },
  "TIJUCAS-SC": { lat: -27.2378, lng: -48.6339 },
  "NOVA VENEZA-SC": { lat: -28.6333, lng: -49.5000 },
  "GARUVA-SC": { lat: -26.0283, lng: -48.8517 },
  "ARAQUARI-SC": { lat: -26.3733, lng: -48.7217 },
  "LONTRAS-SC": { lat: -27.1667, lng: -49.5417 },
  "TAIO-SC": { lat: -27.1167, lng: -49.9917 },
  "BOMBINHAS-SC": { lat: -27.1333, lng: -48.5150 },
  "BALNEARIO PICARRAS-SC": { lat: -26.7617, lng: -48.6717 },
  "TURVO-SC": { lat: -28.9267, lng: -49.6850 },
  "CAPIVARI DE BAIXO-SC": { lat: -28.4500, lng: -48.9583 },
  "JAGUARUNA-SC": { lat: -28.6150, lng: -49.0267 },
  "BALN RINCAO-SC": { lat: -28.8017, lng: -49.2350 },
  "BALNEARIO RINCAO-SC": { lat: -28.8017, lng: -49.2350 },
  "DIONISIO CERQUEIRA-SC": { lat: -26.2617, lng: -53.6367 },
  "SAO LOURENCO DO OESTE-SC": { lat: -26.3567, lng: -52.8517 },
  "ITAPIRANGA-SC": { lat: -27.1700, lng: -53.7133 },
  "FORQUILHINHA-SC": { lat: -28.7483, lng: -49.4717 },
  "BALNEARIO ARROIO DO SILVA-SC": { lat: -28.9767, lng: -49.3817 },
  "BALN ARROIO SILVA-SC": { lat: -28.9767, lng: -49.3817 },
  "BALNEARIO GAIVOTA-SC": { lat: -29.1533, lng: -49.5833 },
  "MORRO DA FUMACA-SC": { lat: -28.6533, lng: -49.2183 },
  "SAO JOA BATISTA-SC": { lat: -27.2761, lng: -48.8481 },
  "FORQUILINHA-SC": { lat: -28.7483, lng: -49.4717 },
  "ITAPOA-SC": { lat: -26.1167, lng: -48.6167 },
  "PASSO DE TORRES-SC": { lat: -29.3117, lng: -49.7117 },

  // ── PR ──
  "CURITIBA-PR": { lat: -25.4284, lng: -49.2733 },
  "LONDRINA-PR": { lat: -23.3045, lng: -51.1696 },
  "MARINGA-PR": { lat: -23.4205, lng: -51.9333 },
  "CASCAVEL-PR": { lat: -24.9573, lng: -53.4593 },
  "FOZ DO IGUACU-PR": { lat: -25.5478, lng: -54.5882 },
  "TOLEDO-PR": { lat: -24.7136, lng: -53.7431 },
  "APUCARANA-PR": { lat: -23.5508, lng: -51.4608 },
  "ARAPONGAS-PR": { lat: -23.3531, lng: -51.4243 },
  "ARAUCARIA-PR": { lat: -25.5928, lng: -49.4103 },
  "AMPERE-PR": { lat: -25.9167, lng: -53.4667 },
  "FRANCISCO BELTRAO-PR": { lat: -26.0783, lng: -53.0550 },
  "DOIS VIZINHOS-PR": { lat: -25.7394, lng: -53.0611 },
  "CAMPO MOURAO-PR": { lat: -24.0453, lng: -52.3831 },
  "CIANORTE-PR": { lat: -23.6628, lng: -52.6050 },
  "GUAIRA-PR": { lat: -24.0856, lng: -54.2558 },
  "SARANDI-PR": { lat: -23.4431, lng: -51.8728 },
  "PINHAO-PR": { lat: -25.6933, lng: -51.6583 },
  "QUEDAS DO IGUACU-PR": { lat: -25.4483, lng: -52.9083 },
  "LARANJEIRAS DO SUL-PR": { lat: -25.4078, lng: -52.4161 },
  "UMUARAMA-PR": { lat: -23.7664, lng: -53.3250 },
  "SAO MATEUS DO SUL-PR": { lat: -25.8744, lng: -50.3822 },
  "ASSIS CHATEAUBRIAND-PR": { lat: -24.4178, lng: -53.5178 },
  "MARECHAL CANDIDO RONDON-PR": { lat: -24.5558, lng: -54.0578 },
  "SAO MIGUEL DO IGUACU-PR": { lat: -25.3489, lng: -54.2364 },
  "PINHAIS-PR": { lat: -25.4428, lng: -49.1928 },
  "MANDAGUARI-PR": { lat: -23.5469, lng: -51.6708 },
  "MARIALVA-PR": { lat: -23.4850, lng: -51.7917 },
  "MANDAGUACU-PR": { lat: -23.3478, lng: -52.0958 },
  "PAICANDU-PR": { lat: -23.4558, lng: -52.0483 },
  "ASTORGA-PR": { lat: -23.2317, lng: -51.6650 },
  "NOVA ESPERANCA-PR": { lat: -23.1833, lng: -52.2017 },
  "JANDAIA DO SUL-PR": { lat: -23.6017, lng: -51.6417 },
  "COLORADO-PR": { lat: -22.8367, lng: -51.9733 },
  "LOANDA-PR": { lat: -22.9233, lng: -53.1350 },
  "PARANAVAI-PR": { lat: -23.0731, lng: -52.4653 },
  "ENGENHEIRO BELTRAO-PR": { lat: -23.7967, lng: -52.2700 },
  "GOIOERE-PR": { lat: -24.1850, lng: -53.0267 },
  "CRUZEIRO DO OESTE-PR": { lat: -23.7800, lng: -53.0767 },
  "TERRA BOA-PR": { lat: -23.7633, lng: -52.4433 },
  "CAMBE-PR": { lat: -23.2764, lng: -51.2783 },
  "ROLANDIA-PR": { lat: -23.3100, lng: -51.3717 },
  "IMBITUVA-PR": { lat: -25.2283, lng: -50.6017 },
  "PALMAS-PR": { lat: -26.4844, lng: -51.9908 },
  "FAZENDA RIO GRANDE-PR": { lat: -25.6622, lng: -49.3083 },
  "RESERVA-PR": { lat: -24.6517, lng: -50.8467 },
  "PRUDENTOPOLIS-PR": { lat: -25.2128, lng: -50.9783 },
  "PIRAI DO SUL-PR": { lat: -24.5267, lng: -49.9467 },
  "QUITANDINHA-PR": { lat: -25.8717, lng: -49.4950 },
  "GUARAPUAVA-PR": { lat: -25.3953, lng: -51.4578 },
  "ARAPOTI-PR": { lat: -24.1550, lng: -49.8283 },
  "SANTA TEREZINHA DE ITAIPU-PR": { lat: -25.4383, lng: -54.4017 },
  "CORONEL VIVIDA-PR": { lat: -25.9800, lng: -52.5617 },
  "PARAISO DO NORTE-PR": { lat: -23.2783, lng: -52.6017 },
  "ITAPEJARA DOESTE-PR": { lat: -25.9617, lng: -52.8150 },
  "PALMEIRA-PR": { lat: -25.4283, lng: -50.0033 },
  "RIO NEGRO-PR": { lat: -26.1000, lng: -49.7983 },
  "CAFELANDIA-PR": { lat: -24.6167, lng: -53.3167 },
  "JACAREZINHO-PR": { lat: -23.1600, lng: -49.9700 },
  "REALEZA-PR": { lat: -25.7717, lng: -53.5267 },
  "SERTANOPOLIS-PR": { lat: -23.0600, lng: -51.0350 },
  "ALTO PARANA-PR": { lat: -23.1233, lng: -52.3183 },
  "BELA VISTA DO PARAISO-PR": { lat: -22.9917, lng: -51.1917 },
  "JAPURA-PR": { lat: -23.4700, lng: -52.5583 },
  "CAMBARA-PR": { lat: -23.0433, lng: -50.0333 },
  "SANTA FE-PR": { lat: -23.0417, lng: -51.8083 },
  "ITAPEJARA D OESTE-PR": { lat: -25.9617, lng: -52.8150 },
  "ITAPEJARA D'OESTE-PR": { lat: -25.9617, lng: -52.8150 },
  "JAGUAPITA-PR": { lat: -22.9050, lng: -51.5317 },
  "CORNELIO PROCOPIO-PR": { lat: -23.1806, lng: -50.6464 },
  "FAXINAL-PR": { lat: -24.0000, lng: -51.3200 },
  "MAMBORE-PR": { lat: -24.3167, lng: -52.5283 },
  "NOVA LONDRINA-PR": { lat: -22.7633, lng: -52.9867 },
  "TAPEJARA-PR": { lat: -23.7317, lng: -52.8733 },
  "ARARUNA-PR": { lat: -23.9317, lng: -52.4950 },
  "PALOTINA-PR": { lat: -24.2833, lng: -53.8400 },
  "SANTA HELENA-PR": { lat: -24.8583, lng: -54.3317 },
  "CASTRO-PR": { lat: -24.7917, lng: -50.0117 },
  "UNIAO DA VITORIA-PR": { lat: -26.2300, lng: -51.0867 },
  "TERRA RICA-PR": { lat: -22.7117, lng: -52.6183 },
  "PONTA GROSSA-PR": { lat: -25.0950, lng: -50.1619 },
};

// ─────────────────────────────────────────────────────────────
// Read raw store data from external file (16-column TSV)
// Columns: ID  CNPJ  NomeReduzido  Município  CEP  Bairro  Logradouro  Número  Complemento  Telefone  Email  Vagas  CoordRegional  CoordDistrital  ServidorIP  UF
// ─────────────────────────────────────────────────────────────
const rawPath = path.resolve(__dirname, "stores-raw.tsv");
if (!fs.existsSync(rawPath)) {
  console.error(`ERROR: Raw data file not found at ${rawPath}`);
  console.error("Please create it first.");
  process.exit(1);
}
const RAW_TSV = fs.readFileSync(rawPath, "utf-8");


// ─────────────────────────────────────────────────────────────
// Parse + generate
// ─────────────────────────────────────────────────────────────

function parseRawTSV(tsv) {
  const lines = tsv.trim().split("\n");
  return lines
    .slice(1)
    .map((line) => line.split("\t"))
    .filter((cols) => cols.length >= 16)
    .map((cols) => {
      const logradouro = (cols[6] || "").trim();
      const numero = (cols[7] || "").trim();
      const address = numero && numero !== "0"
        ? `${logradouro}, ${numero}`
        : logradouro;
      return {
        id: cols[0].trim(),
        name: (cols[2] || "").trim(),
        city: (cols[3] || "").trim(),
        zip: (cols[4] || "").replace(/\D/g, "").padStart(8, "0"),
        district: (cols[5] || "").trim(),
        address,
        state: (cols[15] || "").trim(),
      };
    });
}

function escapeStr(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function main() {
  const stores = parseRawTSV(RAW_TSV).filter((s) => !SKIP_IDS.has(s.id));

  const geocachePath = path.resolve(__dirname, "geocache.json");
  let geocache = {};
  if (fs.existsSync(geocachePath)) {
    geocache = JSON.parse(fs.readFileSync(geocachePath, "utf-8"));
    console.log(`Loaded geocache with ${Object.keys(geocache).length} entries`);
  }

  const cityCounters = {};
  let fromCache = 0;
  let fromFallback = 0;

  const entries = stores
    .map((s) => {
      const cached = geocache[s.id];
      if (cached && cached.lat !== null && cached.lng !== null) {
        fromCache++;
        return {
          code: s.id,
          name: s.name,
          address: s.address,
          district: s.district,
          zip: s.zip,
          city: s.city,
          state: s.state,
          lat: Number(cached.lat.toFixed(6)),
          lng: Number(cached.lng.toFixed(6)),
        };
      }

      const key = `${normalize(s.city)}-${normalize(s.state)}`;
      const base = CITY_COORDS[key];

      if (!base) {
        console.warn(`WARNING: No coordinates for "${s.city}" (${s.state}) [key: ${key}]`);
        return null;
      }

      if (!cityCounters[key]) cityCounters[key] = 0;
      const idx = cityCounters[key]++;

      let lat = base.lat;
      let lng = base.lng;

      if (idx > 0) {
        const angle = (idx * 137.508 * Math.PI) / 180;
        const r = 0.001 + idx * 0.0005;
        lat += r * Math.cos(angle);
        lng += r * Math.sin(angle);
      }

      fromFallback++;
      return {
        code: s.id,
        name: s.name,
        address: s.address,
        district: s.district,
        zip: s.zip,
        city: s.city,
        state: s.state,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
      };
    })
    .filter(Boolean);

  console.log(`Coords from geocache: ${fromCache}, from city-center fallback: ${fromFallback}`);

  const storeLines = entries.map(
    (s) =>
      `  { code: "${escapeStr(s.code)}", name: "${escapeStr(s.name)}", address: "${escapeStr(
        s.address
      )}", district: "${escapeStr(s.district)}", zip: "${escapeStr(s.zip)}", city: "${escapeStr(
        s.city
      )}", state: "${escapeStr(s.state)}", lat: ${s.lat}, lng: ${s.lng} }`
  );

  const lines = [];
  lines.push('import { formatCEP } from "../lib/geo";');
  lines.push("");
  lines.push("export type StoreRecord = {");
  lines.push("  id: number;");
  lines.push("  code: string;");
  lines.push("  name: string;");
  lines.push("  address: string;");
  lines.push("  district: string;");
  lines.push("  zip: string;");
  lines.push("  city: string;");
  lines.push("  state: string;");
  lines.push("  fullAddress: string;");
  lines.push("  lat?: number;");
  lines.push("  lng?: number;");
  lines.push("};");
  lines.push("");
  lines.push("type RawStore = {");
  lines.push("  code: string;");
  lines.push("  name: string;");
  lines.push("  address: string;");
  lines.push("  district: string;");
  lines.push("  zip: string;");
  lines.push("  city: string;");
  lines.push("  state: string;");
  lines.push("  lat: number;");
  lines.push("  lng: number;");
  lines.push("};");
  lines.push("");
  lines.push("const STORES_WITH_COORDS: RawStore[] = [");
  lines.push(storeLines.join(",\n") + ",");
  lines.push("];");
  lines.push("");
  lines.push("export function buildStores(): StoreRecord[] {");
  lines.push("  return STORES_WITH_COORDS.map((s) => ({");
  lines.push("    id: Number(s.code),");
  lines.push("    code: s.code,");
  lines.push("    name: s.name,");
  lines.push("    address: s.address,");
  lines.push("    district: s.district,");
  lines.push("    zip: formatCEP(s.zip),");
  lines.push("    city: s.city,");
  lines.push("    state: s.state,");
  lines.push(
    "    fullAddress: `${s.address}, ${s.district}, ${s.city}, ${s.state}, Brasil`,"
  );
  lines.push("    lat: s.lat,");
  lines.push("    lng: s.lng,");
  lines.push("  }));");
  lines.push("}");
  lines.push("");
  lines.push("export const ALL_STORES = buildStores();");
  lines.push("");

  const outPath = path.resolve(__dirname, "../src/data/stores.ts");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, lines.join("\n"), "utf-8");

  console.log(`Generated ${outPath}`);
  console.log(`Total stores: ${entries.length}`);
}

main();
