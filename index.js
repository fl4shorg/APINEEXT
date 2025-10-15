const express = require('express');
const axios = require('axios');
const cors = require("cors");
const cheerio = require("cheerio");
const app = express();
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const path = require('path');
const port = 3000;
const { searchRouter, downloadRouter } = require('./arquivos/xvideos');
const loliRouter = require('./arquivos/loli');
const yandereRouter = require('./arquivos/yande.re');
const { banner, banner2, colors, statusColor } = require('./assets/function');
const twitter = require("./arquivos/twitter");
const ffStalkRouter = require("./arquivos/ffstalk");
const alldownload = require('./arquivos/alldownload');
// usar a rota
const kwai = require('./arquivos/kwai');

const mediafire = require("./arquivos/mediafire");

// Usar rotas


const youtube2Routes = require('./arquivos/YouTube2');



const youtubeStalk = require("./arquivos/youtube-stalk");

const youtubeRoutes = require('./arquivos/YouTube');
const memesRouter = require("./arquivos/memes");
const tiktokRouter = require('./arquivos/tiktok.js');
const wallpapersearchRouter = require('./arquivos/wallpapersearch');
const wallpapersearch2Router = require('./arquivos/wallpapersearch2');
const pornhub = require("./arquivos/pornhub");
const stickerly = require('./arquivos/stickerly');
const figurinhasRouter = require('./arquivos/figurinhas');
const tiktok2Router = require(
  
  './arquivos/tiktok2');
const snackRouter = require("./arquivos/snackvideo");
const frasesanime = require("./arquivos/frasesanime");
const pinterestRouter = require('./arquivos/Pinterest');
const hentaiRouter = require("./arquivos/hentai");
const happymod = require("./arquivos/happymod");
const instagramRoute = require("./arquivos/Instagram2");

// Usar a rota

const threadsRouter = require('./arquivos/threads');
const bratRouter = require('./arquivos/brat');
const facebookRouter = require('./arquivos/facebook');
const wallpapergenshinRouter = require('./arquivos/wallpapergenshin');
const safebooruRouter = require('./arquivos/safebooru');
const eshuushuuRouter = require('./arquivos/e-shuushuu');
const photopornoRouter = require('./arquivos/photoporno');
const wallpaperMinecraftRouter = require('./arquivos/wallpaperminecraft');
const noticiasRouter = require("./arquivos/noticias");
const wallpaperAnime = require('./arquivos/wallpaperanime');
const spotifyRouter = require('./arquivos/Spotify');
const freepikRoutes = require('./arquivos/freepik');
IGStoryDownloader = require('./arquivos/igstory');
const instagramRouter = require('./arquivos/Instagram1.js');
const konachanRouter = require('./arquivos/konachan');
const igStalkHandler = require('./arquivos/igstalk');
const attp = require("./arquivos/attp");
const xnxx = require("./arquivos/xnxx");
const catboxRouter = require('./upload/catbox');
const sfmcompile = require("./arquivos/sfmcompile");
const lyricssearch = require("./arquivos/lyricssearch");
const danbooruRouter = require("./arquivos/danbooru")
const espnRouter = require('./arquivos/espn');
const nexoRouter = require('./arquivos/nexojornal');
const redditRouter = require('./arquivos/reddit');
const instagram2 = require("./arquivos/InstagramStalk");
// Usa as rotas do ephoto360 em "/ephoto360"
const pinterestVideoRouter = require('./arquivos/PinterestVideo');
const mp3pm = require("./arquivos/mp3pm");
const tumblrRoutes = require('./arquivos/tumblr');

const textproRouter = require('./arquivos/textpro');
const tiktokSearch = require("./arquivos/tiktokSearch");
const stickerwiki = require("./figurinhas/stickerwiki");
// registra a rota /textpro
const metadinha = require("./arquivos/metadinha");
const savePinRouter = require('./arquivos/savepin');
const nsfwhub = require("./arquivos/nsfwhub");
const pensadorsearch = require("./arquivos/pensadorsearch");

const genshin = require("./arquivos/genshinimpact");
const ephotoRoute = require('./arquivos/ephoto360');
const soundCloudRouter = require('./arquivos/SoundCloud');
const youtube2 = require("./arquivos/YouTube2"); //

// usar rota



app.use(cors());
app.use(express.json());
app.use("/api/twitter", twitter);
app.use("/stickerwiki", stickerwiki);
app.use("/sfmcompile", sfmcompile);
app.use("/attp", attp);
app.use("/nsfwhub", nsfwhub);
app.use("/bluesticker", require("./figurinhas/bluesticker"));
app.use('/download', kwai);      
app.use("/metadinha", metadinha);
app.use('/textpro', textproRouter);
app.use("/download/pornhub", pornhub);
//Categoria offline
app.use("/api/tiktok", tiktokSearch);
// Categoria Upload //
app.use('/upload/catbox', catboxRouter);
app.use('/api', tumblrRoutes);
app.use('/ephoto', ephotoRoute);
app.use('/api', redditRouter);
// Categoria notícias //

app.use("/search/happymod", happymod);
app.use("/jornal/noticias", noticiasRouter);
app.use('/jornal/espn', espnRouter);
app.use('/nexojornal', nexoRouter);
// Categoria Wallpaper \\
app.use('/wallpaper/wallpaperminecraft', wallpaperMinecraftRouter);
app.use('/wallpaper/wallpapergenshin', wallpapergenshinRouter);
app.use('/api', alldownload);
app.use("/", ffStalkRouter);
app.use("/download/instagram2", instagramRoute);
app.use("/genshin", genshin);
// Categoria Pesquisa //
app.use('/search/wallpapersearch', wallpapersearchRouter);
app.use('/search/wallpapersearch2', wallpapersearch2Router);
app.use('/stickerly', stickerly);
app.use('/freepik', freepikRoutes);
app.use('/search/xvideos', searchRouter); 
app.use("/stalk/youtube", youtubeStalk);
app.use('/search/xvideos', searchRouter);



app.use("/mp3pm", mp3pm);
const malRoutes = require('./arquivos/myanimelistsearch');
app.use("/danbooru", danbooruRouter);

const anilistRoute = require('./arquivos/anilist');
app.use("/mediafire", mediafire);

app.use('/anilist', anilistRoute);

app.use("/youtube2", youtube2);

app.use("/api/insta-stalk", instagram2);

app.use('/Myanimelist', malRoutes);

const wikiRoutes = require('./arquivos/wiki');
app.use('/search', wikiRoutes); // agora /api/wiki?q=Anime


const playstoreRoutes = require('./arquivos/playstore');
app.use('/playstore', playstoreRoutes);

app.use('/savepin', savePinRouter);


app.use('/search/pinterest', pinterestRouter);
app.use("/search/snack", snackRouter);

app.use("/search/xnxx", xnxx);
app.use("/lyrics", lyricssearch);
// Categoria +18

app.use('/18/photoporno', photopornoRouter);

// Categoria Download

app.use('/download/xvideos', downloadRouter); 


// Usando o router
app.use('/youtube', youtubeRoutes);
app.use('/download/instagram', instagramRouter);
app.use('/download/tiktok', tiktokRouter);
app.use('/download/tiktok2', tiktok2Router);
app.use('/download/spotify', spotifyRouter);
app.use('/facebook', facebookRouter);
app.use('/download/threads', threadsRouter);

app.use('/download/soundcloud', soundCloudRouter);


app.use('/search/pinterestvideo', pinterestVideoRouter);

// frases //
app.use("/frases/frasesanime", frasesanime);
app.use("/frases/pensador", pensadorsearch);

app.use("/frases/frasesanime", frasesanime);
// Categoria Random / Anime

app.use('/random/wallpaperanime', wallpaperAnime);
app.use("/random/memes", memesRouter);
app.use("/random/hentai", hentaiRouter);
app.use('/random/loli', loliRouter);
app.use('/yandere', yandereRouter);
app.use('/random/safebooru', safebooruRouter);
app.use('/random/e-shuushuu', eshuushuuRouter);
app.use('/konachan', konachanRouter);



// Categoria figurinhas \\

app.use('/sticker/brat', bratRouter);
app.use('/sticker/figurinhas', figurinhasRouter);


// Status da API (ping real)
app.get("/status", async (req, res) => {
  const start = Date.now();

  try {
    await axios.get(`http://localhost:${port}/`); // request de teste
    const ping = Date.now() - start;

    res.json({
      status: "online",
      ping, // número
      uptime: Math.floor(process.uptime()) + "s",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: "offline",
      error: err.message
    });
  }
});

// Mostra banners (já exibidos no 

// Middleware para log das rotas usando a função de cores do function.js
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(
            `${colors.MAGENTA}${req.method}${colors.NOCOLOR} ${colors.CYAN}${req.url}${colors.NOCOLOR} - Status: ${statusColor(res.statusCode)}${res.statusCode}${colors.NOCOLOR}`
        );
    });
    next();
});

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Servir arquivos estáticos
app.use(express.static(path.resolve(__dirname, 'public')));

// Middleware 404 (sempre por último)
app.use((req, res) => {
    res.status(404).sendFile(path.resolve(__dirname, 'public', '404.html'));
});


app.listen(port, () => {
    console.log(`╭━━━⪩ 「API ON:」 ⪨━━━━﹁`);
    console.log(`│ ⎙ ${colors.CYAN}www.api.neext.online${colors.NOCOLOR}`);
    console.log(`│ ⎙ ${colors.CYAN}https://localhost:${port}${colors.NOCOLOR}`);
    console.log(`╰━━━━━━━─「𖤐」─━━━━━━━━━━」`);
});