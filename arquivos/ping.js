const express = require('express');
const { createCanvas, loadImage } = require('canvas');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      perfil, // URL da imagem de perfil
      wallpaper, // URL do wallpaper
      nome = 'NEON',
      velocidade = '999',
      rotulo = 'VELOCIDADE',
      sistema = '',
    } = req.query;

    const W = 1365;
    const H = 618;
    const avatarRadius = 100;

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // Carregar imagens
    const wallpaperImg = wallpaper ? await loadImage(wallpaper) : null;
    const perfilImg = perfil ? await loadImage(perfil) : null;

    // Fundo com wallpaper ou gradiente
    if (wallpaperImg) {
      const r = Math.max(W / wallpaperImg.width, H / wallpaperImg.height);
      const iw = wallpaperImg.width * r;
      const ih = wallpaperImg.height * r;
      ctx.drawImage(wallpaperImg, (W - iw) / 2, (H - ih) / 2, iw, ih);
    } else {
      // Gradiente se não tiver wallpaper
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, '#0a1635');
      gradient.addColorStop(1, '#0a1129');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);
    }

    // Avatar com borda neon
    const centerX = W / 2;
    const avatarY = H * 0.25;

    if (perfilImg) {
      // Criar máscara circular para avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Redimensionar imagem de perfil
      const r = Math.max((avatarRadius * 2) / perfilImg.width, (avatarRadius * 2) / perfilImg.height);
      const iw = perfilImg.width * r;
      const ih = perfilImg.height * r;
      ctx.drawImage(perfilImg, centerX - iw / 2, avatarY - ih / 2, iw, ih);
      ctx.restore();

      // Bordas neon
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.7)';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      // Avatar sem imagem, círculo cinza
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();
    }

    // Texto Nome
    ctx.font = 'bold 80px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(nome.toUpperCase(), centerX, avatarY + avatarRadius + 40);

    // Texto Velocidade
    ctx.font = 'bold 70px Orbitron, sans-serif';
    ctx.fillStyle = '#00f7ff';
    ctx.fillText(velocidade, centerX, avatarY + avatarRadius + 120);

    // Rótulo inferior
    ctx.font = 'bold 40px Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rotulo.toUpperCase(), centerX, avatarY + avatarRadius + 200);

    // Sistema
    if (sistema.trim() !== '') {
      ctx.font = '600 28px Orbitron, sans-serif';
      ctx.fillStyle = '#b8e6ff';
      ctx.fillText(sistema.toUpperCase(), centerX, avatarY + avatarRadius + 250);
    }

    // Linha decorativa
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 200, avatarY + avatarRadius + 90);
    ctx.lineTo(centerX + 200, avatarY + avatarRadius + 90);
    ctx.stroke();

    // Resposta com PNG
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao gerar a imagem.');
  }
});

module.exports = router;