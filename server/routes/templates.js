/**
 * ============================================================
 * Rota: /api/templates
 * CRUD completo de templates de etiquetas
 * ============================================================
 */

const express = require('express');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const FILE = path.join(__dirname, '..', '..', 'data', 'templates.json');

function readTemplates()   { return JSON.parse(fs.readFileSync(FILE, 'utf8')); }
function saveTemplates(d)  { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }

// GET /api/templates — lista todos os templates
router.get('/', (req, res) => {
  res.json(readTemplates());
});

// POST /api/templates — cria novo template
router.post('/', (req, res) => {
  const templates = readTemplates();
  const tmpl = {
    id: Date.now(),
    name:        req.body.name        || 'Novo Template',
    description: req.body.description || '',
    language:    req.body.language    || 'ZPL',
    uses: 0,
    fields:      req.body.fields      || {},
    createdAt: new Date().toISOString()
  };
  templates.push(tmpl);
  saveTemplates(templates);
  res.status(201).json(tmpl);
});

// PUT /api/templates/:id — atualiza template
router.put('/:id', (req, res) => {
  const templates = readTemplates();
  const idx = templates.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Template não encontrado' });
  templates[idx] = { ...templates[idx], ...req.body, id: templates[idx].id };
  saveTemplates(templates);
  res.json(templates[idx]);
});

// DELETE /api/templates/:id — remove template
router.delete('/:id', (req, res) => {
  let templates = readTemplates();
  templates = templates.filter(t => t.id != req.params.id);
  saveTemplates(templates);
  res.json({ ok: true });
});

module.exports = router;
