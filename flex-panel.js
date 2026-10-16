/**
 * <flex-panel> : grid responsivo.
 *   - telas menores (< 600px): 4 colunas
 *   - telas mais largas (>= 600px): 8 colunas
 *
 * Os filhos ocupam 1 coluna por padrão. Use o atributo span="1..8"
 * para ocupar mais colunas (em telas menores, o máximo é 4).
 *
 *   <flex-panel>
 *     <md-filled-card span="8">...</md-filled-card>
 *     <md-filled-card span="2">...</md-filled-card>
 *   </flex-panel>
 *
 * Personalização: --panel-gap e --panel-margin (CSS custom properties).
 */
const BREAKPOINT = 600;
const MAX_COLS = 8;

const spanRules = (max) =>
  Array.from({ length: MAX_COLS }, (_, i) => i + 1)
    .map(n => `::slotted([span="${n}"]) { grid-column: span ${Math.min(n, max)}; }`)
    .join('\n');

class FlexPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: var(--panel-gap, 16px);
          margin: var(--panel-margin, 16px);
        }
        ${spanRules(4)}

        @media (min-width: ${BREAKPOINT}px) {
          :host {
            grid-template-columns: repeat(8, minmax(0, 1fr));
            gap: var(--panel-gap, 24px);
            margin: var(--panel-margin, 24px);
          }
          ${spanRules(8)}
        }
      </style>
      <slot></slot>`;
  }
}

customElements.define('flex-panel', FlexPanel);
