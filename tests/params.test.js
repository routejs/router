const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Route params test", function () {
  describe("It should match route params", function () {
    test("GET /:name", async () => {
      const app = new Router();
      app.get("/:name", function (req, res) {
        res.end(req.params.name);
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler()).get("/abc").expect(200, "abc");
    });

    test("GET /image/:category/:name.:ext", async () => {
      const app = new Router();
      app.get("/image/:category/:name.:ext", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/image/animal/cat.png")
        .expect(
          200,
          JSON.stringify({ category: "animal", name: "cat", ext: "png" })
        );
    });
  });

  describe("Decode params", function () {
    test("It should decode the capture", async () => {
      const app = new Router();

      app.get("*", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      await request(app.handler())
        .get("/string/decode%20and%20capture")
        .expect(200, JSON.stringify({ 0: "/string/decode and capture" }));
    });

    test("It should decode correct params", async () => {
      const app = new Router();

      app.get("/:name", function (req, res) {
        res.end(String(req.params.name));
      });

      await request(app.handler()).get("/foo%2Fbar").expect(200, "foo/bar");
    });

    test("It should not accept params in malformed paths", async () => {
      const app = new Router();

      app.get("/:name", function (req, res) {
        res.end(String(req.params.name));
      });

      app.use(function (err, req, res, next) {
        res.writeHead(400).end(err.message);
      });

      await request(app.handler()).get("/%foobar").expect(400);
    });

    test("It should not decode spaces", async () => {
      const app = new Router();

      app.get("/:name", function (req, res) {
        res.end(String(req.params.name));
      });

      await request(app.handler()).get("/foo+bar").expect(200, "foo+bar");
    });

    test("It should work with unicode", async () => {
      const app = new Router();

      app.get("/:name", function (req, res) {
        res.end(String(req.params.name));
      });

      await request(app.handler()).get("/%ce%b1").expect(200, "\u03b1");
    });
  });

  describe("It should match optional params", function () {
    test("GET /:name?/:ext", async () => {
      const app = new Router();
      app.get("/:name?/:ext", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/cat/png")
        .expect(200, JSON.stringify({ name: "cat", ext: "png" }));
      await request(app.handler())
        .get("/cat")
        .expect(200, JSON.stringify({ ext: "cat" }));
      await request(app.handler()).get("/cat/png/abc").expect(404);
    });

    test("GET /:name/:ext?", async () => {
      const app = new Router();
      app.get("/:name/:ext?", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/cat/png")
        .expect(200, JSON.stringify({ name: "cat", ext: "png" }));
      await request(app.handler())
        .get("/cat")
        .expect(200, JSON.stringify({ name: "cat" }));
      await request(app.handler()).get("/cat/png/abc").expect(404);
    });

    test("GET /:name/:ext?/file", async () => {
      const app = new Router();
      app.get("/:name/:ext?/file", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/cat/png/file")
        .expect(200, JSON.stringify({ name: "cat", ext: "png" }));
      await request(app.handler())
        .get("/cat/file")
        .expect(200, JSON.stringify({ name: "cat" }));
      await request(app.handler()).get("/cat/png/abc").expect(404);
    });

    test("GET /image/:name.:ext?", async () => {
      const app = new Router();
      app.get("/image/:name.:ext?", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/image/cat.png")
        .expect(200, JSON.stringify({ name: "cat", ext: "png" }));
      await request(app.handler())
        .get("/image/cat.")
        .expect(200, JSON.stringify({ name: "cat" }));
      await request(app.handler()).get("/image/cat").expect(404);
    });

    test("GET /:name?.png", async () => {
      const app = new Router();
      app.get("/:name?.png", function (req, res) {
        res.end(JSON.stringify(req.params));
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler())
        .get("/cat.png")
        .expect(200, JSON.stringify({ name: "cat" }));
      await request(app.handler()).get("/.png").expect(200);
      await request(app.handler()).get("/cat").expect(404);
    });

    test("GET /abc?", async () => {
      const app = new Router();
      app.get("/abc?", function (req, res) {
        res.end("Ok");
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler()).get("/ab").expect(200);
      await request(app.handler()).get("/abc").expect(200);
      await request(app.handler()).get("/abcd").expect(404);
    });

    test("GET /abc?d", async () => {
      const app = new Router();
      app.get("/abc?d", function (req, res) {
        res.end("Ok");
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler()).get("/abd").expect(200);
      await request(app.handler()).get("/abcd").expect(200);
      await request(app.handler()).get("/abccd").expect(404);
    });

    test("GET /(abc)?d", async () => {
      const app = new Router();
      app.get("/(abc)?d", function (req, res) {
        res.end("Ok");
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });

      await request(app.handler()).get("/abcd").expect(200);
      await request(app.handler()).get("/d").expect(200);
      await request(app.handler()).get("/abccd").expect(404);
    });
  });

  test("GET /abc+", async () => {
    const app = new Router();
    app.get("/abc+", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abc").expect(200);
  });

  test("GET /abc+", async () => {
    const app = new Router();
    app.get("/abc+", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abcc").expect(200);
  });

  test("GET /abc+", async () => {
    const app = new Router();
    app.get("/abc+", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/ab").expect(404);
  });

  test("GET /abc+d", async () => {
    const app = new Router();
    app.get("/abc+d", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abcd").expect(200);
  });

  test("GET /abc+d", async () => {
    const app = new Router();
    app.get("/abc+d", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abccccd").expect(200);
  });

  test("GET /abc+d", async () => {
    const app = new Router();
    app.get("/abc+d", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abcccced").expect(404);
  });

  test("GET /abc+d", async () => {
    const app = new Router();
    app.get("/abc+d", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abd").expect(404);
  });

  test("GET /:name/*", async () => {
    const app = new Router();
    app.get("/:name/*", function (req, res) {
      res.end(req.params.name);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/abc/xyz/testing").expect(200, "abc");
  });

  test("GET /blog/*", async () => {
    const app = new Router();
    app.get("/blog/*", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog").expect(404);
  });

  test("GET /blog/*", async () => {
    const app = new Router();
    app.get("/blog/*", function (req, res) {
      res.end("Ok");
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog/category/slug").expect(200);
  });

  test("GET /blog/:id(\\d+)", async () => {
    const app = new Router();
    app.get("/blog/:id(\\d+)", function (req, res) {
      res.end(req.params.id);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog/12345").expect(200, "12345");
  });

  test("GET /blog/:id(\\d+)", async () => {
    const app = new Router();
    app.get("/blog/:id(\\d+)", function (req, res) {
      res.end(req.params.id);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog").expect(404);
  });

  test("GET /blog/:id(\\d+)", async () => {
    const app = new Router();
    app.get("/blog/:id(\\d+)", function (req, res) {
      res.end(req.params.id);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog/12345a").expect(404);
  });

  test("GET /blog/(\\d+)", async () => {
    const app = new Router();
    app.get("/blog/(\\d+)", function (req, res) {
      res.end(req.params[0]);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog/12345").expect(200, "12345");
  });

  test("GET /blog/(\\d+)", async () => {
    const app = new Router();
    app.get("/blog/(\\d+)", function (req, res) {
      res.end(req.params[0]);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog/").expect(404);
  });

  test("GET /blog/(\\d+)", async () => {
    const app = new Router();
    app.get("/blog/(\\d+)", function (req, res) {
      res.end(req.params[0]);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/blog/12345a").expect(404);
  });

  test("GET /image/:name.:ext", async () => {
    const app = new Router();
    app.get("/image/:name.:ext", function (req, res) {
      res.end(`${req.params.name}.${req.params.ext}`);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/image/cat.png").expect(200, "cat.png");
  });

  test("Param count /image/:name.:ext/(\\d+)/:id(\\d+)", async () => {
    const app = new Router();
    app.get("/image/:name.:ext/(\\d+)/:id(\\d+)", function (req, res) {
      res.end(`${Object.keys(req.params).length}`);
    });

    await request(app.handler()).get("/image/cat.png/0/1").expect(200, "4");
  });

  test("GET /\\(\\)[].\\:;\\+\\*", async () => {
    const app = new Router();
    app.get("/\\(\\)[].\\:;\\+\\*", function (req, res) {
      res.end(req.params[0]);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/()[].:;+*").expect(200);
  });

  test("Invalid regex /(?:(\\d+))", async () => {
    expect(function () {
      const app = new Router();
      app.get("/(?:(\\d+))", function (req, res) {
        res.end("Ok");
      });
    }).toThrow(TypeError);
  });

  test("Invalid regex /([A-Z]+(?:(\\d+)))", async () => {
    expect(function () {
      const app = new Router();
      app.get("/([A-Z]+(?:(\\d+)))", function (req, res) {
        res.end("Ok");
      });
    }).toThrow(TypeError);
  });

  test("Invalid regex /([A-Z]+(\\d+))", async () => {
    expect(function () {
      const app = new Router();
      app.get("/([A-Z]+(\\d+))", function (req, res) {
        res.end("Ok");
      });
    }).toThrow(TypeError);
  });

  test("Invalid regex /:name/*/(\\d+\\)", async () => {
    expect(function () {
      const app = new Router();
      app.get("/:name/*/(\\d+\\)", function (req, res) {
        res.end("Ok");
      });
    }).toThrow(TypeError);
  });

  test("should work with several", async () => {
    const app = new Router();

    app.get("/api/*.*", function (req, res) {
      const resource = req.params[0],
        format = req.params[1];
      res.end(resource + " as " + format);
    });

    await request(app.handler())
      .get("/api/users/foo.bar.json")
      .expect(200, "users/foo.bar as json");
  });

  test("should work cross-segment", async () => {
    const app = new Router();

    app.get("/api*", function (req, res) {
      res.end(req.params[0]);
    });

    await request(app.handler()).get("/api").expect(200, "");
    await request(app.handler()).get("/api/hey").expect(200, "/hey");
  });

  test("should allow naming", async () => {
    const app = new Router();

    app.get("/api/:resource(.*)", function (req, res) {
      const resource = req.params.resource;
      res.end(resource);
    });

    await request(app.handler())
      .get("/api/users/0.json")
      .expect(200, "users/0.json");
  });

  test("should not be greedy immediately after param", async () => {
    const app = new Router();

    app.get("/user/:user*", function (req, res) {
      res.end(req.params.user);
    });

    await request(app.handler()).get("/user/122").expect(200, "1");
  });

  test("should eat everything after /", async () => {
    const app = new Router();

    app.get("/user/:user*", function (req, res) {
      res.end(req.params.user);
    });

    await request(app.handler()).get("/user/122/aaa").expect(200, "1");
  });

  test("should span multiple segments", async () => {
    const app = new Router();

    app.get("/file/*", function (req, res) {
      res.end(req.params[0]);
    });

    await request(app.handler())
      .get("/file/javascripts/jquery.js")
      .expect(200, "javascripts/jquery.js");
  });

  test("should be optional", async () => {
    const app = new Router();

    app.get("/file/*", function (req, res) {
      res.end(req.params[0]);
    });

    await request(app.handler()).get("/file/").expect(200, "");
  });

  test("should require a preceding /", async () => {
    const app = new Router();

    app.get("/file/*", function (req, res) {
      res.end(req.params[0]);
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page Not Found");
    });

    await request(app.handler()).get("/file").expect(404);
  });

  test("should keep correct parameter indexes", async () => {
    const app = new Router();

    app.get("/*/user/:id", function (req, res) {
      res.end(JSON.stringify(req.params));
    });

    await request(app.handler())
      .get("/1/user/2")
      .expect(200, '{"0":"1","id":"2"}');
  });

  describe(":name", function () {
    test("should denote a capture group", async () => {
      const app = new Router();

      app.get("/user/:user", function (req, res) {
        res.end(req.params.user);
      });

      await request(app.handler()).get("/user/abc").expect(200, "abc");
    });

    test("should match a single segment only", async () => {
      const app = new Router();

      app.get("/user/:user", function (req, res) {
        res.end(req.params.user);
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page Not Found");
      });

      await request(app.handler()).get("/user/abc/edit").expect(404);
    });

    test("should allow several capture groups", async () => {
      const app = new Router();

      app.get("/user/:user/:op", function (req, res) {
        res.end(req.params.op + "ing " + req.params.user);
      });

      await request(app.handler())
        .get("/user/abc/edit")
        .expect(200, "editing abc");
    });

    test("should work following a partial capture group", async () => {
      const app = new Router();

      app.get("/user(s)?/:user/:op", function (req, res) {
        res.end(
          req.params.op +
            "ing " +
            req.params.user +
            (req.params[0] ? " (old)" : "")
        );
      });

      await request(app.handler())
        .get("/user/abc/edit")
        .expect(200, "editing abc");

      await request(app.handler())
        .get("/users/abc/edit")
        .expect(200, "editing abc (old)");
    });

    test("should work inside literal parenthesis", async () => {
      const app = new Router();

      app.get("/:user\\(:op\\)", function (req, res) {
        res.end(req.params.op + "ing " + req.params.user);
      });

      await request(app.handler()).get("/abc(edit)").expect(200, "editing abc");
    });
  });

  describe("case sensitivity", function () {
    test("should be disabled by default", async () => {
      const app = new Router();

      app.get("/user", function (req, res) {
        res.end("Ok");
      });

      await request(app.handler()).get("/USER").expect(200, "Ok");
    });

    test("should match identical casing", async () => {
      const app = new Router({ caseSensitive: true });

      app.get("/uSer", function (req, res) {
        res.end("Ok");
      });

      app.use(function (req, res) {
        res.writeHead(404).end("Page Not Found");
      });

      await request(app.handler()).get("/uSer").expect(200, "Ok");
      await request(app.handler()).get("/user").expect(404);
    });
  });
});
