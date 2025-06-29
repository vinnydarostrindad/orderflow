async function parseJsonBody(req) {
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

async function parseMultipartBody(req) {
  const contentType = req.headers["content-type"];

  const boundary = contentType.split("boundary=")[1];

  const parsedBody = await new Promise((resolve, reject) => {
    let chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      if (!chunks.length) return resolve({});

      try {
        const body = Buffer.concat(chunks);
        const bodyStr = body.toString("latin1");

        const parts = bodyStr.split(`--${boundary}`);
        const values = {};

        parts.forEach((part) => {
          if (!part || part === "--\r\n" || part === "--") return;

          const headerEnd = part.indexOf("\r\n\r\n");
          if (headerEnd === -1) return;

          const rawHeaders = part.slice(0, headerEnd);
          const contentStart = headerEnd + 4;

          const partIndex = bodyStr.indexOf(part);
          const contentIndex = partIndex + contentStart;

          let contentEndInPart = part.length;
          if (part.endsWith("\r\n")) {
            contentEndInPart -= 2;
          }
          const contentLength = contentEndInPart - contentStart;

          const contentBuffer = body.slice(
            contentIndex,
            contentIndex + contentLength,
          );

          const headersLines = rawHeaders.split("\r\n");
          let fieldName = null;
          let fileName = null;
          let contentType = null;

          headersLines.forEach((header) => {
            if (header.startsWith("Content-Disposition")) {
              const nameMatch = header.match(/name="([^"]+)"/);
              const fileMatch = header.match(/filename="([^"]+)"/);
              if (nameMatch) fieldName = nameMatch[1];
              if (fileMatch) fileName = fileMatch[1];
            }
            if (header.startsWith("Content-Type")) {
              contentType = header.split(":")[1].trim();
            }
          });

          if (!fieldName) return;

          if (fileName) {
            values[fieldName] = {
              fileName,
              contentType,
              content: contentBuffer,
            };
          } else {
            values[fieldName] = contentBuffer.toString("utf-8");
          }
        });

        resolve(values);
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", reject);
  });

  return parsedBody;
}

export { parseJsonBody, parseMultipartBody };
