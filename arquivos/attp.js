const express = require("express");
const { createCanvas } = require("@napi-rs/canvas");
const path = require("path");
const fs = require("fs");

const router = express.Router();

async function generateBlink(text, color = "#ff00ff", bg = "#000000", size = 70) {
  const width = 512;
  const height = 512;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Preenche o fundo corretamente
  ctx.globalAlpha = 1;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Configura o texto
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Sans`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Desenha o texto
  ctx.fillText(text, width / 2, height / 2);

  return canvas.toBuffer("image/png");
}

router.get("/", async (req, res) => {
  try {
    const { text, color, bg, size } = req.query;
    if (!text) return res.status(400).json({ success: false, message: "Texto não fornecido." });

    const outputFile = path.join(__dirname, `${Date.now()}_attp.png`);
    const buffer = await generateBlink(
      text,
      color ? `#${color}` : "#ff00ff",
      bg ? `#${bg}` : "#000000",
      parseInt(size) || 70
    );

    fs.writeFileSync(outputFile, buffer);
    res.sendFile(outputFile, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(outputFile);
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Erro ao gerar ATTP." });
  }
});

module.exports = router;