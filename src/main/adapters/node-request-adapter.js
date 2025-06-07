import parseBody from "../helper/parse-body.js";

async function adaptNodeRequest(req, matchs = []) {
  const { method } = req;
  let body = {};
  let params = {};

  if (req.method === "POST") {
    body = await parseBody(req);
  }

  if (matchs.length > 0) {
    params.business_id = matchs[0];
    if (matchs[1]) params.employee_id = matchs[1];
  }

  const httpRequest = {
    method,
    body,
    params,
  };

  return httpRequest;
}

export default adaptNodeRequest;
