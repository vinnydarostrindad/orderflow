import "/components/snackbar.js";

const registerForm = document.querySelector(".form");
const submitBtn = document.querySelector("#submitBtn");
const snackbar = document.querySelector("#snackbar");

const businessId = localStorage.getItem("b");

registerForm.addEventListener("submit", submitForm);

async function submitForm(e) {
  e.preventDefault();

  submitBtn.classList.add("form__btn--loading");
  submitBtn.disabled = true;
  submitBtn.firstElementChild.textContent = "Continuando";

  const name = document.querySelector("#name").value;

  try {
    await fetch(`https://orderflow-0pj4.onrender.com/api/v1/employee`, {
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

    const response = await fetch(
      `https://orderflow-0pj4.onrender.com/api/v1/session`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          businessId,
          role: "manager",
        }),
      },
    );

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
    submitBtn.disabled = false;
    submitBtn.firstElementChild.textContent = "Continuar";

    window.location.href = `https://orderflow-0pj4.onrender.com/register-employees`;
  } catch (err) {
    console.error(err);
    snackbar.show(
      "error",
      "<p>Erro ao fazer o registro. <br /> Tente novamente.</p>",
    );

    submitBtn.classList.remove("form__btn--loading");
    submitBtn.disabled = false;
    submitBtn.firstElementChild.textContent = "Continuar";
  }
}
