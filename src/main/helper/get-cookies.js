function getCookies(cookies) {
  if (!cookies) return null;

  return Object.fromEntries(
    cookies.split(";").map((cookie) => {
      return cookie.split("=");
    }),
  );
}

export default getCookies;
