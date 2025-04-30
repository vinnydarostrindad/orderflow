import hashPassword from "../utils/hashPassword.js";
import generateID from "../utils/generateID.js";

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

export default registerBusiness;
