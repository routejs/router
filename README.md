## Routejs

<p align="center">
  <img src="https://raw.githubusercontent.com/routejs/docs/main/routejs.jpg" width="400px" alt="routejs logo">
</p>

Routejs is a fast and lightweight http router for nodejs.
Routejs provide simple and elegant apis for http routing.

## Features

- Fast and flexible routing
- Simple and lightweight
- Named routing
- Group routing
- Subdomain based routing
- Middleware support
- Object and array based routing

## Installation

Install using npm:

```shell
npm i @routejs/router
```

Install using yarn:

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

// Create 404 page not found error
app.use(function (req, res) {
  res.writeHead(404).end("404 Page Not Found");
});

const server = http.createServer(app.handler());
server.listen(3000);
```

## Url route example

Routejs is very simple and flexible, it support both object and array based url routing.

Let's create `urls.js` urls file for routes:

```javascript
const { route, use } = require("@routejs/router");

const urls = [
  route("get", "/", (req, res) => res.end("Ok")),
  use((req, res) => res.writeHead(404).end("404 Page Not Found")),
];

module.exports = urls;
```

Use urls in routejs app:

```javascript
const { Router } = require("@routejs/router");
const http = require("http");
const urls = require("./urls");

const app = new Router();

app.useRoutes(urls);

const server = http.createServer(app.handler());
server.listen(3000);
```

## Documentation

- Learn more from [Documentation](https://github.com/routejs/docs/) file.
- Documentation : [https://routejs.github.io/docs](https://routejs.github.io/docs)

## License

[MIT License](https://github.com/routejs/router/blob/main/LICENSE)
