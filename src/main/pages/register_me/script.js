import { createSnackBar, showSnackBar } from "/scripts/snackbar.js";

const registerForm = document.querySelector(".form");
const submitBtn = document.querySelector("#submitBtn");

const businessId = localStorage.getItem("b");

registerForm.addEventListener("submit", submitForm);

async function submitForm(e) {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerHTML = "Continuar <div class='loading'></div>";

  const name = document.querySelector("#name").value;

  try {
    await fetch(`http://localhost:3000/api/v1/employee`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        role: "manager",
        password: "any_password",
        businessId,
      }),
    });

    const response = await fetch(`http://localhost:3000/api/v1/session`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        businessId,
        role: "manager",
      }),
    });

    console.log(response.ok);
    if (!response.ok) {
      throw 400;
    }
    const responseBody = await response.json();
    console.log(responseBody);

    window.location.href = `http://localhost:3000/register-employees`;
  } catch (err) {
    console.error(err);
    showSnackBar(
      "error",
      "<p>Erro ao fazer o registro. <br /> Tente novamente.</p>",
    );
    submitBtn.textContent = "Continuar";
    submitBtn.disabled = false;
  }
}

createSnackBar();
