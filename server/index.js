/**
 * ============================================================
 * Label Print System — Servidor Principal
 * Porta: 10.5.5.203:3003
 * ============================================================
 * Responsabilidades:
 *   - Servir o frontend estático (public/index.html)
 *   - Registrar todas as rotas da API REST
 *   - Inicializar arquivos de dados (printers.json, templates.json)
 * ============================================================
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3003;
const HOST = '0.0.0.0'; // Escuta em todas as interfaces — acessível via 10.5.5.203

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());                          // Permite chamadas cross-origin do frontend
app.use(express.json());                  // Parseia body JSON
app.use(express.static(path.join(__dirname, '..', 'public'))); // Serve frontend

// ─── Inicialização do banco de dados local (JSON) ─────────────
const DATA_DIR      = path.join(__dirname, '..', 'data');
const PRINTERS_FILE = path.join(DATA_DIR, 'printers.json');
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json');

// Cria diretório de dados se não existir
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Cria arquivo de impressoras com dados iniciais se não existir
if (!fs.existsSync(PRINTERS_FILE)) {
  const defaultPrinters = [
    {
      id: 1,
      name: 'Zebra ZT230 — Farmácia',
      ip: '10.5.5.100',
      port: 9100,
      protocol: 'TCP/IP',
      language: 'ZPL',
      status: 'online',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(PRINTERS_FILE, JSON.stringify(defaultPrinters, null, 2));
}

// Cria arquivo de templates com modelo enteral padrão se não existir
if (!fs.existsSync(TEMPLATES_FILE)) {
  const defaultTemplates = [
    {
      id: 1,
      name: 'Dieta Enteral — Padrão',
      description: 'Etiqueta padrão para dietas enterais hospitalares',
      language: 'ZPL',
      uses: 0,
      fields: {
        paciente: 'NOME DO PACIENTE',
        leito: '000-X',
        dieta: 'NE HIPERCAL / NUTREN 2.0',
        volume: '250 mL',
        velocidade: '60 mL/h',
        viaAcesso: 'Sonda enteral',
        registro: '0000000000',
        controle: '00000000',
        manipulacao: '',
        validade: ''
      },
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(defaultTemplates, null, 2));
}

// ─── Rotas da API ─────────────────────────────────────────────
const printersRouter  = require('./routes/printers');   // GET/POST/PUT/DELETE /api/printers
const templatesRouter = require('./routes/templates');  // GET/POST/PUT/DELETE /api/templates
const printRouter     = require('./routes/print');      // POST /api/print
const scanRouter      = require('./routes/scan');       // POST /api/scan

app.use('/api/printers',  printersRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/print',     printRouter);
app.use('/api/scan',      scanRouter);

// ─── Rota catch-all: sempre retorna o frontend (SPA) ──────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── Inicia o servidor ─────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Label Print System — Servidor iniciado     ║');
  console.log(`║   http://${HOST}:${PORT}                     ║`);
  console.log(`║   http://10.5.5.203:${PORT}  (acesso externo) ║`);
  console.log('╚══════════════════════════════════════════════╝');
});
