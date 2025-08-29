class Snackbar extends HTMLElement {
  timeoutId;

  connectedCallback() {
    this.innerHTML = `
      <div class="snackbar snackbar--hidden" aria-hidden="true"></div>
    `;
  }

  show(type, message) {
    const snackbar = this.querySelector(".snackbar");

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    snackbar.innerHTML = message;
    snackbar.className = `snackbar snackbar--${type}`;

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
