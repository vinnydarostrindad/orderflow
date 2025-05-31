import { randomUUID } from "node:crypto";

const idGenerator = {
  execute() {
    return randomUUID();
  },
};

export default idGenerator;

// import { randomUUID } from "node:crypto";

// function generateID() {
//   return randomUUID();
// }

// export default generateID;
