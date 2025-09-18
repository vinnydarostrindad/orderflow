class ManagerNav extends HTMLElement {
  connectedCallback() {
    const actualPage = this.getAttribute("page");

    this.innerHTML = `
      <nav class="navbar navbar--hidden" id="navBar">
        <ul>
          <li class="navbar__item" data-page="dashboard">
            <a href="/dashboard">
              <img src="/manager/dashboard/img/dashboard-icon.svg" alt="dashboard-icon" class="navbar__icon invert"/>
              Dashboard
            </a>
          </li>
          <li class="navbar__item" data-page="employees">
            <a href="/employees">
              <img src="/manager/dashboard/img/employees-icon.svg" alt="employees-icon" class="navbar__icon invert"/>
              Funcionários
            </a>
          </li>
          <li class="navbar__item" data-page="menu">
            <a href="/menu">
              <img src="/manager/dashboard/img/food-menu-icon.svg" alt="menu-icon" class="navbar__icon invert"/>
              Cardápio
            </a>
          </li>
          <li class="navbar__item" data-page="sales">
            <a href="/sales">
              <img src="/manager/dashboard/img/sales-icon.svg" alt="sales-icon" class="navbar__icon invert"/>
              Vendas
            </a>
          </li>
          <li class="navbar__item" data-page="stock">
            <a href="/stock">
              <img src="/manager/dashboard/img/stock-icon.svg" alt="stock-icon" class="navbar__icon invert"/>
              Estoque
            </a>
          </li>
          <li class="navbar__item" data-page="orders">
            <a href="/orders">
              <img src="/manager/dashboard/img/orders-icon.svg" alt="orders-icon" class="navbar__icon invert"/>
              Pedidos
            </a>
          </li>
          <li class="navbar__item" data-page="config">
            <a href="/config">
              <img src="/manager/dashboard/img/config-icon.svg" alt="config-icon" class="navbar__icon invert"/>
              Configuração
            </a>
          </li>
        </ul>
      </nav>
    `;

    // agora só trocamos o link da página atual
    const selected = this.querySelector(`[data-page="${actualPage}"]`);
    if (selected) {
      const link = selected.querySelector("a");
      link.setAttribute("href", "#");
      selected.classList.add("navbar__item--selected");
    }
  }
}

customElements.define("manager-nav", ManagerNav);
