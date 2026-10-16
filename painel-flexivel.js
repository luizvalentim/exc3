/**
 * <painel-flexivel> — grid responsivo para uso com @material/web (MD3).
 *
 * Largura < 600px  -> 4 colunas
 * Largura >= 600px -> 8 colunas
 *
 * A troca é feita por container query: considera a largura do próprio painel
 * (e não só da janela), então funciona também dentro de painéis laterais.
 *
 * Filhos diretos podem declarar:
 *   span="1..8"           colunas ocupadas no layout de 8 colunas
 *                         (no layout de 4, valores acima de 4 ocupam a linha toda)
 *   span-compacto="1..4"  colunas ocupadas no layout de 4 colunas (sobrescreve span)
 *
 * Variáveis CSS: --painel-gap, --painel-margem, --painel-gap-largo, --painel-margem-larga
 */
const COLUNAS_COMPACTO = 4;
const COLUNAS_LARGO = 8;
const PONTO_DE_QUEBRA = 600; // px — limite entre "compact" e "medium" do MD3

const intervalo = (n) => Array.from({ length: n }, (_, i) => i + 1);

const regras = [
  // 8 colunas (e base)
  ...intervalo(COLUNAS_LARGO).map((n) => `::slotted([span="${n}"]) { grid-column: span ${n}; }`),
  // 4 colunas: spans maiores que 4 viram linha inteira; span-compacto sobrescreve
  `@container (max-width: ${PONTO_DE_QUEBRA - 0.02}px) {
    ${intervalo(COLUNAS_LARGO).filter((n) => n > COLUNAS_COMPACTO)
      .map((n) => `::slotted([span="${n}"]) { grid-column: 1 / -1; }`).join('\n    ')}
    ${intervalo(COLUNAS_COMPACTO).map((n) => `::slotted([span-compacto="${n}"]) { grid-column: span ${n}; }`).join('\n    ')}
  }`,
].join('\n');

const tpl = document.createElement('template');
tpl.innerHTML = `
<style>
  :host { display: block; container-type: inline-size; }
  :host([hidden]) { display: none; }
  .grade {
    display: grid;
    grid-template-columns: repeat(${COLUNAS_COMPACTO}, minmax(0, 1fr));
    gap: var(--painel-gap, 16px);
    padding: var(--painel-margem, 16px);
  }
  @container (min-width: ${PONTO_DE_QUEBRA}px) {
    .grade {
      grid-template-columns: repeat(${COLUNAS_LARGO}, minmax(0, 1fr));
      gap: var(--painel-gap-largo, 24px);
      padding: var(--painel-margem-larga, 24px);
    }
  }
  ::slotted(*) { min-width: 0; }
  ${regras}
</style>
<div class="grade" part="grade"><slot></slot></div>`;

class PainelFlexivel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
  }
}

customElements.define('painel-flexivel', PainelFlexivel);
