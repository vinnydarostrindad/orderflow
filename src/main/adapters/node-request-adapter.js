import { parseJsonBody, parseMultipartBody } from "../helper/parse-body.js";

async function nodeRequestAdapter(req, groups = {}) {
  const contentType = req.headers["content-type"]?.split(";")[0];
  const { method } = req;
  let body = {};
  let params = { ...groups };

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
  };

  return httpRequest;
}

export default nodeRequestAdapter;
