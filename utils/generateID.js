import { randomUUID } from "node:crypto";

function generateID() {
  return randomUUID();
}

export default generateID;
