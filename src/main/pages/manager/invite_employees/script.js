import "/components/header/script.js";

const advanceButton = document.querySelector("#advanceBtn");
const codeBox = document.querySelector("#code");
const copyCodeBtn = document.querySelector("#copyCodeBtn");
const shareBtn = document.querySelector("#shareBtn");
const modalLink = document.querySelector(".modal__link");
const copyUrlBtn = document.querySelector("#copyUrlBtn");

const businessId = localStorage.getItem("b");

const codeUrl = new URL(`/login?b=${businessId}`, "http://localhost:3000/");

modalLink.textContent = codeUrl;

advanceButton.addEventListener("click", () => {
  advanceButton.classList.add("header__advance-btn--loading");
  localStorage.removeItem("b");
  window.location.href = `http://localhost:3000/dashboard`;
});
copyCodeBtn.addEventListener("click", (e) => copyToClipBoard(e, businessId));
shareBtn.addEventListener("click", share);
copyUrlBtn.addEventListener("click", (e) => copyToClipBoard(e, codeUrl));

async function copyToClipBoard(e, textToCopy) {
  try {
    await navigator.clipboard.writeText(textToCopy);
    const copyWarn = e.target.closest("div").nextElementSibling;

    copyWarn.textContent = "Código copiado!";
    setTimeout(() => (copyWarn.textContent = ""), 2000);
  } catch (error) {
    alert(error);
  }
}

function toggleShareModal(shareModalBg, shareModal) {
  if (!navigator.share) {
    navigator.share({
      title: "OrderFlow",
      text: "Registre-se na sua empresa para começar a ter mais lucro no trabalho",
      url: codeUrl,
    });
    return;
  }

  if (!shareModalBg.className.includes("modal-bg--hidden")) {
    shareModal.classList.toggle("modal--hidden");
    setTimeout(() => shareModalBg.classList.toggle("modal-bg--hidden"), 250);
    return;
  }

  shareModal.classList.toggle("modal--hidden");
  shareModalBg.classList.toggle("modal-bg--hidden");
}

function shareWithWhatsapp(e) {
  e.preventDefault();

  const message = encodeURIComponent(
    "Acesse o OrderFlow por este link: " + codeUrl,
  );
  window.open(`https://wa.me/?text=${message}`, "_blank");
}

function shareWithEmail(e) {
  e.preventDefault();

  const subject = encodeURIComponent("Acesse o OrderFlow");
  const body = encodeURIComponent(
    "Segue o link para acesso ao OrderFlow: " + codeUrl,
  );
  window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
}

function shareWithTelegram(e) {
  e.preventDefault();

  const msg = encodeURIComponent("Acesse o OrderFlow: " + codeUrl);
  const telegramUrl = `https://t.me/share/url?url=${msg}`;
  window.open(telegramUrl, "_blank");
}

async function share() {
  if (!navigator.share) {
    try {
      await navigator.share({
        url: codeUrl,
      });
    } catch (error) {
      alert(error);
    }
  } else {
    const shareModalBg = document.querySelector(".modal-bg");
    const shareModal = document.querySelector("#shareModal");
    const exitModalBtn = document.querySelector("#exitModalBtn");
    const whatsappLink = document.querySelector("#whatsappLink");
    const emailLink = document.querySelector("#emailLink");
    const telegramLink = document.querySelector("#telegramLink");

    toggleShareModal(shareModalBg, shareModal);

    exitModalBtn.onclick = shareModalBg.onclick = () =>
      toggleShareModal(shareModalBg, shareModal);

    whatsappLink.onclick = shareWithWhatsapp;
    emailLink.onclick = shareWithEmail;
    telegramLink.onclick = shareWithTelegram;
  }
}

codeBox.textContent = businessId;
