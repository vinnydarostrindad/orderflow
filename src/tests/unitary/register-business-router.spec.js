import RegisterBusinessRouter from "../../presentation/routers/register-business-router";
import MissingParamError from "../../utils/errors/missing-param-error";

describe("Register Business Router", () => {
  test("Should return 400 if no name is provided", () => {
    const sut = new RegisterBusinessRouter();
    const httpRequest = {
      body: {
        email: "any_email@mail.com",
        password: "any_password",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("name"));
  });

  test("Should return 400 if no email is provided", () => {
    const sut = new RegisterBusinessRouter();
    const httpRequest = {
      body: {
        name: "any_name",
        password: "any_password",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("email"));
  });

  test("Should return 400 if no password is provided", () => {
    const sut = new RegisterBusinessRouter();
    const httpRequest = {
      body: {
        name: "any_name",
        email: "any_email@mail.com",
      },
    };
    const httpResponse = sut.route(httpRequest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("password"));
  });
});
