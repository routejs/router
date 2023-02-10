const request = require("supertest");
const { Router } = require("../index");

describe("Middleware test", () => {
  const app = new Router();
  const blog = new Router();

  app.use(
    "/multiple",
    function (req, res, next) {
      res.write("Ok");
      next();
    },
    function (req, res, next) {
      res.end();
    }
  );

  app.use("/home", function (req, res, next) {
    res.write("Ok");
    next();
  });

  app.get("/home", function (req, res, next) {
    res.end();
  });

  app.use("/params/{name}", function (req, res, next) {
    res.write(req.params.name);
    next();
  });

  app.get("/params/{name}", function (req, res, next) {
    res.end();
  });

  blog.get("/", function (req, res, next) {
    res.end("Ok");
  });

  app.use("/blog", blog);
  app.use("/urls", blog.routes());

  test("GET /multiple", async () => {
    await request(app.handler())
      .get("/multiple")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /home", async () => {
    await request(app.handler())
      .get("/home")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /params/user", async () => {
    await request(app.handler())
      .get("/params/user")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user");
      });
  });

  test("GET /blog", async () => {
    await request(app.handler())
      .get("/blog")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /urls", async () => {
    await request(app.handler())
      .get("/urls")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });
});
