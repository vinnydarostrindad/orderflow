import MissingParamError from "../../utils/errors/missing-param-error";
import sut from "../../utils/crypto.js";

describe("Crypto", () => {
  test("Should throw if no password is provided", () => {
    expect(sut.hash).toThrow(new MissingParamError("password"));
  });
});
