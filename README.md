# Router
Routejs is powerful and fast http router for nodejs.

### Features
- Fast and flexible routing
- Simple and minimal api
- Named routing
- Grouped route
- Host routing

### Example
Routejs is very simple and easy to use router, routejs provide simple and easy to use apis for routing.

```javascript
const Router = require("@routejs/router");
const http = require("http");

const router = new Router();

router.get("/", function (req, res) {
  res.end("Ok");
});

const server = http.createServer(router.handler());
server.listen(3000);
```
