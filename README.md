# 🏷️ Label Print System

Sistema de impressão de etiquetas hospitalares com suporte a impressoras **USB**, **TCP/IP**, **ZPL** e **EPL**.

## ✨ Funcionalidades

- ✅ Templates de etiquetas pré-salvos
- ✅ Impressão via rede (TCP/IP porta 9100)
- ✅ Impressão USB via Raw
- ✅ **Scan de rede** para detectar impressoras automaticamente
- ✅ Gerador de comandos ZPL e EPL
- ✅ Histórico de impressões
- ✅ Preview em tempo real da etiqueta
- ✅ Dark/Light mode

## 🚀 Como rodar

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Rodar em produção
npm start
```

Acesse em: **http://10.5.5.203:3003**

## 🖨️ Impressoras suportadas

| Tipo     | Protocolo | Porta padrão |
|----------|-----------|--------------|
| Zebra    | TCP/IP    | 9100         |
| Argox    | TCP/IP    | 9100         |
| Elgin    | TCP/IP    | 9100         |
| Qualquer | USB Raw   | —            |

## 📂 Estrutura

```
label-print-system/
├── server/
│   ├── index.js          # Servidor Express principal
│   ├── routes/
│   │   ├── printers.js   # Gerenciar impressoras
│   │   ├── templates.js  # CRUD de templates
│   │   ├── print.js      # Executar impressão
│   │   └── scan.js       # Scan de rede
│   └── services/
│       ├── tcpPrint.js   # Impressão TCP/IP
│       ├── usbPrint.js   # Impressão USB
│       ├── zplGen.js     # Gerador ZPL
│       ├── eplGen.js     # Gerador EPL
│       └── networkScan.js # Scanner de rede
├── public/
│   └── index.html        # Frontend SPA
├── data/
│   ├── printers.json     # Banco de impressoras
│   └── templates.json    # Banco de templates
└── package.json
```
