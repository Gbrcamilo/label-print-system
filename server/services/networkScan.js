/**
 * ============================================================
 * Serviço: networkScan.js
 * Varre uma sub-rede TCP tentando conectar na porta informada
 * ============================================================
 * Estratégia:
 *   - Cria sockets TCP para cada IP em paralelo (lotes de 20)
 *   - Se a conexão for bem-sucedida → impressora encontrada
 *   - Timeout configurável por host
 *   - Retorna array com { ip, port, responseTime } dos hosts ativos
 * ============================================================
 */

const net = require('net');

/**
 * Testa se um único host está acessível na porta especificada
 * @param {string} ip       - Endereço IP alvo
 * @param {number} port     - Porta TCP (padrão: 9100)
 * @param {number} timeout  - Tempo máximo de espera em ms
 * @returns {Promise<{ip, port, responseTime}|null>}
 */
function testHost(ip, port, timeout) {
  return new Promise((resolve) => {
    const start  = Date.now();
    const socket = new net.Socket();

    // Configura timeout da conexão
    socket.setTimeout(timeout);

    socket.connect(port, ip, () => {
      // Conexão bem-sucedida → impressora encontrada
      const responseTime = Date.now() - start;
      socket.destroy();
      resolve({ ip, port, responseTime });
    });

    // Qualquer erro ou timeout → host não encontrado nesta porta
    socket.on('error',   () => { socket.destroy(); resolve(null); });
    socket.on('timeout', () => { socket.destroy(); resolve(null); });
  });
}

/**
 * Varre um range de IPs em paralelo (lotes de 20 hosts)
 * @param {string} subnet    - Prefixo da rede (ex: '10.5.5')
 * @param {number} startHost - Último octeto inicial (ex: 1)
 * @param {number} endHost   - Último octeto final   (ex: 254)
 * @param {number} port      - Porta a testar
 * @param {number} timeout   - Timeout por host em ms
 * @returns {Promise<Array>} - Array de hosts que responderam
 */
async function scan(subnet, startHost, endHost, port, timeout) {
  const BATCH_SIZE = 20; // Número de conexões paralelas por lote
  const found      = [];

  // Gera lista de todos os IPs a testar
  const ips = [];
  for (let i = startHost; i <= endHost; i++) {
    ips.push(`${subnet}.${i}`);
  }

  // Processa em lotes para não saturar a rede
  for (let i = 0; i < ips.length; i += BATCH_SIZE) {
    const batch   = ips.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(ip => testHost(ip, port, timeout)));
    results.forEach(r => { if (r) found.push(r); });
    // Log de progresso a cada lote
    console.log(`[SCAN] Progresso: ${Math.min(i + BATCH_SIZE, ips.length)}/${ips.length} IPs testados`);
  }

  return found;
}

module.exports = { scan, testHost };
