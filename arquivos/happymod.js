// happymod.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const router = express.Router();

async function happymod(query) {
  try {
    const res = await axios.get("https://unduh.happymod.com/search.html?q=" + encodeURIComponent(query));
    const html = res.data;
    const $ = cheerio.load(html);
    const data = [];

    $("article.flex-item").each((index, element) => {
      const appName = $(element).find("h2.has-normal-font-size.no-margin.no-padding.truncate").text().trim();
      const appVersion = $(element).find("div.has-small-font-size.truncate").first().text().trim();
      const appUrl = $(element).find("a.app.clickable").attr("href");

      if (appName && appVersion && appUrl) {
        data.push({
          name: appName,
          version: appVersion,
          url: "https://unduh.happymod.com/" + appUrl,
        });
      }
    });

    return {
      status: true,
      data,
    };
  } catch (error) {
    console.error("Erro no happymod:", error.message);
    return {
      status: false,
      message: "Erro ao processar requisição.",
    };
  }
}

// rota express
router.get("/", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parâmetro 'q' é obrigatório.",
    });
  }

  const results = await happymod(q);
  if (!results.status) {
    return res.status(500).json(results);
  }

  res.json({
    status: true,
    result: results.data,
  });
});

module.exports = router;