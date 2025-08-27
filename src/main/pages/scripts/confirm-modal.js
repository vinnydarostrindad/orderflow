// <div class="modal-background modal-background--hidden"></div>
//  <div class="modal modal--hidden" role="dialog" aria-modal="true">
//    <p class="modal__message">
//      Tudo que foi adicionado será perdido. Deseja continuar?
//    </p>
//  <div class="modal__buttons">
//    <button class="modal__cancel-button" id="cancelBtn">Cancelar</button>
//    <button class="modal__continue-button" id="continueBtn">Continuar</button>
//  </div>
// </div>

function showConfirmModal({ message, onCancel, onContinue }) {
  const { modalBg, modal } = createConfirmModal(message, onCancel, onContinue);

  document.body.append(modalBg, modal);

  document.documentElement.style.overflow = "hidden";
}

function createConfirmModal(msg, cancelFunc, continueFunc) {
  const modalBg = document.createElement("div");
  modalBg.setAttribute("class", "modal-background");

  const modal = document.createElement("div");
  modal.setAttribute("class", "modal");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const message = document.createElement("p");
  message.setAttribute("class", "modal__message");
  message.textContent = msg;

  const buttons = document.createElement("div");
  buttons.setAttribute("class", "modal__buttons");

  const continueBtn = document.createElement("button");
  continueBtn.setAttribute("class", "modal__continue-button");
  continueBtn.setAttribute("id", "continueBtn");
  continueBtn.textContent = "Continuar";
  continueBtn.onclick = () => continueFunc(modalBg, modal);

  const cancelBtn = document.createElement("button");
  cancelBtn.setAttribute("class", "modal__cancel-button");
  cancelBtn.setAttribute("id", "cancelBtn");
  cancelBtn.textContent = "Cancelar";
  cancelBtn.onclick = () => cancelFunc(modalBg, modal);

  buttons.append(continueBtn, cancelBtn);
  modal.append(message, buttons);

  return { modalBg, modal };
}

export default showConfirmModal;
