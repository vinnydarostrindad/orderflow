import ServerError from "../utils/errors/server-error.js";
import MethodNotAllowedError from "../utils/errors/method-not-allowed-error.js";
import NotFoundError from "../utils/errors/not-found-error.js";

const httpResponse = {
  created(data) {
    return {
      statusCode: 201,
      body: data,
    };
  },

  ok(data) {
    return {
      statusCode: 200,
      body: data,
    };
  },

  badRequest(error) {
    return {
      statusCode: 400,
      body: error,
    };
  },

  notFound(resource) {
    return {
      statusCode: 404,
      body: new NotFoundError(resource),
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
};

export default httpResponse;
