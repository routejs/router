const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Routing test", () => {
  const app = new Router();

  app
    .use(function (req, res, next) {
      next();
    })
    .get("/", function (req, res) {
      res.end("GET");
    })
    .get("/", function (req, res) {
      res.end("Never called");
    })
    .put("/", function (req, res, next) {
      next();
    })
    .put("/", function (req, res) {
      res.end("PUT");
    })
    .post("/", function (req, res) {
      res.end("POST");
    });

  app.delete("/", function (req, res) {
    res.end("DELETE");
  });

  app
    .any(["get", "post"], "/any", function (req, res) {
      res.end(req.method.toUpperCase());
    })
    .setName("any");

  app
    .get("/params/:name([A-Za-z]+)/:id", function (req, res) {
      res.end(`${req.params.name},${req.params.id}`);
    })
    .setName("params")
    .get("/digit/:id(\\d+)", function (req, res) {
      res.end(req.params.id);
    })
    .setName("digit");

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

  test("GET /any", async () => {
    await request(app.handler())
      .get("/any")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("POST /any", async () => {
    await request(app.handler())
      .post("/any")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
      });
  });

  test("PUT /any", async () => {
    await request(app.handler()).put("/any").expect(404);
  });

  test("Page Not Found", async () => {
    await request(app.handler()).get("/home").expect(404);
  });

  test("Get route url", () => {
    expect(app.route("params", { name: "abc", id: 10 })).toBe("/params/abc/10");
  });

  test("Get route url", () => {
    expect(app.route("digit", { id: 10 })).toBe("/digit/10");
  });

  test("Get route url", () => {
    expect(app.route("any")).toBe("/any");
  });
});
