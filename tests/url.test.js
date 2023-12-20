const request = require("supertest");
const { Router, path, use, all } = require("../index.cjs");

describe("Routing test", () => {
  test("GET /", async () => {
    const app = new Router();
    const urls = [
      use(function (req, res, next) {
        next();
      }),
      path("get", "/", function (req, res) {
        res.end("GET");
      }),
      path("post", "/", function (req, res) {
        res.end("POST");
      }),
      use(function (req, res) {
        res.writeHead(404).end("Page not found");
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("POST /", async () => {
    const app = new Router();
    const urls = [
      path("get", "/", function (req, res) {
        res.end("GET");
      }),
      path("post", "/", function (req, res) {
        res.end("POST");
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .post("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
      });
  });

  test("PUT /", async () => {
    const app = new Router();
    const urls = [
      path("get", "/", function (req, res) {
        res.end("GET");
      }),
      path("put", "/", function (req, res) {
        res.end("PUT");
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .put("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("PUT");
      });
  });

  test("DELETE /", async () => {
    const app = new Router();
    const urls = [
      path("get", "/", function (req, res) {
        res.end("GET");
      }),
      path("delete", "/", function (req, res) {
        res.end("DELETE");
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .delete("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("DELETE");
      });
  });

  test("Not found /", async () => {
    const app = new Router();
    const urls = [
      path("get", "/", function (req, res) {
        res.end("GET");
      }),
      path("post", "/", function (req, res) {
        res.end("POST");
      }),
      use(function (req, res) {
        res.writeHead(404).end("Page not found");
      }),
    ];
    app.use(urls);
    await request(app.handler()).delete("/").expect(404);
  });

  test("Params /:name", async () => {
    const app = new Router();
    const urls = [
      path("get", "/", function (req, res) {
        res.end("GET");
      }),
      path("get", "/:name", function (req, res) {
        res.end(`${req.params.name}`);
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .get("/abc")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("abc");
      });
  });

  test("Route name", async () => {
    const app = new Router();
    const urls = [
      path("get", "/test", function (req, res) {
        res.end(app.route("name"));
      }).setName("name"),
    ];
    app.use(urls);
    await request(app.handler())
      .get("/test")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("/test");
      });
  });

  test("Route name", async () => {
    const app = new Router();
    const urls = [
      path("get", "/:name", function (req, res) {
        res.end(app.route("name", { name: "abc" }));
      }).setName("name"),
    ];
    app.use(urls);
    await request(app.handler())
      .get("/test")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("/abc");
      });
  });

  test("Route name", async () => {
    const app = new Router();
    const urls = [
      path("get", "/:name/user/:id(\\d+)/(\\d+)/*", function (req, res) {
        res.end(
          app.route("name", { name: "abc", id: 123, 0: 10, 1: "test/abc" })
        );
      }).setName("name"),
    ];
    app.use(urls);
    await request(app.handler())
      .get("/abc/user/123/10/test/abc")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("/abc/user/123/10/test/abc");
      });
  });

  test("Route name throw error", async () => {
    const app = new Router();
    const urls = [
      path("get", "/:name/user/:id(\\d+)/(\\d+)/*", function (req, res) {
        res.end(app.route("name", { name: "abc", id: 123, 0: 10 }));
      }).setName("name"),
      use(function (err, req, res, next) {
        res.writeHead(500).end(err.message);
      }),
    ];
    app.use(urls);
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
    const urls = [
      path(["get", "post"], "/any", function (req, res) {
        res.end("any");
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .get("/any")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("any");
      });
  });

  test("GET /all", async () => {
    const app = new Router();
    const urls = [
      all("/all", function (req, res) {
        res.end("all");
      }),
    ];
    app.use(urls);
    await request(app.handler())
      .post("/all")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("all");
      });
  });
});
