import { spawn } from "node:child_process";
import { query } from "../infra/database.js";

function startServer() {
  let serverProcess = spawn("node", ["server.js"]);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Servidor não iniciado"));
    }, 5000);

    serverProcess.stdout.on("data", (buf) => {
      if (buf.toString().includes("Servidor funcionando")) {
        clearTimeout(timeout);
        resolve(serverProcess);
      }
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("Error do servidor:", data.toString());
    });
  });
}

function endServer(serverProcess) {
  serverProcess.kill();
}

async function cleanDatabase() {
  await query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
}

async function runMigrations() {
  await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
}

export { startServer, endServer, cleanDatabase, runMigrations };
