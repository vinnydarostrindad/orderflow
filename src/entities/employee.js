import generateID from "../utils/generateID.js";
import hashPassword from "../utils/hashPassword.js";

export default class Employee {
  constructor(id, business_id, name, password, role) {
    this.id = id;
    this.business_id = business_id;
    this.name = name;
    this.password = password;
    this.role = role;
  }

  static async create(business_id, name, password, role) {
    const id = generateID();
    const hashedPassword = await hashPassword(password);
    return new Employee(id, business_id, name, hashedPassword, role);
  }
}
