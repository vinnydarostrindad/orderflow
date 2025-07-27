let snackbarTimeoutId;
let snackbar;

function showSnackBar(type, html) {
  if (snackbarTimeoutId) {
    clearTimeout(snackbarTimeoutId);
  } else {
    snackbar.innerHTML = html;

    snackbar.classList.remove("snackbar--hidden");
    snackbar.classList.add(`snackbar--${type}`);
    snackbar.setAttribute("aria-hidden", "false");
  }

  snackbarTimeoutId = setTimeout(() => {
    snackbar.classList.add("snackbar--hidden");
    snackbar.addEventListener(
      "transitionend",
      () => {
        snackbar.classList.remove(`snackbar--${type}`);
        snackbar.setAttribute("aria-hidden", "true");
        snackbar.innerHTML = "";
        snackbarTimeoutId = undefined;
      },
      { once: true },
    );
  }, 5000);
}

function createSnackBar() {
  const snackbarDiv = document.createElement("div");
  snackbarDiv.setAttribute("class", "snackbar snackbar--hidden");
  snackbarDiv.setAttribute("aria-hidden", "true");
  snackbarDiv.setAttribute("aria-live", "polite");

  document.body.appendChild(snackbarDiv);

  snackbar = document.querySelector(".snackbar");
}

export { createSnackBar, showSnackBar };
