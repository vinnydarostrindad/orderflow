class WaiterNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <nav class="navbar navbar--hidden" id="navBar">
      <ul>
        <li class="navbar__item navbar__item--selected">
          <a href="#">
            <img
              src="/waiter/components/nav/img/food-menu-icon.svg"
              alt="menu-icon"
              class="navbar__icon invert"
            />
            Cardápios
          </a>
        </li>
        <li class="navbar__item">
          <a href="#">
            <img
              src="/waiter/components/nav/img/orders-icon.svg"
              alt="orders-icon"
              class="navbar__icon invert"
            />
            Pedidos
          </a>
        </li>
        <li class="navbar__item">
          <a href="#">
            <img
              src="/waiter/components/nav/img/customers-icon.svg"
              alt="customers-icon"
              class="navbar__icon invert"
            />
            Clientes
          </a>
        </li>
        <li class="navbar__item">
          <a href="#">
            <img
              src="/waiter/components/nav/img/config-icon.svg"
              alt="config-icon"
              class="navbar__icon invert"
            />
            Configuração
          </a>
        </li>
      </ul>
    </nav>
    `;
  }
}

customElements.define("waiter-nav", WaiterNav);
