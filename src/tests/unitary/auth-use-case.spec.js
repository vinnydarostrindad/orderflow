import MissingParamError from "../../utils/errors/missing-param-error.js";
import AuthUseCase from "../../domain/usecase/auth-usecase.js";

const makeSut = () => {
  const jwtSpy = makeJwt();
  const sut = new AuthUseCase({ jwt: jwtSpy });
  return {
    sut,
    jwtSpy,
  };
};

const makeJwt = () => {
  const jwtSpy = {
    sign(id, secret) {
      this.id = id;
      this.secret = secret;
      return this.token;
    },
  };

  jwtSpy.token = "any_token";
  return jwtSpy;
};

const makeJwtWithError = () => {
  const jwtWithErrorSpy = {
    sign() {
      throw new Error();
    },
  };

  return jwtWithErrorSpy;
};

describe("Auth Usecase", () => {
  describe("inRegister method", () => {
    test("Should throw if no id is provided", () => {
      const { sut } = makeSut();
      expect(() => sut.inRegister()).toThrow(new MissingParamError("id"));
    });

    test("Should call jwt.sign with the correct values", () => {
      const { sut, jwtSpy } = makeSut();
      sut.inRegister("any_id");
      expect(jwtSpy.id).toBe("any_id");
      expect(jwtSpy.secret).toBe("secret");
    });

    test("Should return token correctly", () => {
      const { sut } = makeSut();
      const token = sut.inRegister("any_id");
      expect(token).toBe("any_token");
    });

    test("Should throw if invalid dependencies are provided", () => {
      const suts = [
        new AuthUseCase(),
        new AuthUseCase({}),
        new AuthUseCase({
          jwt: {},
        }),
      ];

      for (const sut of suts) {
        expect(() => sut.inRegister("any_id")).toThrow(TypeError);
      }
    });

    test("Should throw if dependencies throws", () => {
      const suts = [
        new AuthUseCase({
          jwt: makeJwtWithError(),
        }),
      ];

      for (const sut of suts) {
        expect(() => sut.inRegister("any_id")).toThrow();
      }
    });
  });
});
