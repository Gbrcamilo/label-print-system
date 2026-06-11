/**
 * ============================================================
 * Rota: POST /api/scan
 * Varre a rede local em busca de impressoras na porta 9100
 * ============================================================
 * Body esperado:
 * {
 *   subnet: '10.5.5',   // Prefixo da sub-rede (3 octetos)
 *   startHost: 1,        // IP inicial (ex: .1)
 *   endHost: 254,        // IP final   (ex: .254)
 *   port: 9100,          // Porta a testar (padrão impressoras ZPL/EPL)
 *   timeout: 800         // Timeout por host em ms
 * }
 * ============================================================
 */

const express     = require('express');
const router      = express.Router();
const networkScan = require('../services/networkScan');

// POST /api/scan — inicia o scan de rede
router.post('/', async (req, res) => {
  const {
    subnet    = '10.5.5',
    startHost = 1,
    endHost   = 254,
    port      = 9100,
    timeout   = 800
  } = req.body;

  // Validação básica
  if (endHost - startHost > 253) {
    return res.status(400).json({ error: 'Faixa de IP muito grande. Máximo 253 hosts.' });
  }

  console.log(`[SCAN] Iniciando scan: ${subnet}.${startHost} → ${subnet}.${endHost} porta ${port}`);

  try {
    const found = await networkScan.scan(subnet, startHost, endHost, port, timeout);
    console.log(`[SCAN] Concluído. ${found.length} impressoras encontradas.`);
    res.json({ found, total: found.length });
  } catch (err) {
    console.error('[SCAN ERROR]', err.message);
    res.status(500).json({ error: 'Erro no scan: ' + err.message });
  }
});

module.exports = router;
