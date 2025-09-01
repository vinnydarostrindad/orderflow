import "/components/snackbar.js";
import "/components/confirm-modal.js";

const advanceButton = document.querySelector("#advanceBtn");
const main = document.querySelector("#main");
const menuForm = document.querySelector("#menuForm");
const menuFormBtn = document.querySelector("#menuFormBtn");
const menuItemForm = document.querySelector("#menuItemForm");
const skipBtns = document.querySelectorAll(".skip-button");
const nameInput = document.querySelector("#menuItemName");
const priceInput = document.querySelector("#price");
const descriptionInput = document.querySelector("#description");
const fileInput = document.querySelector("#fileInput");
const imgFileInput = document.querySelector("#image");
const imgPreview = document.querySelector("#imgPreview");
const inputFileText = document.querySelector(".form__file-input-text");
const typeInput = document.querySelector("#type");
const typeSelectBox = document.querySelector(".type-select-box");
const checkboxInput = document.querySelector("#checkbox");
const menu = document.querySelector("#menu");
const menuItemsBox = document.querySelector("#menuItems");
const snackbar = document.querySelector("#snackbar");

let menuId;
let menuItems = [];
let types = new Set();

menuForm.addEventListener("submit", createMenu);
priceInput.addEventListener("input", formatPriceInput);
fileInput.addEventListener("change", changeImgPreview);
typeInput.addEventListener("focus", searchTypes);
typeInput.addEventListener("input", searchTypes);
typeSelectBox.addEventListener("mousedown", selectType);
menuItemForm.addEventListener("submit", addMenuItem);
menuItemForm.addEventListener("reset", clearFileInputImg);
advanceButton.addEventListener("click", handleAdvance);
menu.addEventListener("click", selectItem);
skipBtns.forEach((btn) => btn.addEventListener("click", handleSkip));

function redirectToNextPage() {
  window.location.href = `http://localhost:3000/invite-employees`;
}

function handleSkip() {
  if (menuItems.length === 0) {
    redirectToNextPage();
    return;
  }

  const confirmModal = document.createElement("confirm-modal");
  confirmModal.msg = "Tudo que foi adicionado será perdido. Deseja continuar?";
  confirmModal.continueFunc = () => {
    window.removeEventListener("beforeunload", saveMenuItemsDraft);
    sessionStorage.removeItem("menuItemsDraft");
    redirectToNextPage();
  };
  confirmModal.cancelFunc = (modalBg, modal) => {
    modalBg.remove();
    modal.remove();
    document.documentElement.style.overflow = "";
  };
}

function changeForms() {
  main.classList.toggle("main--show-menu-form");
  main.classList.toggle("main--show-menu-item-form");
}

async function createMenu(e) {
  e.preventDefault();

  menuFormBtn.classList.add("form__btn--loading");
  menuFormBtn.disabled = true;
  menuFormBtn.firstElementChild.textContent = "Criando";

  const name = e.target[0].value;

  try {
    const response = await fetch(`http://localhost:3000/api/v1/menu`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    });

    console.log(response.ok);
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const responseBody = await response.json();
    menuId = responseBody.id;
    console.log(responseBody);

    menu.firstElementChild.textContent = name;

    menuFormBtn.classList.remove("form__btn--loading");
    menuFormBtn.disabled = false;
    menuFormBtn.firstElementChild.textContent = "Criar";
    changeForms();
  } catch (error) {
    console.error(error);
    menuFormBtn.classList.remove("form__btn--loading");
    menuFormBtn.disabled = false;
    menuFormBtn.firstElementChild.textContent = "Criar";
    snackbar.show(
      "error",
      "<p>Erro ao criar o menu. <br /> Tente novamente.</p>",
    );
  }
}

function formatPriceInput(e) {
  const value = e.target.value;

  if (value === "" || value === "0,0") {
    e.target.value = "0,00";
    return;
  }

  const number = value
    .split(".")
    .join("")
    .split(",")
    .join("")
    .replace(/\D/g, "");
  const cents = number.slice(-2);
  const int = number.slice(0, -2);
  const formatedNumber = Number(int + "." + cents)
    .toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
    .replace("R$", "")
    .trim();

  e.target.value = formatedNumber;
}

function selectType(e) {
  const opt = e.target.closest("button[role='option']");
  if (!opt) return;
  typeInput.value = opt.textContent;
}

function searchTypes(e) {
  if (types.size === 0) return;

  typeSelectBox.innerHTML = "";
  typeSelectBox.hidden = false;

  let word = e.target.value;

  const startsWithFilterTypes = Array.from(types).filter((type) =>
    type.startsWith(word),
  );
  const includesFilterTypes = Array.from(types).filter((type) =>
    type.includes(word),
  );
  const filteredTypes = new Set([
    ...startsWithFilterTypes.sort(),
    ...includesFilterTypes.sort(),
  ]);

  for (let type of filteredTypes) {
    typeSelectBox.innerHTML += `
      <button type="button" role="option">${type}</button>
    `;
  }

  typeInput.addEventListener("blur", () => {
    typeSelectBox.hidden = true;
  });
}

function changeImgPreview(e) {
  inputFileText.innerHTML = "<p>Alterar Imagem</p>";

  const imgFile = e.target.files[0];

  if (imgFile) {
    const preview = document.createElement("img");
    preview.src = URL.createObjectURL(imgFile);

    imgPreview.replaceChildren(preview);
  } else {
    imgPreview.firstChild.remove();
    inputFileText.innerHTML = `<p>Adicionar Imagem</p> <span>+</span>`;
  }
}

function clearFileInputImg() {
  if (!imgPreview.children[0]) return;

  inputFileText.innerHTML = `
    <p>Adicionar Imagem</p>
    <span>+</span>
  `;
  imgPreview.removeChild(imgPreview.children[0]);
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildItemHTML(menuItem) {
  const { name, price, description, imgBlob, type } = menuItem;

  const item = document.createElement("div");
  item.className = "menu-preview__item";

  const imgBox = document.createElement("div");
  imgBox.className = "menu-preview__item-img";
  if (imgBlob) {
    const img = document.createElement("img");
    img.src = imgBlob;
    img.alt = name;
    imgBox.appendChild(img);
  } else {
    const span = document.createElement("span");
    span.textContent = "Sem imagem";
    imgBox.appendChild(span);
  }

  const infos = document.createElement("div");
  infos.className = "menu-preview__item-infos";

  const header = document.createElement("div");
  header.className = "menu-preview__item-header";

  const nameElem = document.createElement("h4");
  nameElem.className = "menu-preview__item-name";
  nameElem.textContent = name;

  const priceElem = document.createElement("p");
  priceElem.className = "menu-preview__item-price";
  priceElem.textContent = `R$ ${price}`;

  header.appendChild(nameElem);
  header.appendChild(priceElem);
  infos.appendChild(header);

  if (type) {
    const typeElem = document.createElement("p");
    typeElem.className = "menu-preview__item-type";
    typeElem.textContent = type;
    infos.appendChild(typeElem);
  }

  const descElem = document.createElement("p");
  descElem.className = "menu-preview__item-description";
  if (description) {
    const safeDescription = escapeHTML(description).replace(/\n/g, "<br>");
    descElem.innerHTML = safeDescription;
  } else {
    descElem.innerHTML = "Sem descrição";
  }

  infos.appendChild(descElem);

  item.appendChild(imgBox);
  item.appendChild(infos);
  item.setAttribute("data-name", name);

  return item;
}

function addItemToMenu(menuItem) {
  const item = buildItemHTML(menuItem);

  if (menuItemsBox.firstElementChild.nodeName === "P") {
    menuItemsBox.innerHTML = "";
  }

  menuItemsBox.appendChild(item);
}

function addMenuItem(e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const price = priceInput.value.trim();
  const description = descriptionInput.value.trim();
  const imgFile = imgFileInput.files[0];
  const type = typeInput.value.trim();

  const nameAlreadyExists = menuItems.some(
    (item) => item.name.toLowerCase() === name.toLowerCase(),
  );

  if (nameAlreadyExists) {
    nameInput.style.backgroundColor = "rgba(147, 147, 0, 1)";
    nameInput.value = "";
    nameInput.focus();
    snackbar.show("warn", "<p>Nome já adicionado no menu!</p>");

    const clearWarning = () => {
      nameInput.style.backgroundColor = "";
      nameInput.removeEventListener("input", clearWarning);
      nameInput.removeEventListener("blur", clearWarning);
    };

    nameInput.addEventListener("input", clearWarning);
    nameInput.addEventListener("blur", clearWarning);

    return;
  }

  if (price === "0,00") {
    const priceWrapper = priceInput.parentElement;
    priceWrapper.style.backgroundColor = "rgba(147, 147, 0, 1)";
    priceWrapper.focus();
    snackbar.show("warn", "<p>O preço precisa ser maior <br> que R$ 0,00.</p>");

    const clearWarning = () => {
      priceWrapper.style.backgroundColor = "";
      priceInput.removeEventListener("input", clearWarning);
      priceInput.removeEventListener("blur", clearWarning);
    };

    priceInput.addEventListener("input", clearWarning);
    priceInput.addEventListener("blur", clearWarning);

    return;
  }

  let imgBlob;

  if (imgFile) {
    imgBlob = URL.createObjectURL(imgFile);
  }

  const menuItem = {
    name,
    price: Number(price.replace(",", ".")),
    description,
    imgFile,
    imgBlob,
    type,
  };

  menuItems.push(menuItem);
  if (type.trim()) types.add(type);

  addItemToMenu(menuItem);

  if (checkboxInput.checked) return;

  e.target.reset();
}

function selectItem(e) {
  const btn = menu.querySelector("button");
  if (btn) btn.remove();

  const menuItem = e.target.closest(".menu-preview__item");
  if (!menuItem) return;

  const removeBtn = document.createElement("button");
  removeBtn.className = "menu-preview__remove-btn";
  removeBtn.onclick = removeItem;
  removeBtn.textContent = "Remover";

  menuItem.append(removeBtn);

  document.addEventListener(
    "mousedown",
    (e) => {
      if (!menu.contains(e.target)) {
        menu.querySelector("button").remove();
      }
    },
    { once: true },
  );

  function removeItem(e) {
    e.target.parentElement.remove();
    const itemIndex = menuItems.findIndex(
      (item) => item.name === menuItem.dataset.name,
    );

    menuItems.splice(itemIndex, 1);
    if (menuItems.length === 0) {
      menuItemsBox.innerHTML =
        "<p>Adicione algum item ao seu menu para visualizar</p>";
    }
  }
}

function saveMenuItemsDraft() {
  if (menuItems.length > 0) {
    sessionStorage.setItem("menuItemsDraft", JSON.stringify(menuItems));
  } else {
    sessionStorage.removeItem("menuItemsDraft");
  }
}

async function handleAdvance(e) {
  const btn = e.target;

  if (menuItems.length === 0) {
    snackbar.show(
      "warn",
      "<p>Adicione algum item no menu <br> para prosseguir.</p>",
    );
    return;
  }

  btn.textContent = "avançando";
  btn.classList.add("header__advance-btn--loading");

  try {
    for (let item of menuItems) {
      const { name, price, description, imgFile, type } = item;
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("imgFile", imgFile);
      formData.append("type", type);

      // Talvez retornar todos como promises pra ir todas de uma vez seja melhor. Testar isso depois.
      const response = await fetch(
        `http://localhost:3000/api/v1/menu/${menuId}/item`,
        {
          method: "POST",
          body: formData,
        },
      );

      console.log("OK: ", response.ok);
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
        };
      }

      const responseBody = await response.json();
      console.log(responseBody);
    }

    window.addEventListener("beforeunload", saveMenuItemsDraft);
    sessionStorage.removeItem("menuItemsDraft");
    redirectToNextPage();
  } catch (error) {
    console.error(error);
    btn.textContent = "avançar";
    btn.classList.remove("header__advance-btn--loading");

    snackbar.show(
      "error",
      "<p>Erro ao adicionar itens ao menu. <br /> Tente novamente.</p>",
    );
  }
}

window.addEventListener("beforeunload", saveMenuItemsDraft);

const menuItemsDraft = JSON.parse(sessionStorage.getItem("menuItemsDraft"));
if (menuItemsDraft) {
  menuItems = menuItemsDraft;
  menuItems.forEach((item) => {
    if (item.type.trim()) types.add(item.type);
  });

  menuItems.forEach(addItemToMenu);
}
