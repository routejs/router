const Router = require("../src/router");

var router = null;

beforeEach(() => {
  router = new Router();
});

test("set middleware", () => {
  router.use(function () {});
  expect(router.routes().length).toBe(1);
});

test("set get routes", () => {
  router.get("/", function () {});
  expect(router.routes().length).toBe(1);
});

test("set post routes", () => {
  router.post("/", function () {});
  expect(router.routes().length).toBe(1);
});

test("set put routes", () => {
  router.put("/", function () {});
  expect(router.routes().length).toBe(1);
});

test("set delete routes", () => {
  router.put("/", function () {});
  expect(router.routes().length).toBe(1);
});

test("set any routes", () => {
  router.any(["get", "post"], "/", function () {});
  expect(router.routes().length).toBe(1);
});

test("set all routes", () => {
  router.all("/", function () {});
  expect(router.routes().length).toBe(1);
});

test("set group routes", () => {
  router.get("/", function () {});
  router.group("/group", function (router) {
    router.get("/", function () {});
  });
  expect(router.routes().length).toBe(2);
});

test("match get routes", () => {
  router.get("/", function () {});
  router.routes().map((e) => {
    expect(e.match({ method: "GET", path: "/" })).toMatchObject({ path: "/" });
  });
});

test("match route parameter", () => {
  router.get("/blog/:slug", function () {});
  router.routes().map((e) => {
    expect(e.match({ method: "GET", path: "/blog/testing" })).toMatchObject({
      path: "/blog/:slug",
      params: {
        slug: "testing",
      },
    });
  });
});
