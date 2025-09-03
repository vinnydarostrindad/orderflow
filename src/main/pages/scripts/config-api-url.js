const isLocal = window.location.hostname === "localhost";

export default isLocal
  ? "http://localhost:3000"
  : "https://orderflow-0pj4.onrender.com";
