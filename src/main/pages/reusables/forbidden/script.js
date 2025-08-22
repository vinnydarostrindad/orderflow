const redirectBtn = document.querySelector("#redirectBtn");

redirectBtn.addEventListener("click", redirect);

function redirect(e) {
  e.preventDefault();

  switch (localStorage.getItem("role")) {
    case "waiter":
      window.location.href = "/waiter";
      break;

    case "cook":
      window.location.href = "/cook";
      break;

    case "cashier":
      window.location.href = "/cashier";
      break;

    default:
      console.log("WOW");
      break;
  }
}
