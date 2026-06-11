/**
 * ============================================================
 * Serviço: zplGen.js
 * Gerador de comandos ZPL II para etiquetas de dieta enteral
 * ============================================================
 * ZPL II — Zebra Programming Language
 * Compatível com: Zebra ZT230, ZT410, GK420t, GX430t e similares
 *
 * Estrutura do label (103mm x 50mm, 203dpi):
 *   ^XA              — Início do label
 *   ^PW820           — Largura 103mm * 8 dots/mm ≈ 824
 *   ^LL400           — Comprimento da etiqueta
 *   ^FO x,y          — Field Origin (posição)
 *   ^A0N,h,w         — Fonte (h=altura, w=largura)
 *   ^FD texto ^FS    — Field Data
 *   ^BY w,r,h        — Barcode parameters
 *   ^BCN,h,Y,N,N     — Code128 barcode
 *   ^XZ              — Fim do label
 * ============================================================
 */

/**
 * Sanitiza texto para ZPL (remove caracteres problemáticos)
 * @param {string} val - Texto a sanitizar
 * @returns {string}
 */
function s(val) {
  if (!val) return '';
  return String(val).replace(/[\^~]/g, '').trim();
}

/**
 * Formata data brasileira: '2026-05-21T08:00' → '21/05/2026, 08:00'
 */
function fmtDate(val) {
  if (!val) return '';
  if (val.includes('T')) {
    const [date, time] = val.split('T');
    const [y, m, d]    = date.split('-');
    return `${d}/${m}/${y}, ${time}`;
  }
  return val;
}

/**
 * Gera comando ZPL completo para uma etiqueta de dieta enteral
 * @param {Object} fields - Campos da etiqueta
 * @returns {string} Comando ZPL pronto para enviar à impressora
 */
function generate(fields) {
  const {
    paciente    = '',
    leito       = '',
    dieta       = '',
    volume      = '',
    velocidade  = '',
    viaAcesso   = '',
    registro    = '',
    controle    = '',
    manipulacao = '',
    validade    = ''
  } = fields;

  // Código de barras: combina leito + registro + controle
  const barcode = `${s(leito)}-${s(registro)}-${s(controle)}`.replace(/[^A-Z0-9\-]/gi, '');

  return [
    '^XA',
    '^PW832',                              // Largura: 104mm @ 203dpi
    '^LL400',                              // Comprimento da etiqueta
    '^CI28',                               // Encoding UTF-8

    // ── Título ──────────────────────────────────────────
    '^FO20,15^A0N,22,22^FD ETIQUETA DE DIETA ENTERAL ^FS',
    '^FO20,40^GB790,2,2^FS',              // Linha separadora

    // ── Coluna esquerda ─────────────────────────────────
    `^FO20,55^A0N,18,18^FDPACIENTE:^FS`,
    `^FO160,55^A0N,18,20^FD${s(paciente)}^FS`,

    `^FO20,80^A0N,18,18^FDLEITO:^FS`,
    `^FO160,80^A0N,18,20^FD${s(leito)}^FS`,

    `^FO20,105^A0N,18,18^FDDIETA:^FS`,
    `^FO160,105^A0N,18,18^FD${s(dieta)}^FS`,

    `^FO20,130^A0N,18,18^FDVOLUME:^FS`,
    `^FO160,130^A0N,18,20^FD${s(volume)}^FS`,

    `^FO20,155^A0N,18,18^FDVIA DE ACESSO:^FS`,
    `^FO160,155^A0N,18,18^FD${s(viaAcesso)}^FS`,

    `^FO20,180^A0N,18,18^FDVALIDADE:^FS`,
    `^FO160,180^A0N,18,18^FD${fmtDate(validade)}^FS`,

    `^FO20,205^A0N,18,18^FDCONSERVACAO:^FS`,
    `^FO160,205^A0N,18,18^FD2 C a 8 C^FS`,

    // ── Coluna direita ───────────────────────────────────
    `^FO500,55^A0N,18,18^FDREGISTRO:^FS`,
    `^FO630,55^A0N,18,20^FD${s(registro)}^FS`,

    `^FO500,80^A0N,18,18^FDCONTROLE:^FS`,
    `^FO630,80^A0N,18,20^FD${s(controle)}^FS`,

    `^FO500,130^A0N,18,18^FDVELOCIDADE:^FS`,
    `^FO630,130^A0N,18,20^FD${s(velocidade)}^FS`,

    `^FO500,155^A0N,18,18^FDMANIPULACAO:^FS`,
    `^FO630,155^A0N,18,18^FD${fmtDate(manipulacao)}^FS`,

    // ── Linha separadora ─────────────────────────────────
    '^FO20,230^GB790,2,2^FS',

    // ── Código de barras Code128 ─────────────────────────
    `^FO20,240^BY2,3,60`,
    `^BCN,60,Y,N,N`,
    `^FD${barcode}^FS`,

    '^XZ'                                  // Fim do label
  ].join('\n');
}

module.exports = { generate };
