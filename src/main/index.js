import { createServer } from "node:http";
import router from "./router.js";

const PORT = process.env.PORT || 3000;

const server = createServer(router);

server.listen(PORT, () => {
  console.log(`Servidor funcionando em http://localhost:${PORT}`);
});
