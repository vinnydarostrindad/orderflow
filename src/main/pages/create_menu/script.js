const advanceButton = document.querySelector("#advance");
let params = new URLSearchParams(document.location.search);
let businessId = params.get("businessId");
const menuForm = document.querySelector("#menuForm");
const menuItemForm = document.querySelector("#menuItemForm");
const fileInput = document.querySelector("#fileInput");

let menuId = undefined;
menuForm.onsubmit = async (e) => {
  e.preventDefault();

  const menu = document.querySelector("#menu");

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
  const responseBody = await response.json();

  menuId = responseBody.id;
  console.log(responseBody);

  menu.firstElementChild.innerHTML = name;

  changeForms();
};

const menuItems = [];
menuItemForm.onsubmit = (e) => {
  e.preventDefault();

  const name = e.target[0].value;
  const price = e.target[1].value;
  const description = e.target[2].value;
  const imgFile = e.target[3].files[0];
  const type = e.target[4].value;

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

  addMenuItem(menuItemWithBlob);
};

fileInput.onchange = (e) => {
  const fileInput = document.querySelector("#fileInput");
  const inputFileText = document.querySelector(".inputFileText");
  const imgPreview = document.querySelector("#imgPreview");

  fileInput.classList.add("changeImg");
  inputFileText.innerHTML = "<p>Alterar Imagem</p>";

  const file = e.target.files[0];

  if (file) {
    const preview = document.createElement("img");
    preview.src = URL.createObjectURL(file);

    imgPreview.replaceChildren(preview);
  }
};

function changeForms() {
  const main = document.querySelector("#main");

  main.classList.toggle("showMenuForm");
  main.classList.toggle("showMenuItemForm");
}

function addMenuItem(menuItem) {
  const menuItemsBox = document.querySelector("#menuItems");
  const { name, price, description, imgBlob, type } = menuItem;

  if (menuItemsBox.firstElementChild.nodeName === "P") {
    menuItemsBox.innerHTML = `
    <div class="menuItem">
      <div class="itemImg">
            ${imgBlob ? `<img src="${imgBlob}" alt="${name}" />` : ""}
            </div>
            <div class="itemInfos">
              <div>
                <h4>${name}</h4>
                <p class="itemPrice">R$ ${price}</p>
                ${type ? `<p class="itemType">${type}</p>` : ""}
              </div>
              <p class="itemDescription">
                ${description}
              </p>
            </div>
    </div>
  `;
    return;
  }

  menuItemsBox.innerHTML += `
    <div class="menuItem">
      <div class="itemImg">
              <img src="${imgBlob}" alt="${name}" />
            </div>
            <div class="itemInfos">
              <div>
                <h4>${name}</h4>
                <p class="itemPrice">R$ ${price}</p>
                ${type ? `<p class="itemType">${type}</p>` : ""}
              </div>
              <p class="itemDescription">
                ${description}
              </p>
            </div>
    </div>
  `;
}

advanceButton.onclick = advaceButton;

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
