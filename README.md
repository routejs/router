<p align="center">
  <img src="https://raw.githubusercontent.com/routejs/docs/main/routejs.jpg" width="400px" alt="Routejs Logo">
</p>

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]

Routejs is a fast and lightweight http routing engine for [Node.js](http://nodejs.org)

## Features

- Fast and lightweight
- Group routing
- Host based routing
- Named routing
- Middleware support
- Object and array based routing
- Regular expression support

## Installation

Install using npm:

```console
$ npm i @routejs/router
```

Install using yarn:

```console
$ yarn add @routejs/router
```

## Example

```js
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

http.createServer(app.handler()).listen(3000);
```

## Url route example

Routejs is very simple and flexible, it support both object and array based url routing.

Let's create `urls.js` urls file for routes:

```js
const { path, use } = require("@routejs/router");

// Url routes
const urls = [
  path("get", "/", (req, res) => res.end("Ok")),
  // Create 404 page not found error
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

// Use url routes
app.use(urls);

http.createServer(app.handler()).listen(3000);
```

## Documentation

- Learn more from [Documentation](https://github.com/routejs/docs/)
- Documentation : [https://routejs.github.io/docs](https://routejs.github.io/docs)

## License

[MIT License](https://github.com/routejs/router/blob/main/LICENSE)

[npm-downloads-image]: https://badgen.net/npm/dm/@routejs/router
[npm-downloads-url]: https://npmcharts.com/compare/@routejs/router?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/@routejs/router
[npm-install-size-url]: https://packagephobia.com/result?p=@routejs/router
[npm-url]: https://npmjs.org/package/@routejs/router
[npm-version-image]: https://badgen.net/npm/v/@routejs/router
