import ServerError from "../utils/errors/server-error.js";

const httpResponse = {
  badRequest(error) {
    return {
      statusCode: 400,
      body: error,
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
