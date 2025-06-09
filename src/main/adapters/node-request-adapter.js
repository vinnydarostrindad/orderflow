import parseBody from "../helper/parse-body.js";

async function nodeRequestAdapter(req, groups = {}) {
  const { method } = req;
  let body = {};
  let params = { ...groups };

  if (req.method === "POST") {
    body = await parseBody(req);
  }

  const httpRequest = {
    method,
    body,
    params,
  };

  return httpRequest;
}

export default nodeRequestAdapter;
