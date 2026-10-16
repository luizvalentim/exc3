/**
 * <app-bar heading="Título" leading-icon="menu" trailing-icons="search,favorite,more_vert">
 *
 * - leading-icon:   nome do ícone Material Symbols (lado esquerdo)
 * - heading:        título principal
 * - trailing-icons: lista de ícones separados por vírgula (lado direito)
 *   ou, via JS: bar.trailingIcons = ['search', 'more_vert']
 *
 * Eventos: "leading-click" e "trailing-click" (detail: { icon, index })
 * Usa <md-icon-button> e <md-icon> do Material Web (MD3).
 */
class AppBar extends HTMLElement {
  static observedAttributes = ['heading', 'leading-icon', 'trailing-icons'];

  #trailing = null; // lista definida por propriedade (tem prioridade sobre o atributo)

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.#render(); }

  attributeChangedCallback() { if (this.isConnected) this.#render(); }

  get trailingIcons() {
    if (this.#trailing) return this.#trailing;
    return (this.getAttribute('trailing-icons') || '')
      .split(',').map(s => s.trim()).filter(Boolean);
  }

  set trailingIcons(list) {
    this.#trailing = Array.isArray(list) ? list : null;
    if (this.isConnected) this.#render();
  }

  #render() {
    const leading = this.getAttribute('leading-icon');
    const heading = this.getAttribute('heading') || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        header {
          display: flex; align-items: center; gap: 4px;
          box-sizing: border-box; height: 64px; padding: 0 4px;
          background: var(--md-sys-color-surface, #fef7ff);
          color: var(--md-sys-color-on-surface, #1d1b20);
          font-family: var(--md-ref-typeface-brand, Roboto, system-ui, sans-serif);
        }
        h1 {
          flex: 1; margin: 0 8px; min-width: 0;
          font-size: 22px; font-weight: 400; line-height: 28px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .trailing { display: flex; align-items: center; }
      </style>
      <header>
        ${leading ? `<md-icon-button class="leading" aria-label="${leading}"><md-icon>${leading}</md-icon></md-icon-button>` : ''}
        <h1>${heading}</h1>
        <div class="trailing">
          ${this.trailingIcons.map(i =>
            `<md-icon-button data-icon="${i}" aria-label="${i}"><md-icon>${i}</md-icon></md-icon-button>`
          ).join('')}
        </div>
      </header>`;

    const emit = (name, icon, index) => this.dispatchEvent(
      new CustomEvent(name, { detail: { icon, index }, bubbles: true, composed: true })
    );

    this.shadowRoot.querySelector('.leading')
      ?.addEventListener('click', () => emit('leading-click', leading, 0));

    this.shadowRoot.querySelectorAll('.trailing md-icon-button').forEach((btn, index) =>
      btn.addEventListener('click', () => emit('trailing-click', btn.dataset.icon, index))
    );
  }
}

customElements.define('app-bar', AppBar);
