import { exec } from "node:child_process";

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.includes("accepting connections") === false) {
      process.stdout.write(".");
      checkPostgres();
      return;
    }

    console.log("\n🟢 Postgres está pronto e aceitando conexões\n");
  }
}

process.stdout.write("\n\n🔴 Aguardando postgres aceitar conexões");
checkPostgres();
