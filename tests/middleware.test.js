const request = require("supertest");
const { Router } = require("../index");

describe("Routing test", () => {
  const app = new Router();

  app.use(
    function (req, res, next) {
      res.write("Ok");
      next();
    },
    function (req, res) {
      res.end();
    }
  );

  test("GET /", async () => {
    await request(app.handler())
      .get("/")
      .expect(200)
      .then((res) => {
        expect(res.text).toBe("Ok");
      });
  });
});
