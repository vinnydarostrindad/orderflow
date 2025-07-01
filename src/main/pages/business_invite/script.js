const advanceButton = document.querySelector("#advance");
const params = new URLSearchParams(document.location.search);
const businessId = params.get("businessId");
const codeBox = document.querySelector("#code");
const copyCodeBtn = document.querySelector("#copyCodeBtn");
const copyUrlBtn = document.querySelector("#copyUrlBtn");
const shareBtn = document.querySelector("#shareBtn");

copyCodeBtn.addEventListener("click", copyToClipBoard);
copyUrlBtn.addEventListener("click", copyToClipBoard);
shareBtn.addEventListener("click", share);

codeBox.innerHTML = businessId;

async function copyToClipBoard(e) {
  try {
    await navigator.clipboard.writeText(businessId);
    const copyWarn = e.target.closest("div").nextElementSibling;

    copyWarn.innerHTML = "Código copiado!";
    setTimeout(() => {
      copyWarn.innerHTML = "";
    }, 2000);

    console.log("copiou");
  } catch (error) {
    alert(error);
  }
}

let codeUrl;
function generateLink() {
  codeUrl = new URL("/employee-login", "http://localhost:5500/");
  codeUrl.search = `?businessId=${businessId}`;
}

async function share() {
  if (navigator.share) {
    try {
      await navigator.share({
        url: codeUrl,
      });
      console.log("Tamo aí");
    } catch (error) {
      console.log(error);
    }
  } else {
    toggleShareModal();

    const modalBg = document.querySelector(".modalBackground");
    const exitBtn = document.querySelector("#exitModalBtn");
    const whatsappLink = document.querySelector("#whatsappLink");
    const emailLink = document.querySelector("#emailLink");
    const telegramLink = document.querySelector("#telegramLink");

    modalBg.addEventListener("click", toggleShareModal);
    exitBtn.addEventListener("click", toggleShareModal);

    const url = `http://localhost:5500/employee-login?businessId=${businessId}`;

    whatsappLink.addEventListener("click", (e) => {
      e.preventDefault();

      const message = encodeURIComponent(
        "Acesse o OrderFlow por este link: " + url,
      );
      window.open(`https://wa.me/?text=${message}`, "_blank");
    });

    emailLink.addEventListener("click", (e) => {
      e.preventDefault();

      const subject = encodeURIComponent("Acesse o OrderFlow");
      const body = encodeURIComponent(
        "Segue o link para acesso ao OrderFlow: " + url,
      );
      window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    });

    telegramLink.addEventListener("click", () => {
      const msg = encodeURIComponent("Acesse o OrderFlow: " + url);
      const telegramUrl = `https://t.me/share/url?url=${msg}`;
      window.open(telegramUrl, "_blank");
    });
  }
}

function toggleShareModal() {
  const modal = document.querySelector("#shareModal");
  const modalBg = document.querySelector(".modalBackground");

  if (!modalBg.className.includes("hidden")) {
    modal.classList.toggle("hidden");
    setTimeout(() => {
      modalBg.classList.toggle("hidden");
    }, 250);
    return;
  }

  modal.classList.toggle("hidden");
  modalBg.classList.toggle("hidden");
}

generateLink();

advanceButton.onclick = () => {
  window.location.href = `http://localhost:5500/src/main/pages/maneger/index.html?businessId=${businessId}`;
};
