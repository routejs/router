const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Middleware test", () => {
  const app = new Router();
  const blog = new Router();
  const group = new Router();

  app
    .use(function (req, res, next) {
      next();
    })
    .use(
      function (req, res, next) {
        next();
      },
      function (req, res, next) {
        next();
      }
    );

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

  app.get("/home", function (req, res) {
    res.end();
  });

  app.use("/params/{name}", function (req, res, next) {
    res.write(req.params.name);
    next();
  });

  app.get("/params/{name}", function (req, res) {
    res.end();
  });

  blog.get("/", function (req, res) {
    res.end("Ok");
  });

  app.use("/blog", blog);
  app.use("/urls", blog.routes());

  group.get("/", function (req, res) {
    res.end(req.params.name);
  });

  app.use("/group/{name}", group);

  app.get("/error", function (req, res) {
    throw new Error("Ok");
  });

  app.use(function (err, req, res, next) {
    res.end(err.message);
  });

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

  test("GET /error", async () => {
    await request(app.handler())
      .get("/error")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /group/user", async () => {
    await request(app.handler())
      .get("/group/user")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user");
      });
  });
});
