/**
 * <app-bar> — Top app bar para uso com @material/web (MD3).
 *
 * Atributos:
 *   titulo           Texto principal
 *   icone-inicial    Nome do Material Symbol do ícone à esquerda (ex.: "menu", "arrow_back")
 *   centralizado     Centraliza o título (variante "center-aligned")
 *   fixa             Fica fixa no topo ao rolar (sticky)
 *   acoes            JSON com os ícones à direita (alternativa à propriedade .acoes)
 *
 * Propriedade:
 *   .acoes = [{ id: 'buscar', icone: 'search', rotulo: 'Buscar' }, ...]
 *
 * Eventos (bubbles + composed):
 *   icone-inicial-click
 *   acao       -> detail: { id, icone, indice }
 *
 * Slots opcionais: "titulo" (substitui o atributo) e "final" (conteúdo extra à direita).
 */
const tpl = document.createElement('template');
tpl.innerHTML = `
<style>
  :host {
    display: block;
    background: var(--app-bar-fundo, var(--md-sys-color-surface, #fef7ff));
    color: var(--app-bar-cor, var(--md-sys-color-on-surface, #1d1b20));
  }
  :host([fixa]) { position: sticky; top: 0; z-index: var(--app-bar-z, 10); }
  :host([hidden]) { display: none; }
  header {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 64px;
    padding: 8px 4px;
  }
  .inicio[hidden] { display: none; }
  h1 {
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 0 12px;
    font-family: var(--md-sys-typescale-title-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
    font-weight: var(--md-sys-typescale-title-large-weight, 400);
    line-height: var(--md-sys-typescale-title-large-line-height, 1.75rem);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  :host([centralizado]) h1 { text-align: center; }
  /* mantém o título realmente centralizado: reserva o mesmo espaço dos dois lados */
  :host([centralizado]) .inicio-wrap,
  :host([centralizado]) .final-wrap { flex: 0 0 var(--app-bar-lateral, 112px); }
  .inicio-wrap, .final-wrap { display: flex; align-items: center; }
  .final-wrap { justify-content: flex-end; }
</style>
<header part="barra">
  <div class="inicio-wrap">
    <md-icon-button class="inicio" part="icone-inicial" hidden>
      <md-icon></md-icon>
    </md-icon-button>
  </div>
  <h1 part="titulo"><slot name="titulo"></slot></h1>
  <div class="final-wrap" part="acoes">
    <span id="acoes" style="display:contents"></span>
    <slot name="final"></slot>
  </div>
</header>`;

class AppBar extends HTMLElement {
  static observedAttributes = ['titulo', 'icone-inicial', 'acoes'];
  #acoes = [];
  #raiz;

  constructor() {
    super();
    this.#raiz = this.attachShadow({ mode: 'open' });
    this.#raiz.appendChild(tpl.content.cloneNode(true));

    this.#raiz.querySelector('.inicio').addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('icone-inicial-click', { bubbles: true, composed: true })));

    this.#raiz.getElementById('acoes').addEventListener('click', (e) => {
      const btn = e.target.closest('md-icon-button');
      if (!btn) return;
      this.dispatchEvent(new CustomEvent('acao', {
        bubbles: true, composed: true,
        detail: { id: btn.dataset.id, icone: btn.dataset.icone, indice: Number(btn.dataset.indice) },
      }));
    });
  }

  connectedCallback() {
    this.#atualizarTitulo();
    this.#atualizarInicio();
    if (this.hasAttribute('acoes') && !this.#acoes.length) this.#lerAtributoAcoes();
  }

  attributeChangedCallback(nome) {
    if (nome === 'titulo') this.#atualizarTitulo();
    else if (nome === 'icone-inicial') this.#atualizarInicio();
    else if (nome === 'acoes') this.#lerAtributoAcoes();
  }

  get acoes() { return this.#acoes; }
  set acoes(lista) {
    this.#acoes = Array.isArray(lista) ? lista : [];
    this.#renderAcoes();
  }

  #lerAtributoAcoes() {
    try { this.acoes = JSON.parse(this.getAttribute('acoes') || '[]'); }
    catch { console.warn('<app-bar>: atributo "acoes" não é um JSON válido'); }
  }

  #atualizarTitulo() {
    // O slot "titulo" tem prioridade; sem ele, usa o atributo.
    const slot = this.#raiz.querySelector('slot[name="titulo"]');
    slot.textContent = this.getAttribute('titulo') ?? '';
  }

  #atualizarInicio() {
    const btn = this.#raiz.querySelector('.inicio');
    const icone = this.getAttribute('icone-inicial');
    btn.hidden = !icone;
    btn.querySelector('md-icon').textContent = icone ?? '';
    btn.ariaLabel = this.getAttribute('rotulo-icone-inicial') ?? icone ?? '';
  }

  #renderAcoes() {
    const alvo = this.#raiz.getElementById('acoes');
    alvo.replaceChildren(...this.#acoes.map((a, i) => {
      const btn = document.createElement('md-icon-button');
      btn.dataset.id = a.id ?? a.icone;
      btn.dataset.icone = a.icone;
      btn.dataset.indice = i;
      btn.ariaLabel = a.rotulo ?? a.icone;
      if (a.desabilitado) btn.disabled = true;
      const ic = document.createElement('md-icon');
      ic.textContent = a.icone;
      btn.append(ic);
      return btn;
    }));
  }
}

customElements.define('app-bar', AppBar);
