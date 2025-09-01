class MenuCard extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name");
    const imgPath = this.getAttribute("imgPath");
    const id = this.dataset.id;

    this.innerHTML = `
      <a href="/menu?mn=${name}&mi=${id}" class="menu-card">
        <div class="menu-card__img">
          <img src="${imgPath}" alt="" />
        </div>
        <div class="menu-card__infos">
          <h2 class="menu-card__name">${name}</h2>
        </div>
      </a>
    `;
  }
}

customElements.define("menu-card", MenuCard);
