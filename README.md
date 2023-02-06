## Routejs

<p align="center">
  <img src="https://raw.githubusercontent.com/routejs/docs/main/routejs.jpg" width="400px" alt="routejs logo">
</p>

Routejs is a fast and lightweight http router for nodejs.
Routejs provide simple and elegant apis for http routing.

## Features
- Fast and flexible routing
- Simple and minimal api
- Named routing
- Grouped route
- Host routing

## Installation
```shell
npm i @routejs/router
```

OR

```shell
yarn add @routejs/router
```

## Simple example

```javascript
const { Router } = require("@routejs/router");
const http = require("http");

const app = new Router();

app.get("/", function (req, res) {
  res.end("Ok");
});

const server = http.createServer(app.handler());
server.listen(3000);
```

### Url routes example
Routejs is very simple and flexible, it support both object and array based url routing.

Let's create `urls.js` urls file for routes:
```javascript
const { get, post, put, delete } = require("@routejs/router");
const { getBlog, createBlog, updateBlog, deleteBlog } = require("./blogs");

const urls = [
  get("/blog", getBlog),
  post("/blog", createBlog),
  put("/blog", updateBlog),
  delete("/blog", deleteBlog),
];
```

Use urls in routejs app:
```javascript
const http = require("http");
const { Router } = require("@routejs/router");
const urls = require("./urls");

const app = new Router();

app.useRoutes(urls);

const server = http.createServer(app.handler());
server.listen(3000);
```

## Documentation

  - Learn more about Unic from [Documentation](https://github.com/unicframework/docs/) file.
  - Documentation : [https://unicframework.github.io/docs](https://unicframework.github.io/docs)


## License

  [MIT License](https://github.com/routejs/router/blob/main/LICENSE)
