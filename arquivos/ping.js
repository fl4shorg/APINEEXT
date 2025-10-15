const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

const router = express.Router();

// Registrar fonte Orbitron (coloque o arquivo Orbitron-Regular.ttf na pasta fonts)
registerFont(path.join(__dirname, '../fonts/Orbitron-Regular.ttf'), { family: 'Orbitron' });
registerFont(path.join(__dirname, '../fonts/Orbitron-Bold.ttf'), { family: 'Orbitron', weight: 'bold' });
registerFont(path.join(__dirname, '../fonts/Orbitron-Black.ttf'), { family: 'Orbitron', weight: '900' });

router.get('/', async (req, res) => {
  try {
    const {
      perfil,
      wallpaper,
      nome = 'NEON',
      velocidade = '999',
      rotulo = 'VELOCIDADE',
      sistema = '',
      datetime = '',
    } = req.query;

    const W = 1365;
    const H = 618;
    const avatarRadius = 100;

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');

    // Função auxiliar para desenhar round rect
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      this.beginPath();
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
      return this;
    };

    // Carregar imagens
    const wallpaperImg = wallpaper ? await loadImage(wallpaper).catch(() => null) : null;
    const perfilImg = perfil ? await loadImage(perfil).catch(() => null) : null;

    // Fundo
    if (wallpaperImg) {
      const r = Math.max(W / wallpaperImg.width, H / wallpaperImg.height);
      const iw = wallpaperImg.width * r;
      const ih = wallpaperImg.height * r;
      ctx.drawImage(wallpaperImg, (W - iw) / 2, (H - ih) / 2, iw, ih);
    } else {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0a1635');
      g.addColorStop(1, '#0a1129');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H);
      g2.addColorStop(0, 'rgba(0, 247, 255, 0.05)');
      g2.addColorStop(1, 'rgba(180, 0, 255, 0.05)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    }

    // Data e hora na parte superior esquerda
    const now = new Date();
    const [dateText, timeText] = datetime
      ? datetime.split(' - ')
      : [now.toLocaleDateString('pt-BR'), now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })];

    ctx.save();
    ctx.translate(30, 25);

    // Calendário
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f7ff';
    ctx.fillStyle = '#00f7ff';
    ctx.roundRect(-2, -2, 24, 24, 4).stroke();
    ctx.roundRect(-2, -2, 24, 8, 4).fill();

    ctx.beginPath();
    ctx.moveTo(5, 8);
    ctx.lineTo(5, 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(10, 8);
    ctx.lineTo(10, 22);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(15, 8);
    ctx.lineTo(15, 22);
    ctx.stroke();

    ctx.restore();

    // Texto data
    ctx.font = '600 18px Orbitron';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(dateText, 65, 25);

    // Texto hora
    ctx.textAlign = 'right';
    ctx.fillText(timeText, W - 30, 25);

    // Relógio ao lado da hora
    const timeWidth = ctx.measureText(timeText).width;
    ctx.save();
    ctx.translate(W - 30 - timeWidth - 20, 37);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f7ff';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -7);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 0);
    ctx.stroke();

    ctx.restore();

    ctx.textAlign = 'left';

    // Avatar
    ctx.save();
    const centerX = W / 2;
    const avatarY = H * 0.25;

    if (perfilImg) {
      // Borda sombra
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();

      // Clip círculo para avatar
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();

      // Ajusta tamanho avatar imagem
      const r = Math.max((avatarRadius * 2) / perfilImg.width, (avatarRadius * 2) / perfilImg.height);
      const iw = perfilImg.width * r;
      const ih = perfilImg.height * r;
      ctx.drawImage(perfilImg, centerX - iw / 2, avatarY - ih / 2, iw, ih);

      ctx.restore();

      // Contorno branco
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.stroke();

      // Contorno neon
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius + 4, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0, 247, 255, 0.7)';
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(centerX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      ctx.restore();
    }

    // Nome
    ctx.font = '900 80px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Sombra neon para o nome
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(nome.toUpperCase(), centerX, avatarY + avatarRadius + 20);
    ctx.shadowBlur = 0;

    // Velocidade
    ctx.font = '900 70px Orbitron';
    ctx.fillStyle = '#00f7ff';
    ctx.shadowColor = '#00f7ff';
    ctx.shadowBlur = 15;
    ctx.fillText(velocidade.toString(), centerX, avatarY + avatarRadius + 120);
    ctx.shadowBlur = 0;

    // Linha horizontal decorativa
    ctx.beginPath();
    const lineY = avatarY + avatarRadius + 90;
    ctx.moveTo(centerX - 200, lineY);
    ctx.lineTo(centerX + 200, lineY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.3)';
    ctx.stroke();

    // Rótulo inferior
    ctx.font = '700 40px Orbitron';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(rotulo.toUpperCase(), centerX, avatarY + avatarRadius + 200);

    // Sistema
    if (sistema.trim()) {
      ctx.font = '600 28px Orbitron';
      ctx.fillStyle = '#b8e6ff';
      ctx.shadowColor = '#00f7ff';
      ctx.shadowBlur = 8;
      ctx.fillText(sistema.toUpperCase(), centerX, avatarY + avatarRadius + 250);
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    // Retornar imagem PNG
    res.setHeader('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res);

  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao gerar a imagem');
  }
});

module.exports = router;