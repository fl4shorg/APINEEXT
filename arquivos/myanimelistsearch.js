const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const router = express.Router();

class Tradutor {
    static async traduzirTexto(texto) {
        if (!texto || texto === 'Sem descrição' || texto.length < 10) return texto;
        
        try {
            // Usando LibreTranslate - API open source e gratuita
            const response = await axios.post('https://translate.argosopentech.com/translate', {
                q: texto,
                source: 'en',
                target: 'pt'
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.data && response.data.translatedText) {
                return response.data.translatedText.trim();
            } else {
                throw new Error('Resposta inválida do tradutor');
            }

        } catch (error) {
            console.log('Erro no LibreTranslate, tentando fallback...', error.message);
            return await this.traduzirTextoFallback(texto);
        }
    }

    static async traduzirTextoFallback(texto) {
        try {
            // Fallback: Google Translate API
            const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
                params: {
                    client: 'gtx',
                    sl: 'en',
                    tl: 'pt',
                    dt: 't',
                    q: texto.substring(0, 1500) // Limite de caracteres
                },
                timeout: 10000
            });

            if (response.data && Array.isArray(response.data[0])) {
                const traducao = response.data[0].map(item => item[0]).join('');
                return traducao.trim() || texto;
            }
            return texto;

        } catch (fallbackError) {
            console.log('Fallback também falhou, retornando texto original');
            return texto;
        }
    }

    static traduzirTipo(tipo) {
        const tipos = {
            'TV': 'Série de TV',
            'Movie': 'Filme',
            'OVA': 'OVA',
            'ONA': 'ONA',
            'Special': 'Especial',
            'Manga': 'Mangá',
            'Novel': 'Light Novel',
            'One-shot': 'One-shot',
            'Doujin': 'Doujin',
            'Manhua': 'Manhua',
            'Manhwa': 'Manhwa',
            '-': 'Em andamento'
        };
        return tipos[tipo] || tipo;
    }

    static async traduzirListaDescricoes(lista) {
        if (!lista || lista.length === 0) return [];
        
        const listaTraduzida = [];
        
        // Processa em série para não sobrecarregar a API
        for (const item of lista) {
            try {
                const itemTraduzido = {
                    ...item,
                    tipo: this.traduzirTipo(item.tipo),
                    descricao: await this.traduzirTexto(item.descricao)
                };
                listaTraduzida.push(itemTraduzido);
                
                // Pequeno delay para não sobrecarregar a API
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                // Se der erro na tradução, mantém o item original
                listaTraduzida.push({
                    ...item,
                    tipo: this.traduzirTipo(item.tipo)
                });
            }
        }
        
        return listaTraduzida;
    }

    static async traduzirDescricaoPersonagem(descricao) {
        if (!descricao || descricao === 'Sem descrição') return descricao;
        return await this.traduzirTexto(descricao);
    }
}

class MAL {
    // --- Personagem ---
    async getFirstCharacter(query) {
        if (!query) throw new Error('É necessário informar a pesquisa');

        const { data } = await axios.get(`https://myanimelist.net/character.php?q=${encodeURIComponent(query)}&cat=character`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);

        const firstRow = $('table tbody tr').first();
        if (!firstRow.length) return null;

        const capa = firstRow.find('td .picSurround img').attr('data-src') || firstRow.find('td .picSurround img').attr('src');
        const nomeElemento = firstRow.find('td:nth-child(2) a');
        const nome = nomeElemento.text().trim();
        const url = nomeElemento.attr('href');

        if (!nome || !url) return null;

        const detalhes = await this.getCharacterDetails(url);

        return { nome, capa, url, ...detalhes };
    }

    async getCharacterDetails(url) {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });
            const $ = cheerio.load(data);

            const infoDiv = $('div.lh20').first();
            let idade = '', aniversario = '', altura = '', tipoSanguineo = '', afiliacao = '', posicao = '', frutaDoDiabo = '', japones = '', descricao = '';

            const linhas = [];
            infoDiv.contents().each((i, el) => {
                if (el.type === 'text') linhas.push($(el).text().trim());
                if (el.name === 'br') linhas.push('BREAK'); 
            });
            const textoInfo = linhas.join('\n').replace(/BREAK/g, '\n');

            idade = (textoInfo.match(/Age:\s*([^\n;]+)/i) || ['',''])[1].trim();
            aniversario = (textoInfo.match(/Birthdate:\s*([^\n;]+)/i) || ['',''])[1].trim();
            altura = (textoInfo.match(/Height:\s*([^\n;]+)/i) || ['',''])[1].trim();
            tipoSanguineo = (textoInfo.match(/Blood type:\s*([^\n;]+)/i) || ['',''])[1].trim();
            afiliacao = (textoInfo.match(/Affiliation:\s*([^\n;]+)/i) || ['',''])[1].trim();
            posicao = (textoInfo.match(/Position:\s*([^\n;]+)/i) || ['',''])[1].trim();

            const dfMatch = textoInfo.match(/Devil fruit:\s*(.*)/i);
            if(dfMatch) frutaDoDiabo = dfMatch[1].trim();
            infoDiv.find('div.spoiler_content').each((i, el) => {
                const text = $(el).text().trim();
                if(text) frutaDoDiabo += frutaDoDiabo ? `; ${text}` : text;
            });

            japones = $('span:contains("Japanese")').next().text().trim();

            const rawHtml = infoDiv.html() || '';
            const descSplit = rawHtml.split('<br><br>');
            if(descSplit[1]){
                descricao = descSplit[1].replace(/<[^>]*>/g, '').trim();
            }

            const anime = $('h2:contains("Animeography")').next('div').find('a[href*="/anime/"]').map((i, el) => ({
                titulo: $(el).text().trim(),
                url: $(el).attr('href')
            })).get();

            const manga = $('h2:contains("Mangaography")').next('div').find('a[href*="/manga/"]').map((i, el) => ({
                titulo: $(el).text().trim(),
                url: $(el).attr('href')
            })).get();

            // Traduzir descrição
            descricao = await Tradutor.traduzirDescricaoPersonagem(descricao || 'Sem descrição');

            return { idade, aniversario, altura, tipoSanguineo, afiliacao, posicao, frutaDoDiabo, japones, descricao, anime, manga };
        } catch (error) {
            console.log('Erro ao buscar detalhes do personagem:', error.message);
            return { 
                idade: '', 
                aniversario: '', 
                altura: '', 
                tipoSanguineo: '', 
                afiliacao: '', 
                posicao: '', 
                frutaDoDiabo: '', 
                japones: '', 
                descricao: 'Sem descrição', 
                anime: [], 
                manga: [] 
            };
        }
    }

    // --- Top Anime ---
    async topAnime() {
        try {
            const { data } = await axios.get('https://myanimelist.net/topanime.php', {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });
            const $ = cheerio.load(data);
            const lista = [];

            $('.ranking-list').each((_, el) => {
                const rank = $(el).find('.rank').text().trim();
                const titulo = $(el).find('.title h3 a').text().trim();
                const url = $(el).find('.title h3 a').attr('href');
                const score = $(el).find('.score span').text().trim();
                const capa = $(el).find('.title img').attr('data-src');

                lista.push({ rank, titulo, score, capa, url });
            });

            return lista;
        } catch (err) {
            throw new Error(err.message);
        }
    }

    // --- Pesquisa Anime ---
    async animeSearch(query) {
        if (!query) throw new Error('É necessário informar a pesquisa');
        const { data } = await axios.get(`https://myanimelist.net/anime.php?q=${encodeURIComponent(query)}&cat=anime`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);
        const lista = [];

        $('table tbody tr').each((_, el) => {
            const capa = $(el).find('td:nth-child(1) img').attr('data-src') || $(el).find('td:nth-child(1) img').attr('src');
            const titulo = $(el).find('td:nth-child(2) strong').text().trim();
            const url = $(el).find('td:nth-child(2) a').attr('href');
            const tipo = $(el).find('td:nth-child(3)').text().trim();
            const episodios = $(el).find('td:nth-child(4)').text().trim();
            const score = $(el).find('td:nth-child(5)').text().trim();
            
            // CORREÇÃO: Buscar descrição completa da página individual
            let descricao = $(el).find('td:nth-child(2) .pt4').text().trim();
            
            // Remove "read more." e limpa a descrição
            descricao = descricao.replace(/read more\.?/gi, '').trim();
            
            // Se a descrição estiver muito curta ou vazia
            if (!descricao || descricao.length < 50) {
                descricao = 'Sem descrição disponível';
            }

            if(titulo && url) lista.push({ titulo, descricao, tipo, episodios, score, capa, url });
        });

        // Traduzir descrições
        return await Tradutor.traduzirListaDescricoes(lista);
    }

    // --- Pesquisa Manga ---
    async mangaSearch(query) {
        if (!query) throw new Error('É necessário informar a pesquisa');
        const { data } = await axios.get(`https://myanimelist.net/manga.php?q=${encodeURIComponent(query)}&cat=manga`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);
        const lista = [];

        $('table tbody tr').each((_, el) => {
            const capa = $(el).find('td:nth-child(1) img').attr('data-src') || $(el).find('td:nth-child(1) img').attr('src');
            const titulo = $(el).find('td:nth-child(2) strong').text().trim();
            const url = $(el).find('td:nth-child(2) a').attr('href');
            const tipo = $(el).find('td:nth-child(3)').text().trim();
            const volumes = $(el).find('td:nth-child(4)').text().trim();
            const score = $(el).find('td:nth-child(5)').text().trim();
            
            // CORREÇÃO: Buscar descrição completa da página individual
            let descricao = $(el).find('td:nth-child(2) .pt4').text().trim();
            
            // Remove "read more." e limpa a descrição
            descricao = descricao.replace(/read more\.?/gi, '').trim();
            
            // Se a descrição estiver muito curta ou vazia
            if (!descricao || descricao.length < 50) {
                descricao = 'Sem descrição disponível';
            }

            if(titulo && url) lista.push({ titulo, descricao, tipo, volumes, score, capa, url });
        });

        // Traduzir descrições
        return await Tradutor.traduzirListaDescricoes(lista);
    }

    // --- NOVO MÉTODO: Buscar descrição completa da página individual ---
    async getDescricaoCompleta(url) {
        try {
            const { data } = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 15000
            });
            const $ = cheerio.load(data);
            
            // Tenta buscar a descrição completa de várias formas
            let descricao = '';
            
            // Método 1: Buscar pela div de sinopse
            descricao = $('p[itemprop="description"]').text().trim();
            
            // Método 2: Buscar pela class comum de descrição
            if (!descricao) {
                descricao = $('.synopsis').text().trim();
            }
            
            // Método 3: Buscar por qualquer parágrafo que contenha texto longo
            if (!descricao || descricao.length < 100) {
                $('p').each((i, el) => {
                    const texto = $(el).text().trim();
                    if (texto.length > 200 && !descricao) {
                        descricao = texto;
                    }
                });
            }
            
            // Limpa a descrição
            if (descricao) {
                descricao = descricao
                    .replace(/\[.*?\]/g, '') // Remove textos entre colchetes
                    .replace(/\s+/g, ' ') // Remove espaços extras
                    .substring(0, 500) // Limita o tamanho
                    .trim();
            }
            
            return descricao || 'Descrição não disponível';
            
        } catch (error) {
            console.log('Erro ao buscar descrição completa:', error.message);
            return 'Descrição não disponível';
        }
    }
}

const mal = new MAL();

// --- Função para formatar resposta padrão ---
function formatarResposta(dados, mensagem = null) {
    return {
        status: 200,
        desenvolvedor: "Neext",
        mensagem: mensagem || "Desenvolvido pela Neext - API de Animes e Mangás",
        dados: dados,
        timestamp: new Date().toISOString()
    };
}

function formatarErro(mensagem, status = 500) {
    return {
        status: status,
        desenvolvedor: "Neext",
        erro: mensagem,
        timestamp: new Date().toISOString()
    };
}

// --- Rotas ---
router.get('/personagem', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json(formatarErro('Parâmetro "q" é obrigatório', 400));
        }

        const personagem = await mal.getFirstCharacter(query);
        if (!personagem) {
            return res.status(404).json(formatarErro('Personagem não encontrado', 404));
        }

        res.json(formatarResposta(personagem, "Personagem encontrado com sucesso"));
    } catch (err) {
        res.status(500).json(formatarErro(err.message));
    }
});

router.get('/top/anime', async (req, res) => {
    try {
        const dados = await mal.topAnime();
        res.json(formatarResposta(dados, "Top animes recuperado com sucesso"));
    } catch (err) {
        res.status(500).json(formatarErro(err.message));
    }
});

router.get('/search/anime', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json(formatarErro('Parâmetro "q" é obrigatório', 400));
        }

        const dados = await mal.animeSearch(query);
        res.json(formatarResposta(dados, `Resultados da busca por: ${query}`));
    } catch (err) {
        res.status(500).json(formatarErro(err.message));
    }
});

router.get('/search/manga', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json(formatarErro('Parâmetro "q" é obrigatório', 400));
        }

        const dados = await mal.mangaSearch(query);
        res.json(formatarResposta(dados, `Resultados da busca por: ${query}`));
    } catch (err) {
        res.status(500).json(formatarErro(err.message));
    }
});

// Rota de informações da API
router.get('/info', (req, res) => {
    res.json({
        status: 200,
        desenvolvedor: "Neext",
        mensagem: "API de Animes e Mangás - Desenvolvido pela Neext",
        versao: "1.0.0",
        rotas: {
            personagem: "/personagem?q=nome",
            top_anime: "/top/anime",
            search_anime: "/search/anime?q=nome",
            search_manga: "/search/manga?q=nome"
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router;