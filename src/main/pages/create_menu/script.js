const main = document.querySelector("#main");
const menuForm = document.querySelector("#menuForm");
const menuFormBtn = document.querySelector("#menuFormBtn");
const menuItemForm = document.querySelector("#menuItemForm");
const nameInput = document.querySelector("#menuItemName");
const priceInput = document.querySelector("#price");
const descriptionInput = document.querySelector("#description");
const fileInput = document.querySelector("#fileInput");
const imgFileInput = document.querySelector("#image");
const imgPreview = document.querySelector("#imgPreview");
const typeInput = document.querySelector("#type");
const typeSelectBox = document.querySelector(".type-select-box");
const checkboxInput = document.querySelector("#checkbox");
const menu = document.querySelector("#menu");
const advanceButton = document.querySelector("#advanceBtn");

let params = new URLSearchParams(document.location.search);
let businessId = params.get("b");

let menuId;
let menuItems = [];
let types = new Set();

menuForm.addEventListener("submit", createMenu);
fileInput.addEventListener("change", changeImgPreview);
menuItemForm.addEventListener("submit", addMenuItem);
advanceButton.addEventListener("click", advaceButton);
typeInput.addEventListener("input", searchTypes);
typeInput.addEventListener("input", searchTypes);

function changeForms() {
  main.classList.toggle("main--show-menu-form");
  main.classList.toggle("main--show-menu-item-form");
}

async function createMenu(e) {
  e.preventDefault();

  menuFormBtn.innerHTML = "Criando <div class='loading'></div>";

  const name = e.target[0].value;

  const response = await fetch(
    `http://localhost:3000/api/v1/business/${businessId}/menu`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
      }),
    },
  );

  console.log(response.ok);
  const responseBody = await response.json();
  menuId = responseBody.id;
  console.log(responseBody);

  if (!response.ok) {
    menuFormBtn.innerHTML = "Criar";
    return;
  }

  menu.firstElementChild.textContent = name;

  menuFormBtn.innerHTML = "Criar";
  changeForms();
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

  return item;
}

function addItemToMenu(menuItem) {
  const menuItemsBox = document.querySelector("#menuItems");

  const item = buildItemHTML(menuItem);

  if (menuItemsBox.firstElementChild.nodeName === "P") {
    menuItemsBox.innerHTML = "";
  }

  menuItemsBox.appendChild(item);
}

function addMenuItem(e) {
  e.preventDefault();

  const name = nameInput.value;
  const price = priceInput.value;
  const description = descriptionInput.value;
  const imgFile = imgFileInput.files[0];
  const type = typeInput.value;

  let imgBlob;

  if (imgFile) {
    imgBlob = URL.createObjectURL(imgFile);
  }

  const menuItemWithFile = {
    name,
    price,
    description,
    imgFile,
    type,
  };

  const menuItemWithBlob = {
    name,
    price,
    description,
    imgBlob,
    type,
  };

  menuItems.push(menuItemWithFile);
  types.add(type);

  addItemToMenu(menuItemWithBlob);
}

function changeImgPreview(e) {
  const inputFileText = document.querySelector(".form__file-input-text");

  inputFileText.innerHTML = "<p>Alterar Imagem</p>";

  const imgFile = e.target.files[0];

  if (imgFile) {
    const preview = document.createElement("img");
    preview.src = URL.createObjectURL(imgFile);

    imgPreview.replaceChildren(preview);
  }
}

async function advaceButton() {
  if (menuItems.length === 0) {
    alert("Adicione algum funcionário para prosseguir.");
    return;
  }

  menuItems.forEach(async (item) => {
    const { name, price, description, imgFile, type } = item;
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("imgFile", imgFile);
    formData.append("type", type);

    const response = await fetch(
      `http://localhost:3000/api/v1/business/${businessId}/menu/${menuId}/item`,
      {
        method: "POST",
        body: formData,
      },
    );

    const responseBody = await response.json();
    console.log(responseBody);
  });

  window.location.href = `http://localhost:5500/src/main/pages/business_invite/index.html?businessId=${businessId}`;
}

function searchTypes() {
  if (types.size === 0) return;
  typeSelectBox.innerHTML = "";
  typeSelectBox.hidden = false;

  for (let type of types) {
    typeSelectBox.innerHTML += `
      <button type="button" role="option">${type}</button>
    `;
  }

  typeInput.addEventListener(
    "blur",
    () => {
      typeSelectBox.hidden = true;
    },
    { once: true },
  );
}
