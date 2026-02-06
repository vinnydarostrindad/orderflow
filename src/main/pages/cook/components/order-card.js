class OrderCard extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name");
    const quantity = this.getAttribute("quantity");
    const notes = this.hasAttribute("notes");
    const imgPath = this.getAttribute("imgPath");
    const id = this.dataset.id;
    const time = this.dataset.time;

    this.innerHTML = `
      <button class="order-item" data-time="${time}" data-id="${id}">
        <div class="order-item__info">
          <div class="order-item__img">
            <img src="${imgPath}" alt="">
          </div>
          <div class="order-item__text">
            <h3 class="order-item__name">${name}</h3>
            <p class="order-item__quantity">Quantidade: ${quantity}</p>
            ${
              notes
                ? `<p class="order-item__note-warning">Tem anotações</p>`
                : ""
            }
            <p class="order-item__time">Tempo: 00:00:00</p>
          </div>
        </div>
      </button>
    `;
  }
}

customElements.define("order-card", OrderCard);
