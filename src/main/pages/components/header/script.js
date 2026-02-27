class AppHeader extends HTMLElement {
  connectedCallback() {
    const headerBtn = this.getAttribute("button");
    this.hasSearchBar = this.hasAttribute("search-bar");

    if (headerBtn === "menu") {
      this.buildHeaderWithMenuBtn();
    } else if (headerBtn === "advance") {
      this.buildHeaderWithAdvanceBtn();
    } else {
      this.buildHeaderWithoutBtn();
    }
  }

  buildHeaderWithMenuBtn() {
    this.innerHTML = `
      <header class="header">
        <div class="header__content">
          <h1 class="header__title">OrderFlow</h1>
          ${
            this.hasSearchBar
              ? `<div class="header__actions">
                  <input
                    name="search"
                    id="search"
                    type="text"
                    placeholder="Buscar..."
                    class="header__search-bar"
                  />
                  <button
                    class="header__menu-btn"
                    id="headerMenuBtn"
                    aria-label="Abrir/Fechar menu"
                  >
                    <img
                      src="/components/header/img/menu-icon.svg"
                      alt="ícone de menu"
                    />
                  </button>
                </div>`
              : `<button
                    class="header__menu-btn"
                    id="headerMenuBtn"
                    aria-label="Abrir/Fechar menu"
                  >
                    <img src="/components/header/img/menu-icon.svg" alt="ícone de menu" />
                  </button>`
          }
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

  buildHeaderWithAdvanceBtn() {
    this.innerHTML = `
      <header class="header">
        <div class="header__content">
          <h1 class="header__title">OrderFlow</h1>
          <button type="button" class="header__advance-btn" id="advanceBtn">
            avançar
          </button> 
        </div>
      </header>
    `;
  }

  buildHeaderWithoutBtn() {
    this.innerHTML = `
      <header class="header">
        <div class="header__content">
          <h1 class="header__title">OrderFlow</h1>
        </div>
      </header>
    `;
  }
}

customElements.define("app-header", AppHeader);
