/**
 * ============================================================
 * Rota: POST /api/print
 * Executa a impressão em uma impressora específica
 * ============================================================
 * Body esperado:
 * {
 *   printerId: number,        // ID da impressora cadastrada
 *   templateId?: number,      // (opcional) ID do template base
 *   fields: { ... },          // Campos preenchidos da etiqueta
 *   language: 'ZPL' | 'EPL',  // Linguagem de impressão
 *   copies: number            // Número de cópias
 * }
 * ============================================================
 */

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const router     = express.Router();
const tcpPrint   = require('../services/tcpPrint');
const usbPrint   = require('../services/usbPrint');
const zplGen     = require('../services/zplGen');
const eplGen     = require('../services/eplGen');

const PRINTERS_FILE  = path.join(__dirname, '..', '..', 'data', 'printers.json');
const TEMPLATES_FILE = path.join(__dirname, '..', '..', 'data', 'templates.json');

// Histórico em memória (pode ser persistido em JSON se necessário)
const printHistory = [];

// POST /api/print — executa a impressão
router.post('/', async (req, res) => {
  const { printerId, fields, language = 'ZPL', copies = 1 } = req.body;

  // 1. Busca a impressora cadastrada
  const printers = JSON.parse(fs.readFileSync(PRINTERS_FILE, 'utf8'));
  const printer  = printers.find(p => p.id == printerId);
  if (!printer) return res.status(404).json({ error: 'Impressora não encontrada' });

  // 2. Gera o comando de impressão na linguagem correta
  let command;
  if (language === 'EPL') {
    command = eplGen.generate(fields); // Gera EPL2
  } else {
    command = zplGen.generate(fields); // Gera ZPL padrão (default)
  }

  // 3. Repete o comando para o número de cópias
  const fullCommand = Array(copies).fill(command).join('\n');

  try {
    // 4. Escolhe o método de envio conforme protocolo da impressora
    if (printer.protocol === 'USB') {
      await usbPrint.send(printer.name, fullCommand);
    } else {
      // TCP/IP (padrão para impressoras de rede)
      await tcpPrint.send(printer.ip, printer.port, fullCommand);
    }

    // 5. Registra no histórico
    const record = {
      id: Date.now(),
      printerName: printer.name,
      printerIp:   printer.ip,
      language,
      copies,
      fields,
      printedAt: new Date().toISOString(),
      status: 'success'
    };
    printHistory.unshift(record);
    if (printHistory.length > 200) printHistory.pop(); // Mantém últimas 200

    res.json({ ok: true, message: 'Impressão enviada com sucesso', record });
  } catch (err) {
    console.error('[PRINT ERROR]', err.message);
    printHistory.unshift({
      id: Date.now(),
      printerName: printer.name,
      language,
      copies,
      fields,
      printedAt: new Date().toISOString(),
      status: 'error',
      error: err.message
    });
    res.status(500).json({ error: 'Falha na impressão: ' + err.message });
  }
});

// GET /api/print/history — retorna histórico de impressões
router.get('/history', (req, res) => {
  res.json(printHistory.slice(0, 100)); // Retorna últimas 100
});

module.exports = router;
