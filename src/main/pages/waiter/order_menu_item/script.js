import "/waiter/components/nav/script.js";
import "/waiter/components/menu-card.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const pathParts = window.location.pathname.split("/");
const menuId = pathParts[2];
const menuItemId = pathParts[4];
const DESCRIPTION_COLLAPSE_HEIGHT = 60;
let itemPrice;

const snackbar = document.querySelector("#snackbar");
const nameEl = document.querySelector(".menu-item__name");
const typeEl = document.querySelector(".menu-item__type");
const priceEl = document.querySelector(".menu-item__price");
const imgBox = document.querySelector(".menu-item__img-container");
const descEl = document.querySelector(".menu-item__description");
const descriptionHider = document.querySelector(".description-hider");
const showMoreDescriptionBtn = document.querySelector(
  ".menu-item__description-btn",
);
const descBtn = document.querySelector(".menu-item__description-btn");
const ingredientsBox = document.querySelector(".menu-item__ingredients");
const ingredientsList = ingredientsBox.querySelector("ul");
const waitingEl = document.querySelector(".menu-item__waiting-time");
const orderItemBtn = document.querySelector("#orderItemBtn");

orderItemBtn.addEventListener("click", postOrder);

async function postOrder() {
  const tableId = sessionStorage.getItem("tableId");
  const tableNumber = sessionStorage.getItem("tableNumber");

  let orderBody;
  try {
    const orderResponse = await fetch(
      `${API_URL}/api/v1/table/${tableId}/order`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tableNumber }),
      },
    );

    if (!orderResponse.ok) {
      throw {
        status: orderResponse.status,
        statusText: orderResponse.statusText,
        url: orderResponse.url,
      };
    }

    orderBody = await orderResponse.json();
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao tentar realizar pedido <br> Tente novamente.</p>",
    );
  }

  const quantity = document.querySelector("#quantity").value;
  const notes = document.querySelector("#notes").value;

  try {
    const orderItemResponse = await fetch(
      `${API_URL}/api/v1/table/${tableId}/order/${orderBody.id}/item`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          menuItemId,
          quantity,
          unitPrice: itemPrice,
          totalPrice: itemPrice * quantity,
          notes,
        }),
      },
    );

    if (!orderItemResponse.ok) {
      throw {
        status: orderItemResponse.status,
        statusText: orderItemResponse.statusText,
        url: orderItemResponse.url,
      };
    }

    const orderItemBody = await orderItemResponse.json();
    console.log("FINAL:", orderItemBody);
    window.location.href = `/menu/${menuId}`;
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao tentar realizar pedido <br> Tente novamente.</p>",
    );
  }
}

function populateMenuItem({
  price,
  name,
  ingredients,
  description,
  imagePath,
  type,
  waitingTime,
}) {
  nameEl.textContent = name;

  type ? (typeEl.textContent = type) : (typeEl.style.display = "none");

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
  priceEl.textContent = formattedPrice;

  if (imagePath) {
    const imgEl = document.createElement("img");
    const { publicUrl } = supabase.getUrl("menu-items-img", imagePath);
    imgEl.src = publicUrl;
    imgBox.prepend(imgEl);
  } else {
    imgBox.style.display = "none";
    priceEl.style.position = "static";
    nameEl.insertAdjacentElement("afterend", priceEl);
    document
      .querySelector(".menu-item__header")
      .classList.add("menu-item__header--no-img");
  }

  description
    ? descEl.prepend(description)
    : (descEl.style.display = descBtn.style.display = "none");

  ingredients?.length
    ? ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.className = "menu-item__ingredient";
        li.textContent = ingredient;
        ingredientsList.append(li);
      })
    : (ingredientsBox.style.display = "none");

  waitingTime
    ? (waitingEl.querySelector("span").textContent = waitingTime)
    : (waitingEl.style.display = "none");

  document.querySelector(".menu-item--skeleton").remove();
  document.querySelector(".menu-item").removeAttribute("hidden");

  if (descEl.clientHeight < DESCRIPTION_COLLAPSE_HEIGHT) {
    descriptionHider.remove();
    showMoreDescriptionBtn.remove();
  } else {
    showMoreDescriptionBtn.addEventListener("click", () => {
      descriptionHider.classList.toggle("description-hider--hidden");
      if (descriptionHider.classList.contains("description-hider--hidden")) {
        descEl.style.maxHeight = descEl.scrollHeight + "px";
        showMoreDescriptionBtn.textContent = "Mostrar menos";
      } else {
        descEl.style.maxHeight = "4rem";
        showMoreDescriptionBtn.textContent = "Mostrar mais";
      }
    });
  }
}

async function getMenuItem() {
  try {
    const response = await fetch(
      `${API_URL}/api/v1/menu/${menuId}/item/${menuItemId}`,
    );

    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const menuItem = await response.json();
    itemPrice = menuItem.price;
    populateMenuItem(menuItem);
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter item <br> Tente novamente.</p>",
    );
  }
}

getMenuItem();
