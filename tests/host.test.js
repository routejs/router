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
    .get("/ok", function (req, res, next) {
      next();
    });

  app.domain("{name}.localhost:3000", function (router) {
    router
      .get("/", function (req, res) {
        res.end("Never called");
      })
      .get("/ok", function (req, res) {
        res.end("Ok");
      })
      .get("/subdomain/params", function (req, res) {
        res.end(req.subdomains.name);
      })
      .post("/", function (req, res) {
        res.end("POST");
      });
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

  test("POST /", async () => {
    await request(app.handler())
      .post("/")
      .expect(404)
      .then((res) => {
        expect(res.text).toBe("Page Not Found");
      });
  });

  test("GET /", async () => {
    await request(app.handler())
      .get("/")
      .set("Host", "www.localhost:3000")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("GET /ok", async () => {
    await request(app.handler())
      .get("/ok")
      .set("Host", "www.localhost:3000")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /subdomain/params", async () => {
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.localhost:3000")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("www");
      });
  });

  test("POST /", async () => {
    await request(app.handler())
      .post("/")
      .set("Host", "www.localhost:3000")
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
