import { createSnackBar, showSnackBar } from "/scripts/snackbar.js";

const registerForm = document.querySelector(".form");
const submitBtn = document.querySelector("#submitBtn");

registerForm.addEventListener("submit", submitForm);

async function submitForm(e) {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerHTML = "Registrando <div class='loading'></div>";

  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

  try {
    const response = await fetch("http://localhost:3000/api/v1/business", {
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
      throw 400;
    }
    const responseBody = await response.json();
    console.log(responseBody);

    localStorage.setItem("b", responseBody.id);
    window.location.href = `http://localhost:3000/register-me`;
  } catch (err) {
    console.error(err);
    showSnackBar(
      "error",
      "<p>Erro ao fazer o registro. <br /> Tente novamente.</p>",
    );
    submitBtn.textContent = "Registrar";
    submitBtn.disabled = false;
  }
}

createSnackBar();
