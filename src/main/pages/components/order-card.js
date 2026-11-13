class OrderCard extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name");
    const quantity = this.getAttribute("quantity");
    const notes = this.hasAttribute("notes");
    const imgPath = this.getAttribute("imgPath");
    const hasImg = Boolean(imgPath);
    const table = this.getAttribute("table");
    const id = this.dataset.id;
    const maxTime = this.dataset.max_time;
    const time = this.dataset.time;
    const paymentLabel = this.dataset.paymentLabel;

    this.innerHTML = `
      <button class="order-item ${hasImg ? "" : "order-item--no-img"}" data-time="${time}" data-max_time="${maxTime}" data-id="${id}">
        <div class="order-item__info">
          <div class="order-item__img">
            ${hasImg ? `<img src="${imgPath}" alt="">` : ""}
          </div>
          <div class="order-item__text">
            <div>
              <h3 class="order-item__name">${name}</h3>
              ${table ? `<p>Mesa ${table}</p>` : ""}
            </div>
            <p class="order-item__quantity">Quantidade: ${quantity}</p>
            ${
              notes
                ? `<p class="order-item__note-warning">Tem anotações</p>`
                : ""
            }
            ${
              time
                ? `<p class="order-item__time" data-time="${time}">Tempo: 00:00:00</p>`
                : ""
            }
            ${
              paymentLabel
                ? `<p class="order-item__payment-tag">${paymentLabel}</p>`
                : ""
            }
          </div>
        </div>
      </button>
    `;
  }
}

customElements.define("order-card", OrderCard);
