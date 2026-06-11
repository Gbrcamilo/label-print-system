/**
 * ============================================================
 * Serviço: eplGen.js
 * Gerador de comandos EPL2 para etiquetas de dieta enteral
 * ============================================================
 * EPL2 — Eltron Programming Language v2
 * Compatível com: Argox OS-214, Zebra LP2844, Bematech PP-10
 *
 * Estrutura EPL2:
 *   q <width>        — Largura da etiqueta em dots
 *   Q <height>,<gap> — Altura + gap entre etiquetas
 *   N                — Clear buffer
 *   A x,y,r,s,w,b,n,"texto" — Imprime texto
 *     x,y = posição; r=rotação(0); s=tamanho fonte(1-4)
 *     w,h = multiplicadores; b=bold(N); n=negativo(N)
 *   B x,y,r,t,w,h,n,"dado" — Código de barras
 *     t=tipo(1=Code128); w=largura barra; h=altura
 *   P 1              — Imprime 1 cópia
 * ============================================================
 */

function s(val) {
  if (!val) return '';
  // EPL2 não suporta alguns caracteres especiais
  return String(val).replace(/["/\\]/g, '').trim();
}

function fmtDate(val) {
  if (!val) return '';
  if (val.includes('T')) {
    const [date, time] = val.split('T');
    const [y, m, d]    = date.split('-');
    return `${d}/${m}/${y} ${time}`;
  }
  return val;
}

/**
 * Gera comando EPL2 completo para uma etiqueta de dieta enteral
 * @param {Object} fields - Campos da etiqueta
 * @returns {string} Comando EPL2 pronto para enviar à impressora
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

  const barcode = `${s(leito)}-${s(registro)}-${s(controle)}`.replace(/[^A-Z0-9\-]/gi, '');

  const lines = [
    'q832',            // Largura: 104mm @ 203dpi
    'Q400,24',         // Altura: 50mm; gap padrão 3mm
    'N',               // Limpa buffer

    // Título
    'A20,10,0,3,1,1,N,"ETIQUETA DE DIETA ENTERAL"',

    // Coluna esquerda
    `A20,45,0,2,1,1,N,"PACIENTE: ${s(paciente)}"`,
    `A20,65,0,2,1,1,N,"LEITO: ${s(leito)}"`,
    `A20,85,0,2,1,1,N,"DIETA: ${s(dieta)}"`,
    `A20,105,0,2,1,1,N,"VOLUME: ${s(volume)}"`,
    `A20,125,0,2,1,1,N,"VIA DE ACESSO: ${s(viaAcesso)}"`,
    `A20,145,0,2,1,1,N,"VALIDADE: ${fmtDate(validade)}"`,
    `A20,165,0,2,1,1,N,"CONSERVACAO: 2C a 8C"`,

    // Coluna direita
    `A450,45,0,2,1,1,N,"REGISTRO: ${s(registro)}"`,
    `A450,65,0,2,1,1,N,"CONTROLE: ${s(controle)}"`,
    `A450,105,0,2,1,1,N,"VELOCIDADE: ${s(velocidade)}"`,
    `A450,125,0,2,1,1,N,"MANIPULACAO: ${fmtDate(manipulacao)}"`,

    // Código de barras Code128
    `B20,185,0,1,2,5,60,B,"${barcode}"`,

    'P1'  // Imprime 1 cópia (cópias extras são controladas pelo controller)
  ];

  return lines.join('\r\n') + '\r\n';
}

module.exports = { generate };
