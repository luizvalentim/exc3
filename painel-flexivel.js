const COLUNAS_COMPACTO = 4;
const COLUNAS_LARGO = 8;
const PONTO_DE_QUEBRA = 600;
const intervalo = (n) => Array.from({ length: n }, (_, i) => i + 1);

const regras = [
  ...intervalo(COLUNAS_LARGO).map((n) => `::slotted([span="${n}"]) { grid-column: span ${n}; }`),
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
