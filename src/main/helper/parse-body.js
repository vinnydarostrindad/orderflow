async function parseBody(req) {
  const parsedBody = await new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      if (!body) return resolve({});

      try {
        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", reject);
  });

  return parsedBody;
}

export default parseBody;
