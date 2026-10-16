/**
 * <app-bar heading="Título" leading-icon="menu" trailing-icons="search,favorite,more_vert" icon-variant="standard">
 *
 * - leading-icon:   ícone Material Symbols à esquerda
 * - heading:        título principal
 * - trailing-icons: lista variável de ícones à direita (separados por vírgula)
 *                   ou via JS: bar.trailingIcons = ['search', 'more_vert']
 * - icon-variant:   standard | filled | tonal | outlined  (tipo do md-*icon-button)
 *
 * Eventos: "leading-click" e "trailing-click" (detail: { icon, index })
 * Personalização: --app-bar-container, --app-bar-color
 */
const BUTTON_TAGS = {
  standard: 'md-icon-button',
  filled: 'md-filled-icon-button',
  tonal: 'md-filled-tonal-icon-button',
  outlined: 'md-outlined-icon-button',
};

class AppBar extends HTMLElement {
  static observedAttributes = ['heading', 'leading-icon', 'trailing-icons', 'icon-variant'];

  #trailing = null;

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
    const tag = BUTTON_TAGS[this.getAttribute('icon-variant')] || BUTTON_TAGS.standard;
    const button = (icon, cls = '') =>
      `<${tag} class="${cls}" data-icon="${icon}" aria-label="${icon}"><md-icon>${icon}</md-icon></${tag}>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        header {
          display: flex; align-items: center; gap: 8px;
          box-sizing: border-box; height: 64px; padding: 0 12px 0 8px;
          background: var(--app-bar-container, var(--md-sys-color-surface, #faf8ff));
          color: var(--app-bar-color, var(--md-sys-color-on-surface, #1a1b20));
          font-family: var(--md-ref-typeface-brand, Roboto, system-ui, sans-serif);
        }
        h1 {
          flex: 1; margin: 0 4px; min-width: 0;
          font-size: 22px; font-weight: 500; line-height: 28px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .trailing { display: flex; align-items: center; gap: 4px; }
      </style>
      <header>
        ${leading ? button(leading, 'leading') : ''}
        <h1>${heading}</h1>
        <div class="trailing">${this.trailingIcons.map(i => button(i)).join('')}</div>
      </header>`;

    const emit = (name, icon, index) => this.dispatchEvent(
      new CustomEvent(name, { detail: { icon, index }, bubbles: true, composed: true })
    );
    this.shadowRoot.querySelector('.leading')
      ?.addEventListener('click', () => emit('leading-click', leading, 0));
    this.shadowRoot.querySelectorAll('.trailing > *').forEach((btn, index) =>
      btn.addEventListener('click', () => emit('trailing-click', btn.dataset.icon, index))
    );
  }
}

customElements.define('app-bar', AppBar);
