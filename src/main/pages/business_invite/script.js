document.forms[0].onsubmit = async (e) => {
  e.preventDefault();

  const name = document.querySelector("#name").value;
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;

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

  const responseBody = await response.json();

  console.log(responseBody);

  window.location.href = `http://localhost:5500/src/main/pages/register_employee/index.html?businessId=${responseBody.business.id}`;
};
