import ServerError from "../utils/errors/server-error.js";
import MethodNotAllowedError from "../utils/errors/method-not-allowed-error.js";

const httpResponse = {
  badRequest(error) {
    return {
      statusCode: 400,
      body: error,
    };
  },

  methodNotAllowed() {
    return {
      statusCode: 405,
      body: new MethodNotAllowedError(),
    };
  },

  serverError() {
    return {
      statusCode: 500,
      body: new ServerError(),
    };
  },

  created(entity) {
    return {
      statusCode: 201,
      body: entity,
    };
  },
  ok(data) {
    return {
      statusCode: 200,
      body: data,
    };
  },
};

export default httpResponse;
