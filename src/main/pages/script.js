const registerForm = document.querySelector(".register-form");
const submitBtn = document.querySelector("#submitBtn");
const snackbar = document.querySelector(".snackbar");

let timeoutId;

registerForm.addEventListener("submit", submitForm);

function showErrorSnackBar() {
  if (timeoutId) clearTimeout(timeoutId);

  snackbar.innerHTML =
    "<p>Erro ao fazer o registro. <br /> Tente novamente.</p>";
  snackbar.classList.remove("snackbar--hidden");
  snackbar.setAttribute("aria-hidden", "false");

  timeoutId = setTimeout(() => {
    snackbar.classList.add("snackbar--hidden");
    snackbar.setAttribute("aria-hidden", "true");
    snackbar.addEventListener(
      "transitionend",
      () => {
        snackbar.innerHTML = "";
      },
      { once: true },
    );
  }, 5000);
}

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
    const responseBody = await response.json();
    console.log(responseBody);

    window.location.href = `http://localhost:5500/src/main/pages/register_employee/index.html?b=${responseBody.business.id}`;
  } catch (err) {
    console.error(err);
    showErrorSnackBar();
    submitBtn.textContent = "Registrar";
    submitBtn.disabled = false;
  }
}
