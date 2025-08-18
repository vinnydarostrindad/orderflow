import { parseJsonBody, parseMultipartBody } from "../helper/parse-body.js";

async function nodeRequestAdapter(req, groups = {}, authObj) {
  const contentType = req.headers["content-type"]?.split(";")[0];
  const method = req.method;
  let body = {};
  let params = { ...groups };
  const auth = authObj ? authObj.employeeData : {};

  if (req.method === "POST") {
    if (contentType === "multipart/form-data") {
      body = await parseMultipartBody(req);
    } else if (contentType === "application/json") {
      body = await parseJsonBody(req);
    }
  }

  const httpRequest = {
    method,
    body,
    params,
    auth,
  };

  return httpRequest;
}

export default nodeRequestAdapter;
