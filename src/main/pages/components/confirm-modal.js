class ConfirmModal extends HTMLElement {
  connectedCallback() {
    document.documentElement.style.overflow = "hidden";

    const msg = this.msg;
    const continueFunc = this.continueFunc;
    const cancelFunc = this.cancelFunc;

    this.innerHTML = `
      <div class="modal-bg"></div>
        <div class="modal" role="dialog" aria-modal="true">
          <p class="modal__message">
            ${msg}
          </p>
        <div class="modal__buttons">
        <button class="btn primary-btn modal__continue-btn" id="continueBtn">Continuar</button>
          <button class="btn ghost-btn modal__cancel-btn" id="cancelBtn">Cancelar</button>
        </div>
      </div>
    `;

    const modalBg = this.querySelector(".modal-bg");
    const modal = this.querySelector(".modal");
    this.querySelector("#continueBtn").onclick = () =>
      continueFunc(modalBg, modal);
    this.querySelector("#cancelBtn").onclick = () => cancelFunc(modalBg, modal);
  }
}

customElements.define("confirm-modal", ConfirmModal);
