const express = require('express');
const axios = require('axios');
const router = express.Router();

// Função de pesquisa
async function pesquisarPinterest(termo) {
  try {
    const response = await axios.get('https://api.platform.web.id/pinterest', {
      params: { q: termo }
    });

    if (response.data && response.data.status) {
      return response.data.results;
    } else {
      throw new Error('Erro na resposta da API Pinterest');
    }
  } catch (error) {
    console.error('Erro ao pesquisar Pinterest:', error.message);
    throw error;
  }
}

// Rota relativa, sempre "/" no router
router.get('/', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Parâmetro "q" é obrigatório' });

  try {
    const resultados = await pesquisarPinterest(q);
    res.status(200).json({
      statusCode: 200,
      message: 'API desenvolvida pela Neext',
      results: resultados
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;