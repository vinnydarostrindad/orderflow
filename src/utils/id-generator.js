import { randomUUID } from "node:crypto";

const idGenerator = {
  execute() {
    return randomUUID();
  },
};

export default idGenerator;
