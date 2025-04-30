import hashPassword from "../utils/hashPassword.js";
import generateID from "../utils/generateID.js";

async function registerEmployee({ role, name, password }) {
  if (!role || !name || !password) throw new Error("Preencha todos os campos");

  const id = generateID();
  const hashedPassword = await hashPassword(password).then((derivedKey) =>
    derivedKey.toString("hex"),
  );

  const response = {
    id,
    // business_id,
    role,
    name,
    password: hashedPassword,
    created_at: new Date(),
    updated_at: new Date(),
  };

  return response;
}

export default registerEmployee;
