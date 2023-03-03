const request = require("supertest");
const { Router } = require("../index.cjs");

describe("Route parameters test", () => {
  const app = new Router();

  app
    .get("{name}/dashboard", function (req, res) {
      res.end(req.params.name);
    })
    .get("/user/{name}/dashboard", function (req, res) {
      res.end(req.params.name);
    })
    .get("/params/{name}.{ext}/size/{size:(\\d+)}", function (req, res) {
      res.end(`${req.params.name}.${req.params.ext}.${req.params.size}`);
    })
    .get("/digit/{id:(\\d+)}", function (req, res) {
      res.end(req.params.id);
    })
    .get("/all/*", function (req, res) {
      res.end("Ok");
    })
    .get("/any/ab+", function (req, res) {
      res.end("Ok");
    })
    .get("/optional/ab?", function (req, res) {
      res.end("Ok");
    })
    .get("/regex/([A-Za-z]+)", function (req, res) {
      res.end("Ok");
    })
    .get("/special/^a?c|d$.e*/end", function (req, res) {
      res.end("Ok");
    });

  app.use(function (req, res) {
    res.writeHead(404).end("Page Not Found");
  });

  test("GET /user/dashboard", async () => {
    await request(app.handler())
      .get("/user/dashboard")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user");
      });
  });

  test("GET /user/abc/dashboard", async () => {
    await request(app.handler())
      .get("/user/abc/dashboard")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("abc");
      });
  });

  test("GET /params/image.png/size/10", async () => {
    await request(app.handler())
      .get("/params/image.png/size/10")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("image.png.10");
      });
  });

  test("GET /digit/100", async () => {
    await request(app.handler())
      .get("/digit/100")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("100");
      });
  });

  test("GET /digit/a", async () => {
    await request(app.handler()).get("/digit/a").expect(404);
  });

  test("GET /all/*", async () => {
    await request(app.handler())
      .get("/all/a/b/c/d")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /any/ab+", async () => {
    await request(app.handler())
      .get("/any/ab")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /any/ab+", async () => {
    await request(app.handler())
      .get("/any/abbb")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /any/ab+", async () => {
    await request(app.handler()).get("/any/abc").expect(404);
  });

  test("GET /optional/ab?", async () => {
    await request(app.handler())
      .get("/optional/a")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /optional/ab?", async () => {
    await request(app.handler())
      .get("/optional/ab")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /optional/ab?", async () => {
    await request(app.handler()).get("/optional/abc").expect(404);
  });

  test("GET /regex/([A-Za-z]+)", async () => {
    await request(app.handler())
      .get("/regex/abc")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("GET /regex/([A-Za-z]+)", async () => {
    await request(app.handler()).get("/regex/abc/10").expect(404);
  });

  test("GET /regex/([A-Za-z]+)", async () => {
    await request(app.handler()).get("/regex/ab10").expect(404);
  });

  test("GET /special", async () => {
    await request(app.handler())
      .get("/special/^ac|d$.ea/end")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });

  test("Page Not Found", async () => {
    await request(app.handler()).get("/home").expect(404);
  });
});
