const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

// ==== Caches de cada coleção ====
let cacheDexter = [];
let cacheElite = [];
let cacheMonkey = [];
let cacheCaracal = [];
let cacheDiario = [];
let cacheSuperman = [];
let cachePeaky = [];
let cacheUndertale = [];
let cacheKolobki = [];
let cacheHomelandee = [];
let cacheMashaurso = [];
let cacheGenshin = [];
let cacheZenitsu = [];
let cacheEuphoria = [];

// ==== Função genérica para buscar figurinhas ====
async function getStickers(url, nomeColecao) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
      timeout: 15000,
      responseType: "text",
    });

    const $ = cheerio.load(data);
    const stickers = [];

    // Pegar URLs direto do JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json.contentUrl) {
          stickers.push({
            name: json.name || nomeColecao,
            url: json.contentUrl.startsWith("http") ? json.contentUrl : `https:${json.contentUrl}`
          });
        }
      } catch (err) {
        // Ignorar JSON inválido
      }
    });

    return stickers;
  } catch (err) {
    console.error(`Erro ao buscar figurinhas ${nomeColecao}:`, err.message);
    return [];
  }
}

// ==== Função para pegar figurinha aleatória sem repetir ====
function getRandomSticker(stickers, cache) {
  if (!stickers.length) return null;
  const filtered = stickers.filter(s => !cache.some(c => c.url === s.url));
  const available = filtered.length ? filtered : (cache.length = 0, stickers);
  const random = available[Math.floor(Math.random() * available.length)];
  cache.push(random);
  return random;
}

// ==== Definição das coleções ====
const collections = [
  { name: "dexter", url: "https://stickers.wiki/pt/whatsapp/the_dexter/", cache: cacheDexter },
  { name: "elite", url: "https://stickers.wiki/pt/whatsapp/elitelunelish_by_demybot/", cache: cacheElite },
  { name: "monkey", url: "https://stickers.wiki/pt/whatsapp/moonkeyy/", cache: cacheMonkey },
  { name: "caracal", url: "https://stickers.wiki/pt/telegram/bigfloppasshole_by_fstikbot/", cache: cacheCaracal },
  { name: "diario", url: "https://stickers.wiki/pt/telegram/vampirediariesir/", cache: cacheDiario },
  { name: "superman", url: "https://stickers.wiki/pt/telegram/kal_el_superman_by_demybot/", cache: cacheSuperman },
  { name: "peaky-blinders", url: "https://stickers.wiki/pt/telegram/peaky_biinders/", cache: cachePeaky },
  { name: "undertale", url: "https://stickers.wiki/pt/telegram/undertalezoer/", cache: cacheUndertale },
  { name: "kolobki", url: "https://stickers.wiki/pt/telegram/kolobki_real/", cache: cacheKolobki },
  { name: "homelandee", url: "https://stickers.wiki/pt/telegram/homelander_by_stickdlbot/", cache: cacheHomelandee },
  { name: "mashaurso", url: "https://stickers.wiki/pt/telegram/mashapict2/", cache: cacheMashaurso },
  { name: "genshin", url: "https://stickers.wiki/pt/telegram/genshingayshitimpact/", cache: cacheGenshin },
  { name: "zenitsu", url: "https://stickers.wiki/pt/telegram/ikgfghpekh_by_demybot/", cache: cacheZenitsu },
  { name: "euphoria", url: "https://stickers.wiki/pt/telegram/euphoriamgs_by_fstikbot/", cache: cacheEuphoria },
];

// ==== Criação dinâmica das rotas ====
collections.forEach(col => {
  // Rota da figurinha aleatória (retorna JSON com URL)
  router.get(`/${col.name}`, async (req, res) => {
    const stickers = await getStickers(col.url, col.name);
    const random = getRandomSticker(stickers, col.cache);

    if (!random) {
      return res.status(404).json({ success: false, message: "Nenhuma figurinha encontrada." });
    }

    res.json({ success: true, sticker: random });
  });

  // Rota JSON com todas as figurinhas
  router.get(`/${col.name}/list`, async (req, res) => {
    const stickers = await getStickers(col.url, col.name);
    res.json({ success: true, count: stickers.length, stickers });
  });
});

module.exports = router;