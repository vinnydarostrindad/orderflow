import generateID from "../utils/generateID.js";
import hashPassword from "../utils/hashPassword.js";

export default class Business {
  constructor(id, name, email, password) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  static async create(name, email, password) {
    const id = generateID();
    const hashedPassword = await hashPassword(password);

    return new Business(id, name, email, hashedPassword);
  }
}
