const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Subdomain based routing test", () => {
  test("GET /", async () => {
    const app = new Router();
    app.get("/", function (req, res) {
      res.end("GET");
    });

    app.domain(":name.localhost", function (router) {
      router.get("/", function (req, res) {
        res.end("Ok");
      });
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
    app.get("/", function (req, res) {
      res.end("GET");
    });

    app.domain(":name.localhost", function (router) {
      router.get("/", function (req, res) {
        res.end("Ok");
      });
      router.post("/", function (req, res) {
        res.end("Ok");
      });
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).post("/").expect(404);
  });

  test("GET /", async () => {
    const app = new Router({
      host: "localhost:3000",
    });

    app.get("/", function (req, res) {
      res.end("GET");
    });

    app.domain(":name.localhost", function (router) {
      router.get("/", function (req, res) {
        res.end("Ok");
      });
    });

    await request(app.handler())
      .get("/")
      .set("Host", "www.localhost:3000")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /", async () => {
    const app = new Router({
      host: "localhost:3000",
    });

    app.get("/", function (req, res) {
      res.end("GET");
    });

    app.domain(":name.localhost", function (router) {
      router.get("/", function (req, res) {
        res.end("Ok");
      });
    });

    app.domain("*.localhost", function (router) {
      router.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler())
      .get("/")
      .set("Host", "www.blog.localhost:3000")
      .expect(404);
  });

  test("GET /subdomain/params", async () => {
    const app = new Router();
    app.domain(":name.localhost", function (router) {
      router.get("/subdomain/params", function (req, res) {
        res.end(req.subdomains.name);
      });
    });
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.localhost:3000")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("www");
      });
  });

  test("Param count :name.:ext.(\\d+).:id(\\d+)", async () => {
    const app = new Router();
    app.domain(":name.:ext.(\\d+).:id(\\d+).localhost", function (router) {
      router.get("/", function (req, res) {
        res.end(`${Object.keys(req.subdomains).length}`);
      });
    });

    await request(app.handler())
      .get("/")
      .set("Host", "abc.png.0.1.localhost:3000")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("4");
      });
  });

  test("Invalid regex (?:(\\d+))", async () => {
    expect(function () {
      const app = new Router();
      app.domain("(?:(\\d+)).localhost", function (router) {
        router.get("/", function (req, res) {
          res.end("Ok");
        });
      });
    }).toThrow(TypeError);
  });

  test("Invalid regex ([A-Z]+(?:(\\d+)))", async () => {
    expect(function () {
      const app = new Router();
      app.domain("([A-Z]+(?:(\\d+))).localhost", function (router) {
        router.get("/", function (req, res) {
          res.end("Ok");
        });
      });
    }).toThrow(TypeError);
  });

  test("Invalid regex ([A-Z]+(\\d+))", async () => {
    expect(function () {
      const app = new Router();
      app.domain("([A-Z]+(\\d+)).localhost", function (router) {
        router.get("/", function (req, res) {
          res.end("Ok");
        });
      });
    }).toThrow(TypeError);
  });

  test("Invalid regex :name.*.(\\d+\\)", async () => {
    expect(function () {
      const app = new Router();
      app.domain(":name.*.(\\d+\\).localhost", function (router) {
        router.get("/", function (req, res) {
          res.end("Ok");
        });
      });
    }).toThrow(TypeError);
  });
});
