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

  app.get("{name}/dashboard", function (req, res) {
    res.end(req.params.name);
  });

  app.get("/params/{name}/{id}", function (req, res) {
    res.end(`${req.params.name},${req.params.id}`);
  });

  app.get("/digit/{id:(\\d+)}", function (req, res) {
    res.end(req.params.id);
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

  app.any(["get", "post"], "/any", function (req, res) {
    res.end(req.method.toUpperCase());
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

  test("GET /user/dashboard", async () => {
    await request(app.handler())
      .get("/user/dashboard")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user");
      });
  });

  test("GET /params/user/1", async () => {
    await request(app.handler())
      .get("/params/user/1")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user,1");
      });
  });

  test("GET /digit/100", async () => {
    await request(app.handler())
      .get("/digit/100")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("100");
      });
  });

  test("GET /digit/a", async () => {
    await request(app.handler()).get("/digit/a").expect(404);
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
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("POST /any", async () => {
    await request(app.handler())
      .post("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
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
