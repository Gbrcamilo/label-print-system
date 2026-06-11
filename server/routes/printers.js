/**
 * ============================================================
 * Rota: /api/printers
 * CRUD completo de impressoras cadastradas
 * ============================================================
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const FILE = path.join(__dirname, '..', '..', 'data', 'printers.json');

/** Lê o array de impressoras do arquivo JSON */
function readPrinters() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

/** Salva o array de impressoras no arquivo JSON */
function savePrinters(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// GET /api/printers — lista todas as impressoras
router.get('/', (req, res) => {
  res.json(readPrinters());
});

// POST /api/printers — cadastra nova impressora
router.post('/', (req, res) => {
  const printers = readPrinters();
  const newPrinter = {
    id: Date.now(),
    name:     req.body.name     || 'Impressora',
    ip:       req.body.ip       || '',
    port:     req.body.port     || 9100,
    protocol: req.body.protocol || 'TCP/IP',  // TCP/IP | USB
    language: req.body.language || 'ZPL',      // ZPL | EPL
    status:   'unknown',
    createdAt: new Date().toISOString()
  };
  printers.push(newPrinter);
  savePrinters(printers);
  res.status(201).json(newPrinter);
});

// PUT /api/printers/:id — atualiza impressora existente
router.put('/:id', (req, res) => {
  const printers = readPrinters();
  const idx = printers.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Impressora não encontrada' });
  printers[idx] = { ...printers[idx], ...req.body, id: printers[idx].id };
  savePrinters(printers);
  res.json(printers[idx]);
});

// DELETE /api/printers/:id — remove impressora
router.delete('/:id', (req, res) => {
  let printers = readPrinters();
  printers = printers.filter(p => p.id != req.params.id);
  savePrinters(printers);
  res.json({ ok: true });
});

module.exports = router;
