class CookNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <nav class="navbar navbar--hidden" id="navBar">
      <ul>
        <li class="navbar__item navbar__item--selected">
          <a href="http://localhost:3000/orders">
            <img
              src="../cook/components/nav/img/orders-icon.svg"
              alt="menu-icon"
              class="navbar__icon invert"
            />
            Pedidos
          </a>
        </li>
        <li class="navbar__item">
          <a href="http://localhost:3000/orders/history">
            <img
              src="../cook/components/nav/img/history-icon.svg"
              alt="orders-icon"
              class="navbar__icon invert"
            />
            Histórico
          </a>
        </li>
        <li class="navbar__item">
          <a href="#">
            <img
              src="../cook/components/nav/img/food-menu-icon.svg"
              alt="customers-icon"
              class="navbar__icon invert"
            />
            Pratos
          </a>
        </li>
      </ul>
    </nav>
    `;
  }
}

customElements.define("cook-nav", CookNav);
