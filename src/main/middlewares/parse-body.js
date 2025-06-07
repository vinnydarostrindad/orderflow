async function parseBody(req) {
  console.log(req.headers);

  const parsedBody = await new Promise((resolve, reject) => {
    let body = "";
    try {
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      });

      req.on("error", reject);
    } catch (err) {
      console.error(err);
    }
  });

  return parsedBody;
}

export default parseBody;
