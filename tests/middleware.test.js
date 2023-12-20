const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Middleware test", () => {
  test("GET /", async () => {
    const app = new Router();
    app.use(function (req, res, next) {
      req.counter = 0;
      next();
    });
    app.use(function (req, res, next) {
      req.counter = req.counter + 1;
      next();
    });
    app.use(
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      }
    );

    app.get(
      "/",
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res) {
        res.end(`${req.counter}`);
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler())
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("4");
      });
  });

  test("GET / params", async () => {
    const app = new Router();
    app.use(function (req, res, next) {
      req.counter = 0;
      next();
    });
    app.use("/:name", function (req, res, next) {
      req.counter = req.counter + 1;
      next();
    });

    app.get(
      "/:name/params",
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res) {
        res.end(`${req.counter}`);
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler())
      .get("/name/params")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("2");
      });
  });

  test("GET / 404 page not found", async () => {
    const app = new Router();
    app.use(function (req, res, next) {
      req.counter = 0;
      next();
    });
    app.use(function (req, res, next) {
      req.counter = req.counter + 1;
      next();
    });
    app.use(
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      }
    );

    app.get(
      "/",
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res, next) {
        next();
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/").expect(404);
  });

  test("GET / error handler middleware", async () => {
    const app = new Router();
    app.use(function (req, res, next) {
      req.counter = 0;
      next();
    });
    app.use(function (req, res, next) {
      req.counter = req.counter + 1;
      next();
    });
    app.use(
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      }
    );

    app.get(
      "/",
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res) {
        throw new Error("Test error");
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    app.use(function (err, req, res, next) {
      res.writeHead(500).end(err.message);
    });

    await request(app.handler()).get("/").expect(500);
  });

  test("GET *", async () => {
    const app = new Router();
    app.use(function (req, res, next) {
      req.counter = 0;
      next();
    });
    app.use("*", function (req, res, next) {
      req.counter = req.counter + 1;
      next();
    });

    app.get(
      "/:name/params",
      function (req, res, next) {
        req.counter = req.counter + 1;
        next();
      },
      function (req, res) {
        res.end(`${req.counter}`);
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler())
      .get("/name/params")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("2");
      });
  });
});
