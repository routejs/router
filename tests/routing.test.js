const request = require("supertest");
const { Router } = require("../index");

describe("Routing test", () => {
  const app = new Router();

  app.get("/", function (req, res) {
    res.end("GET");
  });

  app.get("/", function (req, res) {
    res.end("GET");
  });

  app.get("/params/:name", function (req, res) {
    res.end(req.params.name);
  });

  app.post("/", function (req, res) {
    res.end("POST");
  });

  app.put("/", function (req, res) {
    res.end("PUT");
  });

  app.delete("/", function (req, res) {
    res.end("DELETE");
  });

  app.use(function (req, res) {
    res.writeHead(404).end("Page Not Found");
  });

  test("GET /", async () => {
    await request(app.handler())
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("GET /params/testing", async () => {
    await request(app.handler())
      .get("/params/testing")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("testing");
      });
  });

  test("POST /", async () => {
    await request(app.handler())
      .post("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
      });
  });

  test("PUT /", async () => {
    await request(app.handler())
      .put("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("PUT");
      });
  });

  test("DELETE /", async () => {
    await request(app.handler())
      .delete("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("DELETE");
      });
  });

  test("Page Not Found", async () => {
    await request(app.handler())
      .get("/home")
      .expect(404)
      .then((res) => {
        expect(res.text).toBe("Page Not Found");
      });
  });
});
