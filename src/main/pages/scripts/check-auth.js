(function checkAuth() {
  if (!document.cookie.includes("token")) {
    window.location.reload();
  }
})();
