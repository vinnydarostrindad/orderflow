import "/waiter/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";

const params = new URLSearchParams(window.location.search);
const menuId = params.get("mi");
const menuNameValue = params.get("mn");

const snackbar = document.querySelector("#snackbar");
const searchBar = document.querySelector("#search");
const menuBox = document.querySelector(".menu__categories");
const menuName = document.querySelector("#menuName");
const typeSelect = document.querySelector("#typeSelect");

let allMenuItemsByType = Object.create(null);
let searchedMenuItemsByType;
let menuItemsTypes = [];
menuName.textContent = menuNameValue;

typeSelect.addEventListener("change", filterByType);
searchBar.addEventListener("input", searchItem);

async function fetchMenuItems() {
  const res = await fetch(`http://localhost:3000/api/v1/menu/${menuId}/item`);

  if (!res.ok) {
    throw {
      status: res.status,
      statusText: res.statusText,
      url: res.url,
    };
  }

  const menuItems = await res.json();
  console.log(menuItems);
  return menuItems;
}

function groupItemsByType(menuItems) {
  menuItems.forEach((item) => {
    const itemType = item.type;
    if (allMenuItemsByType[itemType]) {
      allMenuItemsByType[itemType].push(item);
    } else {
      allMenuItemsByType[itemType] = [item];
    }
  });

  if (menuItemsTypes.length === 0) {
    menuItemsTypes = Object.keys(allMenuItemsByType);
    menuItemsTypes.sort();
  }

  return allMenuItemsByType;
}

function groupSearchedItemsByType(menuItems) {
  searchedMenuItemsByType = Object.create(null);
  menuItems.forEach((item) => {
    const itemType = item.type;
    if (searchedMenuItemsByType[itemType]) {
      searchedMenuItemsByType[itemType].push(item);
    } else {
      searchedMenuItemsByType[itemType] = [item];
    }
  });

  return searchedMenuItemsByType;
}

function buildItemsHTML(items) {
  let itemsGroupHTML = "";
  items.forEach((item) => {
    itemsGroupHTML += item.imagePath
      ? `
      <button class="menu-item">
        <div class="menu-item__img">
          <img src="${item.imagePath}"/>
        </div>
        <div class="menu-item__info">
          <h4 class="menu-item__name">${item.name}</h4>
          <p class="menu-item__price">R$ ${item.price}</p>
        </div>
      </button>
      `
      : `
      <button class="menu-item menu-item--no-img">
        <div class="menu-item__info">
          <h4 class="menu-item__name">${item.name}</h4>
          <p class="menu-item__price">R$ ${item.price}</p>
        </div>
      </button>
      `;
  });
  return itemsGroupHTML;
}

function getHTML(items) {
  menuBox.innerHTML = "";
  let itemsGroupHTML;
  if (items[""]) {
    const categorySection = document.createElement("section");
    categorySection.className = "menu-category";

    const menuItems = document.createElement("div");
    menuItems.className = "menu__items";

    itemsGroupHTML = buildItemsHTML(items[""]);

    menuItems.innerHTML += itemsGroupHTML;
    categorySection.append(menuItems);
    menuBox.append(categorySection);
  }

  const types = Object.keys(items).sort();
  for (let type of types) {
    if (!type) continue;

    const categorySection = document.createElement("section");
    categorySection.className = "menu-category";

    const categoryName = document.createElement("h3");
    categoryName.className = "menu-category__title";
    categoryName.textContent = type;

    categorySection.append(categoryName);

    const menuItems = document.createElement("div");
    menuItems.className = "menu__items";

    itemsGroupHTML = buildItemsHTML(items[type]);

    menuItems.innerHTML += itemsGroupHTML;
    categorySection.append(menuItems);
    menuBox.append(categorySection);
  }
}

function putOptionsOnSelect() {
  for (let type of menuItemsTypes) {
    if (!type) continue;

    const opt = document.createElement("option");
    opt.value = opt.textContent = type;
    typeSelect.append(opt);
  }
}

function filterByType(e) {
  const selectType = e.target.value;
  const searchBarValue = searchBar.value.toLowerCase().trim();
  let filteredItemsHTML;

  if (selectType === "everything") {
    if (searchBarValue) {
      const matchedItems = [];
      for (let type in allMenuItemsByType) {
        allMenuItemsByType[type].forEach((item) => {
          if (item.name.toLowerCase().includes(searchBarValue)) {
            matchedItems.push(item);
          }
        });
      }

      if (matchedItems.length === 0) {
        menuBox.innerHTML = "<p>Nenhum item encontrado!</p>";
        return;
      }

      const matchedItemsByType = groupSearchedItemsByType(matchedItems);
      getHTML(matchedItemsByType);
      return;
    } else {
      getHTML(allMenuItemsByType);
      return;
    }
  }

  if (searchBarValue) {
    let searchedMenuItemsFilteredByType = Object.create(null);
    searchedMenuItemsFilteredByType[selectType] = [];
    for (let item of allMenuItemsByType[selectType]) {
      if (item.name.toLowerCase().includes(searchBarValue)) {
        searchedMenuItemsFilteredByType[selectType].push(item);
      }
    }

    filteredItemsHTML = buildItemsHTML(
      searchedMenuItemsFilteredByType[selectType],
    );
  } else {
    filteredItemsHTML = buildItemsHTML(allMenuItemsByType[selectType]);
  }

  const categorySection = document.createElement("section");
  categorySection.className = "menu-category";

  const categoryName = document.createElement("h3");
  categoryName.className = "menu-category__title";
  categoryName.textContent = selectType;

  const menuItems = document.createElement("div");
  menuItems.className = "menu__items";

  menuItems.innerHTML = filteredItemsHTML;
  categorySection.append(categoryName);
  categorySection.append(menuItems);
  menuBox.replaceChildren(categorySection);
}

function searchItem(e) {
  const value = e.target.value.toLowerCase().trim();
  const selectType = typeSelect.value;

  if (selectType === "everything") {
    const matchedItems = [];
    for (let type in allMenuItemsByType) {
      allMenuItemsByType[type].forEach((item) => {
        if (item.name.toLowerCase().includes(value)) {
          matchedItems.push(item);
        }
      });
    }

    if (matchedItems.length === 0) {
      menuBox.innerHTML = "<p>Nenhum item encontrado!</p>";
      return;
    }

    const matchedItemsByType = groupSearchedItemsByType(matchedItems);
    getHTML(matchedItemsByType);
  } else {
    const matchedItems = [];
    for (let item of allMenuItemsByType[selectType]) {
      if (item.name.toLowerCase().includes(value)) {
        matchedItems.push(item);
      }
    }

    if (matchedItems.length === 0) {
      menuBox.innerHTML = "<p>Nenhum item encontrado!</p>";
      return;
    }

    const matchedItemsHTML = buildItemsHTML(matchedItems);

    const categorySection = document.createElement("section");
    categorySection.className = "menu-category";

    const categoryName = document.createElement("h3");
    categoryName.className = "menu-category__title";
    categoryName.textContent = selectType;

    const menuItems = document.createElement("div");
    menuItems.className = "menu__items";

    menuItems.innerHTML = matchedItemsHTML;
    categorySection.append(categoryName);
    categorySection.append(menuItems);
    menuBox.replaceChildren(categorySection);
  }
}

async function setupMenuPage() {
  try {
    const menuItems = await fetchMenuItems();
    const items = groupItemsByType(menuItems);
    getHTML(items);
    putOptionsOnSelect();
  } catch (err) {
    console.error(err);
    snackbar.show(
      "error",
      "<p>Error ao obter itens do cardápio. <br> Tente novamente!</p>",
    );
  }
}

setupMenuPage();
