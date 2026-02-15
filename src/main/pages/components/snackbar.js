class Snackbar extends HTMLElement {
  timeoutId;

  connectedCallback() {
    this.innerHTML = `
      <div class="snackbar snackbar--hidden" aria-hidden="true"></div>
    `;
  }

  show(type, message, btnInfo) {
    const snackbar = this.querySelector(".snackbar");

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    snackbar.className = `snackbar snackbar--${type}`;

    if (btnInfo) {
      snackbar.innerHTML = `
        <p>${message}</p>
        <button>${btnInfo.label}</button>
      `;

      this.querySelector("button").addEventListener(
        "click",
        async () => {
          try {
            await btnInfo.action();
          } finally {
            snackbar.classList.add("snackbar--hidden");
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
          }
        },
        { once: true },
      );

      this.querySelector("button").focus();
    } else {
      snackbar.innerHTML = message;
    }

    this.timeoutId = setTimeout(() => {
      snackbar.classList.add("snackbar--hidden");

      snackbar.addEventListener(
        "transitionend",
        () => {
          snackbar.className = "snackbar snackbar--hidden";
          snackbar.innerHTML = "";
          this.timeoutId = undefined;
        },
        { once: true },
      );
    }, 5000);
  }
}

customElements.define("app-snackbar", Snackbar);
