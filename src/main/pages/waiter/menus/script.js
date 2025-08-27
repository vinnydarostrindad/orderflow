import "/waiter/components/nav/script.js";
import "/waiter/components/menu-card.js";
import "/components/header/script.js";
import "/components/snackbar.js";

const menusContainer = document.querySelector(".menus");
const snackbar = document.querySelector("#snackbar");

menusContainer.addEventListener("click", redirectToMenu);

function redirectToMenu(e) {
  const menuCard = e.target.closest("menu-card");
  if (!menuCard) return;

  const menuId = menuCard.dataset.id;
  if (!menuId) throw new Error("Cadê a porcaira do iID IDIOTA");

  window.location.href = `/menu/${menuId}`;
}

function addMenusToHTML(menus) {
  if (menus.length === 0) {
    menusHTML.innerHTML = "<p>Nenhum cardápio foi criado</p>";
  }

  const menusHTML = menus
    .map((menu) => {
      return `
      <menu-card
        name="${menu.name}"
        imgPath="/waiter/menus/img/menu-photo.jpeg"
        data-id="${menu.id}"
      ></menu-card>
    `;
    })
    .join("");

  menusContainer.innerHTML = menusHTML;
}

async function getMenus() {
  try {
    const response = await fetch("http://localhost:3000/api/v1/menu");
    if (!response.ok) {
      throw {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      };
    }

    const menus = await response.json();

    addMenusToHTML(menus);
  } catch (error) {
    console.error(error);
    snackbar.show(
      "error",
      "<p>Erro ao tentar obter cardápios <br> Tente novamente.</p>",
    );
  }
}

getMenus();
