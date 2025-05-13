test("GET / deve retornar 200 e o HTML", async () => {
  const response = await fetch("http://localhost:3000");

  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toMatch(/text\/html/);

  const responseBody = await response.text();

  expect(responseBody).toContain("<!doctype html>");
});
