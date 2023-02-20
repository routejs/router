const request = require("supertest");
const { Router, path, use } = require("../index.cjs");

describe("Routing test", () => {
  const app = new Router();

  const urls = [
    use((req, res, next) => next()),
    path("get", "/", (req, res) => res.end("GET")),
    path("get", "/", (req, res) => res.end("Ok")),
    path("post", "/", (req, res) => res.end("POST")),
    path("put", "/", (req, res, next) => next()),
    path("put", "/", (req, res) => res.end("PUT")),
    path("delete", "/", (req, res) => res.end("DELETE")),
    path(["get", "post"], "/any", (req, res) =>
      res.end(req.method.toUpperCase())
    ).setName("any"),
    path("get", "{name}/dashboard", (req, res) => res.end(req.params.name)),
    path("get", "/params/{name:([A-Za-z]+)}/{id}", (req, res) =>
      res.end(`${req.params.name},${req.params.id}`)
    ).setName("params"),
    path("get", "/digit/{id:(\\d+)}", (req, res) =>
      res.end(req.params.id)
    ).setName("digit"),
    path("get", "params/{name}.{ext}/size/{size:(\\d+)}", (req, res) =>
      res.end(`${req.params.name}.${req.params.ext}.${req.params.size}`)
    ),
    use((req, res) => res.writeHead(404).end("Page Not Found")),
  ];

  app.use(urls);

  test("GET /", async () => {
    await request(app.handler())
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("POST /", async () => {
    await request(app.handler())
      .post("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
      });
  });

  test("PUT /", async () => {
    await request(app.handler())
      .put("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("PUT");
      });
  });

  test("DELETE /", async () => {
    await request(app.handler())
      .delete("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("DELETE");
      });
  });

  test("GET /any", async () => {
    await request(app.handler())
      .get("/any")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("GET");
      });
  });

  test("POST /any", async () => {
    await request(app.handler())
      .post("/any")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("POST");
      });
  });

  test("GET /user/dashboard", async () => {
    await request(app.handler())
      .get("/user/dashboard")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user");
      });
  });

  test("GET /params/user/1", async () => {
    await request(app.handler())
      .get("/params/user/1")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("user,1");
      });
  });

  test("GET /params/user1/1", async () => {
    await request(app.handler()).get("/params/user1/1").expect(404);
  });

  test("GET /digit/100", async () => {
    await request(app.handler())
      .get("/digit/100")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("100");
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

  test("GET /digit/a", async () => {
    await request(app.handler()).get("/digit/a").expect(404);
  });

  test("Page Not Found", async () => {
    await request(app.handler())
      .get("/home")
      .expect(404)
      .then((res) => {
        expect(res.text).toBe("Page Not Found");
      });
  });

  test("Get route url", () => {
    expect(app.route("params", ["abc", 10])).toBe("/params/abc/10");
  });

  test("Get route url", () => {
    expect(app.route("digit", [10])).toBe("/digit/10");
  });

  test("Get route url", () => {
    expect(app.route("any")).toBe("/any");
  });
});
