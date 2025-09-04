import "/components/snackbar.js";
import API_URL from "/scripts/config-api-url.js";

const registerForm = document.querySelector(".form");
const submitBtn = document.querySelector("#submitBtn");
const nameInput = document.querySelector("#name");
const roleSelect = document.querySelector("#role");
const businessIdInput = document.querySelector("#businessId");
const snackbar = document.querySelector("#snackbar");

const params = new URLSearchParams(window.location.search);
const urlBusinessId = params.get("b");

registerForm.addEventListener("submit", submitForm);

if (urlBusinessId) businessIdInput.value = urlBusinessId;

async function submitForm(e) {
  e.preventDefault();

  submitBtn.classList.add("form__btn--loading");
  submitBtn.disabled = true;
  submitBtn.firstElementChild.textContent = "Entrando";

  const name = nameInput.value;
  const businessId = businessIdInput.value;
  const role = roleSelect.value;

  try {
    const response = await fetch(`${API_URL}/api/v1/session`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        role,
        businessId,
      }),
    });

    if (!response.ok) {
      const { status, statusText, url } = response;
      throw {
        status,
        statusText,
        url,
      };
    }

    await response.json();

    submitBtn.classList.remove("form__btn--loading");
    submitBtn.disabled = false;
    submitBtn.firstElementChild.textContent = "Entrar";
    redirectUser(role);
  } catch (err) {
    console.error(err);
    switch (err.status) {
      case 401:
        snackbar.show(
          "error",
          "<p>Acesso não autorizado. <br /> Tente novamente.</p>",
        );
        break;
      default:
        snackbar.show(
          "error",
          "<p>Erro ao tentar entrar. <br /> Tente novamente.</p>",
        );
        break;
    }

    submitBtn.classList.remove("form__btn--loading");
    submitBtn.firstElementChild.textContent = "Entrar";
    submitBtn.disabled = false;
  }
}

function redirectUser(role) {
  switch (role) {
    case "manager":
      window.location.href = "/dashboard";
      break;
    case "waiter":
      window.location.href = "/menus";
      break;
    case "cook":
      window.location.href = "/cook";
      break;
    case "cashier":
      window.location.href = "/cashier";
      break;

    default:
      break;
  }
}
