if (!sessionStorage.getItem("tableId")) {
  window.location.href = "/tables?r=mnd";
}

import "/waiter/components/nav/script.js";
import "/components/header/script.js";
import "/components/snackbar.js";
import supabase from "/scripts/supabase.js";
import API_URL from "/scripts/config-api-url.js";

const pathParts = window.location.pathname.split("/");
const menuId = pathParts[2];
const params = new URLSearchParams(window.location.search);
const menuNameValue = params.get("mn");

const snackbar = document.querySelector("#snackbar");
const searchBar = document.querySelector("#search");
const menuBox = document.querySelector(".menu__categories");
const menuName = document.querySelector("#menuName");
const typeSelect = document.querySelector("#typeSelect");

let allMenuItemsByType = Object.create(null);
let menuItemsTypes = [];
menuName.textContent = menuNameValue;

typeSelect.addEventListener("change", filterMenuItems);
searchBar.addEventListener("input", filterMenuItems);

function renderTypeOptions() {
  for (let type of menuItemsTypes) {
    if (!type) continue;

    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    typeSelect.append(opt);
  }
}

function buildGroupItemsFragment(items) {
  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const link = document.createElement("a");
    link.classList.add("menu-item");
    link.href = `/menu/${menuId}/item/${item.id}`;

    if (!item.imagePath) {
      link.classList.add("menu-item--no-img");
    } else {
      const imgWrapper = document.createElement("div");
      imgWrapper.classList.add("menu-item__img");

      const img = document.createElement("img");
      const { publicUrl } = supabase.getUrl("menu-items-img", item.imagePath);
      img.src = publicUrl;

      imgWrapper.append(img);
      link.append(imgWrapper);
    }

    const info = document.createElement("div");
    info.classList.add("menu-item__info");

    const name = document.createElement("h4");
    name.classList.add("menu-item__name");
    name.textContent = item.name;

    const price = document.createElement("p");
    price.classList.add("menu-item__price");
    price.textContent = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(item.price);

    info.append(name);
    info.append(price);
    link.append(info);
    fragment.append(link);
  });

  return fragment;
}

function buildGroupFragment(groupedItems, type) {
  const fragment = document.createDocumentFragment();
  const categorySection = document.createElement("section");
  categorySection.classList.add("menu-category");

  if (type) {
    const categoryName = document.createElement("h3");
    categoryName.classList.add("menu-category__title");
    categoryName.textContent = type;

    categorySection.append(categoryName);
  }

  const menuItems = document.createElement("div");
  menuItems.classList.add("menu__items");

  let items = buildGroupItemsFragment(groupedItems[type]);

  menuItems.append(items);
  categorySection.append(menuItems);
  fragment.append(categorySection);
  return fragment;
}

function renderGroupedMenuItems(groupedItems) {
  menuBox.innerHTML = "";

  const types = Object.keys(groupedItems).sort();
  if (types.length === 0) {
    menuBox.innerHTML = "<p>Nenhum item encontrado!</p>";
  }
  for (let type of types) {
    const categorySection = buildGroupFragment(groupedItems, type);
    menuBox.append(categorySection);
  }
}

function groupItemsByType(menuItems) {
  let groupedItems = Object.create(null);
  menuItems.forEach((item) => {
    const type = item.type;
    if (groupedItems[type]) {
      groupedItems[type].push(item);
    } else {
      groupedItems[type] = [item];
    }
  });

  return groupedItems;
}

async function fetchMenuItems() {
  const res = await fetch(`${API_URL}/api/v1/menu/${menuId}/item`);

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

async function setupMenuPage() {
  try {
    const menuItems = await fetchMenuItems();
    allMenuItemsByType = groupItemsByType(menuItems);

    menuItemsTypes = Object.keys(allMenuItemsByType);
    menuItemsTypes.sort();

    renderGroupedMenuItems(allMenuItemsByType);
    renderTypeOptions();
  } catch (err) {
    console.error(err);
    snackbar.show(
      "error",
      "<p>Error ao obter itens do cardápio. <br> Tente novamente!</p>",
    );
  }
}

function filterMenuItems() {
  const selectValue = typeSelect.value;
  const searchBarValue = searchBar.value.toLowerCase().trim();

  let itemsToSearch =
    selectValue === "everything"
      ? Object.values(allMenuItemsByType).flat()
      : allMenuItemsByType[selectValue];

  if (!itemsToSearch || itemsToSearch.length === 0) {
    menuBox.innerHTML = "<p>Nenhum item encontrado!</p>";
    return;
  }

  if (searchBarValue) {
    itemsToSearch = itemsToSearch.filter((item) =>
      item.name.toLowerCase().includes(searchBarValue),
    );
  }

  if (itemsToSearch.length === 0) {
    menuBox.innerHTML = "<p>Nenhum item encontrado!</p>";
    return;
  }

  console.log("ITEMS to SHEArch: ", itemsToSearch);
  const filteredItems = groupItemsByType(itemsToSearch);
  renderGroupedMenuItems(filteredItems);
}

setupMenuPage();
