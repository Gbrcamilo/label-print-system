/**
 * ============================================================
 * Serviço: tcpPrint.js
 * Envia comandos ZPL/EPL para impressoras via TCP/IP (Raw)
 * ============================================================
 * Protocolo:
 *   - Abre socket TCP na porta da impressora (padrão 9100)
 *   - Envia o comando como Buffer UTF-8
 *   - Fecha o socket após envio confirmado
 * Compatível com: Zebra, Argox, Elgin, Bematech, qualquer
 *                 impressora com servidor de impressão TCP/IP
 * ============================================================
 */

const net = require('net');

/**
 * Envia dados brutos para uma impressora via TCP/IP
 * @param {string} ip      - IP da impressora na rede
 * @param {number} port    - Porta TCP (padrão: 9100)
 * @param {string} data    - Comando ZPL ou EPL como string
 * @returns {Promise<void>}
 */
function send(ip, port, data) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    // Timeout de 10 segundos para conexão
    socket.setTimeout(10000);

    socket.connect(port, ip, () => {
      console.log(`[TCP PRINT] Conectado em ${ip}:${port} — enviando ${data.length} bytes`);
      socket.write(Buffer.from(data, 'utf8'), () => {
        socket.end(); // Fecha após envio
      });
    });

    socket.on('close', () => {
      console.log(`[TCP PRINT] Enviado com sucesso para ${ip}:${port}`);
      resolve();
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error(`Timeout ao conectar em ${ip}:${port}`));
    });

    socket.on('error', (err) => {
      reject(new Error(`Erro TCP em ${ip}:${port} — ${err.message}`));
    });
  });
}

module.exports = { send };
