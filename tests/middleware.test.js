const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Test middlewares", () => {
  test("It should call all middlewares", async () => {
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
        res.end(String(req.counter));
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/").expect(200, "4");
  });

  test("It should skip all pending callback middlewares", async () => {
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
        next("skip");
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
        res.end(String(req.counter));
      }
    );

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/").expect(200, "3");
  });

  describe("it should match params in middleware", () => {
    test("get route params in middleware", async () => {
      const app = new Router();
      app.use("/:name", function (req, res, next) {
        res.end(String(req.params.name + "," + req.params.id));
      });

      app.get("/:name/params/:id", function (req, res) {
        // skipped
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/name/params/10")
        .expect(200, "name,undefined");
    });

    test("get route params in route", async () => {
      const app = new Router();
      app.use("/:name", function (req, res, next) {
        next();
      });

      app.get("/:name/params/:id", function (req, res) {
        res.end(String(req.params.name + "," + req.params.id));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/name/params/10")
        .expect(200, "name,10");
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

      await request(app.handler()).get("/name/params").expect(200, "2");
    });
  });

  test("it should run all middleware if request is not handled", async () => {
    const app = new Router();
    app.use(function (req, res, next) {
      next();
    });
    app.use(function (req, res, next) {
      next();
    });
    app.use(
      function (req, res, next) {
        next();
      },
      function (req, res, next) {
        next();
      }
    );

    app.get("/", function (req, res, next) {
      next("skip");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/").expect(404, "Page not found");
  });

  test("it should catch errors in middleware", async () => {
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

    await request(app.handler()).get("/").expect(500, "Test error");
  });
});
