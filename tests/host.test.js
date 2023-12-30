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
      router.post("/", function (req, res) {
        res.end("Ok");
      });
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler()).get("/").expect(200, "GET");
    await request(app.handler()).post("/").expect(404);
  });

  test("GET /", async () => {
    const app = new Router({
      host: "localhost",
    });

    app.get("/", function (req, res) {
      res.end("GET");
    });

    app.domain(":name.localhost", function (router) {
      router.get("/", function (req, res) {
        res.end("Ok");
      });
      router.use(function (req, res) {
        res.writeHead(404).end("Page not found");
      });
    });

    app.domain("*.localhost", function (router) {
      router.use(function (req, res) {
        res.writeHead(200).end(req.subdomains[0]);
      });
    });

    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler())
      .get("/")
      .set("Host", "www.localhost:3000")
      .expect(200, "Ok");
    await request(app.handler())
      .get("/not-found")
      .set("Host", "www.localhost:3000")
      .expect(404);
    await request(app.handler())
      .get("/")
      .set("Host", "www.blog.localhost:3000")
      .expect(200, "www.blog");
    await request(app.handler())
      .get("/")
      .set("Host", "localhost:3000")
      .expect(200, "GET");
    await request(app.handler())
      .get("/not-found")
      .set("Host", "localhost:3000")
      .expect(404);
  });

  test("GET /subdomain/params", async () => {
    const app = new Router();
    app.domain(":name.localhost", function (router) {
      router.get("/subdomain/params", function (req, res) {
        res.end(req.subdomains.name);
      });
    });
    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.localhost:3000")
      .expect(200, "www");
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.en.localhost:3000")
      .expect(404);
  });

  test("GET /subdomain/params", async () => {
    const app = new Router();
    app.domain(":name.:ext?.localhost", function (router) {
      router.get("/subdomain/params", function (req, res) {
        res.end(req.subdomains.name + "." + req.subdomains.ext);
      });
    });
    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.en.localhost:3000")
      .expect(200, "www.en");
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.localhost:3000")
      .expect(200, "www.undefined");
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.en.demo.localhost:3000")
      .expect(404);
  });

  test("GET /subdomain/params", async () => {
    const app = new Router();
    app.domain(":name?.:ext.localhost", function (router) {
      router.get("/subdomain/params", function (req, res) {
        res.end(req.subdomains.name + "." + req.subdomains.ext);
      });
    });
    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.localhost:3000")
      .expect(200, "undefined.www");
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.en.localhost:3000")
      .expect(200, "www.en");
    await request(app.handler())
      .get("/subdomain/params")
      .set("Host", "www.en.demo.localhost:3000")
      .expect(404);
  });

  test("Param count :name.:ext.(\\d+).:id(\\d+)", async () => {
    const app = new Router();
    app.domain(":name.:ext.(\\d+).:id(\\d+).localhost", function (router) {
      router.get("/", function (req, res) {
        res.end(String(Object.keys(req.subdomains).length));
      });
    });
    app.use(function (req, res) {
      res.writeHead(404).end("Page not found");
    });

    await request(app.handler())
      .get("/")
      .set("Host", "abc.png.0.1.localhost:3000")
      .expect(200, "4");
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
