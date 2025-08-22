import getCookies from "../helper/get-cookies.js";
import jsonWebToken from "../../utils/jwt.js";

function authMiddleware(req, routeInfoObj) {
  if (!routeInfoObj) return null;

  const cookies = getCookies(req.headers.cookie);

  if (!cookies) {
    if (!routeInfoObj.role) {
      return {
        auth: true,
        empmloyeeData: {},
      };
    }

    return {
      auth: false,
      employeeData: {},
    };
  }

  const token = cookies.token;
  if (token) {
    const employeeData = jsonWebToken.verify(token);
    if (!routeInfoObj.role) {
      return {
        auth: true,
        employeeData,
      };
    }

    if (employeeData.role === routeInfoObj.role) {
      return {
        auth: true,
        employeeData,
      };
    }
    return {
      auth: false,
      employeeData,
    };
  }

  return {
    auth: false,
    employeeData: {},
  };
}

export default authMiddleware;
