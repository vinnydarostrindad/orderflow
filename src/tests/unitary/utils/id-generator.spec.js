import { jest } from "@jest/globals";

jest.unstable_mockModule("node:crypto", () => ({
  randomUUID() {
    return "any_id";
  },
}));

const sut = (await import("../../../utils/id-generator.js")).default;
describe("Id Generator", () => {
  test("Should return id", () => {
    const id = sut.execute();
    expect(id).toBe("any_id");
  });
});
