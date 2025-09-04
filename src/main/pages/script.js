import "/components/snackbar.js";
import API_URL from "/scripts/config-api-url.js";

const registerForm = document.querySelector(".form");
const submitBtn = document.querySelector("#submitBtn");
const snackbar = document.querySelector("#snackbar");

registerForm.addEventListener("submit", submitForm);

async function submitForm(e) {
  e.preventDefault();

  submitBtn.classList.add("form__btn--loading");
  submitBtn.disabled = true;
  submitBtn.firstElementChild.textContent = "Registrando";

  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  try {
    const response = await fetch(`${API_URL}/api/v1/business`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
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
    console.log(responseBody);

    submitBtn.classList.remove("form__btn--loading");
    submitBtn.firstElementChild.textContent = "Registrar";
    submitBtn.disabled = false;

    localStorage.setItem("b", responseBody.id);
    window.location.href = `/register-me`;
  } catch (err) {
    console.error(err);
    snackbar.show(
      "error",
      "<p>Erro ao fazer o registro. <br /> Tente novamente.</p>",
    );

    submitBtn.classList.remove("form__btn--loading");
    submitBtn.firstElementChild.textContent = "Registrar";
    submitBtn.disabled = false;
  }
}
