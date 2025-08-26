class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="header">
        <div class="header__content">
          <h1 class="header__title">OrderFlow</h1>
          <button
            class="header__menu-button"
            id="headerMenuBtn"
            aria-label="Abrir/Fechar menu"
          >
            <img src="/components/header/img/menu-icon.svg" alt="ícone de menu" />
          </button>
        </div>
      </header>
    `;

    const btn = this.querySelector("#headerMenuBtn");
    const navBar = document.querySelector("#navBar");
    btn.addEventListener("click", () => {
      document.body.style.overflow = navBar.classList.contains("navbar--hidden")
        ? "hidden"
        : "";
      navBar.classList.toggle("navbar--hidden");
    });
  }
}

customElements.define("app-header", AppHeader);
