import postgresAdaptor from "../../infra/adaptors/postgres-adapter.js";

async function cleanDatabase() {
  await postgresAdaptor.query(
    "DROP SCHEMA public CASCADE; CREATE SCHEMA public;",
  );
}

async function runMigrations() {
  await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
}

async function createBusiness() {
  const response = await fetch("http://localhost:3000/api/v1/business", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "any_name",
      email: "any_email@mail.com",
      password: "any_password",
    }),
  });

  return await response.json().then((obj) => obj.business);
}

async function createEmployee(business_id, quantity = 1) {
  let employees = [];
  for (let i = 0; i < quantity; i++) {
    const response = await fetch(
      `http://localhost:3000/api/v1/business/${business_id}/employee`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "any_name",
          role: "waiter",
          password: "any_password",
        }),
      },
    );

    employees.push(await response.json().then((obj) => obj.employee));
  }
  return quantity === 1 ? employees[0] : employees;
}

export { cleanDatabase, runMigrations, createBusiness, createEmployee };
