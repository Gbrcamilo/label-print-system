/**
 * ============================================================
 * Serviço: usbPrint.js
 * Envia comandos ZPL/EPL para impressoras USB via node-printer
 * ============================================================
 * Requisito: node-printer instalado (npm install node-printer)
 * No Windows: usa impressora configurada no Painel de Controle
 * No Linux:   usa CUPS com impressora Raw configurada
 * ============================================================
 */

/**
 * Envia dados brutos para uma impressora USB pelo nome
 * @param {string} printerName - Nome da impressora no SO
 * @param {string} data        - Comando ZPL ou EPL
 * @returns {Promise<void>}
 */
function send(printerName, data) {
  return new Promise((resolve, reject) => {
    try {
      // node-printer é um módulo nativo — pode falhar se não instalado
      const printer = require('node-printer');
      printer.printDirect({
        data:     data,
        printer:  printerName,     // Nome exato da impressora no SO
        type:     'RAW',           // Envia sem processamento (ZPL/EPL direto)
        success:  (jobId) => {
          console.log(`[USB PRINT] Job ${jobId} enviado para '${printerName}'`);
          resolve();
        },
        error: (err) => {
          reject(new Error(`Erro USB em '${printerName}': ${err}`));
        }
      });
    } catch (e) {
      // Fallback: se node-printer não estiver disponível, loga e rejeita
      reject(new Error('node-printer não instalado. Execute: npm install node-printer'));
    }
  });
}

module.exports = { send };
