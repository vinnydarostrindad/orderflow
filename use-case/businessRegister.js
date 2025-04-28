import { randomUUID, scrypt } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

async function registerBusiness({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Preencha todos os campos");
  }

  const id = generateID();
  const hashedPassword = await hashPassword(password);
  const response = {
    id,
    name,
    email,
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date(),
  };

  return response;
}

function generateID() {
  return randomUUID();
}

async function hashPassword(password) {
  const hashedPassword = await scryptAsync(password, "salt", 64);

  return hashedPassword.toString("hex");
}

export default registerBusiness;
