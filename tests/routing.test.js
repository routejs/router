const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Routing test", () => {
  test("GET /", async () => {
    const app = new Router();
    app
      .use(function (req, res, next) {
        next();
      })
      .get("/", function (req, res) {
        res.end("GET");
      })
      .post("/", function (req, res) {
        res.end("POST");
      })
      .use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });
    await request(app.handler())
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("POST /", async () => {
    const app = new Router();
    app
      .get("/", function (req, res) {
        res.end("GET");
      })
      .post("/", function (req, res) {
        res.end("POST");
      });
    await request(app.handler())
      .post("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
      });
  });

  test("PUT /", async () => {
    const app = new Router();
    app
      .get("/", function (req, res) {
        res.end("GET");
      })
      .put("/", function (req, res) {
        res.end("PUT");
      });
    await request(app.handler())
      .put("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("PUT");
      });
  });

  test("DELETE /", async () => {
    const app = new Router();
    app
      .get("/", function (req, res) {
        res.end("GET");
      })
      .delete("/", function (req, res) {
        res.end("DELETE");
      });
    await request(app.handler())
      .delete("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("DELETE");
      });
  });

  test("Not found /", async () => {
    const app = new Router();
    app
      .get("/", function (req, res) {
        res.end("GET");
      })
      .post("/", function (req, res) {
        res.end("POST");
      })
      .use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });
    await request(app.handler()).delete("/").expect(404);
  });

  test("Params /:name", async () => {
    const app = new Router();
    app
      .get("/", function (req, res) {
        res.end("GET");
      })
      .get("/:name", function (req, res) {
        res.end(`${req.params.name}`);
      });
    await request(app.handler())
      .get("/abc")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("abc");
      });
  });

  test("Route name", async () => {
    const app = new Router();
    app
      .get("/test", function (req, res) {
        res.end(app.route("name"));
      })
      .setName("name");
    await request(app.handler())
      .get("/test")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("/test");
      });
  });

  test("Route name", async () => {
    const app = new Router();
    app
      .get("/:name", function (req, res) {
        res.end(app.route("name", { name: "abc" }));
      })
      .setName("name");
    await request(app.handler())
      .get("/test")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("/abc");
      });
  });

  test("Route name", async () => {
    const app = new Router();
    app
      .get("/:name/user/:id(\\d+)/(\\d+)/*", function (req, res) {
        res.end(
          app.route("name", { name: "abc", id: 123, 0: 10, 1: "test/abc" })
        );
      })
      .setName("name");
    await request(app.handler())
      .get("/abc/user/123/10/test/abc")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("/abc/user/123/10/test/abc");
      });
  });

  test("Route name throw error", async () => {
    const app = new Router();
    app
      .get("/:name/user/:id(\\d+)/(\\d+)/*", function (req, res) {
        res.end(app.route("name", { name: "abc", id: 123, 0: 10 }));
      })
      .setName("name")
      .use(function (err, req, res, next) {
        res.writeHead(500).end(err.message);
      });
    await request(app.handler())
      .get("/abc/user/123/10/test/abc")
      .expect(500)
      .then((res) => {
        expect(res.text).toBe(
          "invalid route parameters, please provide all route parameters"
        );
      });
  });

  test("GET /any", async () => {
    const app = new Router();
    app.any(["get", "post"], "/any", function (req, res) {
      res.end("any");
    });
    await request(app.handler())
      .get("/any")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("any");
      });
  });

  test("GET /all", async () => {
    const app = new Router();
    app.all("/all", function (req, res) {
      res.end("all");
    });
    await request(app.handler())
      .post("/all")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("all");
      });
  });
});
