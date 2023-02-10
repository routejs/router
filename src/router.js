const path = require("node:path");
const url = require("node:url");
const Route = require("./route");
const supportedMethod = require("./supported-method");

class Router {
  #routes = [];
  #config = {
    caseSensitive: false,
    host: undefined,
  };

  constructor(options = {}) {
    if (options.caseSensitive === true) {
      this.#config.caseSensitive = true;
    }
    this.#config.host = options.host;
  }

  checkout(path, ...callbacks) {
    return this.#setRoute({ method: "CHECKOUT", path, callbacks });
  }

  copy(path, ...callbacks) {
    return this.#setRoute({ method: "COPY", path, callbacks });
  }

  delete(path, ...callbacks) {
    return this.#setRoute({ method: "DELETE", path, callbacks });
  }

  get(path, ...callbacks) {
    return this.#setRoute({ method: "GET", path, callbacks });
  }

  head(path, ...callbacks) {
    return this.#setRoute({ method: "HEAD", path, callbacks });
  }

  lock(path, ...callbacks) {
    return this.#setRoute({ method: "LOCK", path, callbacks });
  }

  merge(path, ...callbacks) {
    return this.#setRoute({ method: "MERGE", path, callbacks });
  }

  mkactivity(path, ...callbacks) {
    return this.#setRoute({ method: "MKACTIVITY", path, callbacks });
  }

  mkcol(path, ...callbacks) {
    return this.#setRoute({ method: "MKCOL", path, callbacks });
  }

  move(path, ...callbacks) {
    return this.#setRoute({ method: "MOVE", path, callbacks });
  }

  notify(path, ...callbacks) {
    return this.#setRoute({ method: "NOTIFY", path, callbacks });
  }

  options(path, ...callbacks) {
    return this.#setRoute({ method: "OPTIONS", path, callbacks });
  }

  patch(path, ...callbacks) {
    return this.#setRoute({ method: "PATCH", path, callbacks });
  }

  post(path, ...callbacks) {
    return this.#setRoute({ method: "POST", path, callbacks });
  }

  propfind(path, ...callbacks) {
    return this.#setRoute({ method: "PROPFIND", path, callbacks });
  }

  purge(path, ...callbacks) {
    return this.#setRoute({ method: "PURGE", path, callbacks });
  }

  put(path, ...callbacks) {
    return this.#setRoute({ method: "PUT", path, callbacks });
  }

  report(path, ...callbacks) {
    return this.#setRoute({ method: "REPORT", path, callbacks });
  }

  search(path, ...callbacks) {
    return this.#setRoute({ method: "SEARCH", path, callbacks });
  }

  subscribe(path, ...callbacks) {
    return this.#setRoute({ method: "SUBSCRIBE", path, callbacks });
  }

  trace(path, ...callbacks) {
    return this.#setRoute({ method: "TRACE", path, callbacks });
  }

  unlock(path, ...callbacks) {
    return this.#setRoute({ method: "UNLOCK", path, callbacks });
  }

  unsubscribe(path, ...callbacks) {
    return this.#setRoute({ method: "UNSUBSCRIBE", path, callbacks });
  }

  view(path, ...callbacks) {
    return this.#setRoute({ method: "VIEW", path, callbacks });
  }

  any(methods, path, ...callbacks) {
    return this.#setRoute({ method: methods, path, callbacks });
  }

  all(path, ...callbacks) {
    return this.#setRoute({ method: supportedMethod, path, callbacks });
  }

  use(...callbacks) {
    if (typeof callbacks[0] === "string" || callbacks[0] instanceof String) {
      if (callbacks.length < 2) {
        throw new TypeError(
          "Error: use function callback accepts function or router as an argument"
        );
      }
      return this.#mergeRoute({
        group: callbacks[0],
        callbacks: callbacks.slice(1),
      });
    } else {
      this.#mergeRoute({ callbacks: callbacks });
    }
  }

  group(path, callback) {
    if (!(typeof path === "string" || path instanceof String)) {
      throw new TypeError(
        "Error: group path accepts only string as an argument"
      );
    }

    if (typeof callback === "function") {
      const router = new Router();
      callback(router);
      this.#mergeRoute({ group: path, callbacks: router });
    } else {
      this.#mergeRoute({ group: path, callbacks: callback });
    }
  }

  domain(host, callback) {
    if (!(typeof host === "string" || host instanceof String)) {
      throw new TypeError(
        "Error: group host accepts only string as an argument"
      );
    }

    if (typeof callback === "function") {
      const router = new Router();
      callback(router);
      this.#mergeRoute({ host, callbacks: router });
    } else {
      this.#mergeRoute({ host, callbacks: callback });
    }
  }

  routes() {
    return this.#routes;
  }

  route(name) {
    let path = null;
    this.routes().map((route) => {
      if (route.name === name) {
        path = route.path;
      }
    });
    return path;
  }

  #setRoute({ host, method, path, callbacks, group, name }) {
    const route = new Route({
      host: host ?? this.#config.host,
      method,
      path,
      callbacks,
      group,
      name,
      caseSensitive: this.#config.caseSensitive,
    });
    this.#routes.push(route);
    return route;
  }

  #mergeRoute({ host, method, group, callbacks }) {
    if (callbacks instanceof Router) {
      callbacks.routes().forEach((route) => {
        this.#setRoute({
          host: host ?? route.host,
          method: method ?? route.method,
          path: group
            ? route.path
              ? path.join(group, route.path)
              : null
            : route.path,
          callbacks: route.callbacks,
          group: group ? path.join(group, route.group ?? "") : route.group,
          name: route.name,
        });
      });
    } else if (Array.isArray(callbacks)) {
      callbacks.forEach((route) => {
        if (route instanceof Route) {
          this.#setRoute({
            host: host ?? route.host,
            method: method ?? route.method,
            path: group
              ? route.path
                ? path.join(group, route.path)
                : null
              : route.path,
            callbacks: route.callbacks,
            group: group ? path.join(group, route.group ?? "") : route.group,
            name: route.name,
          });
        } else if (Array.isArray(route) || route instanceof Router) {
          this.#mergeRoute({ host, method, group, callbacks: route });
        } else {
          this.#setRoute({ host, method, group, callbacks });
        }
      });
    } else {
      this.#setRoute({ host, method, group, callbacks });
    }
  }

  handle({ requestHost, requestMethod, requestUrl, request, response }) {
    const parsedUrl = url.parse(requestUrl ? requestUrl : "");
    const requestPath = parsedUrl.pathname;
    const callStack = [];
    let callIndex = 0;

    this.routes().forEach((e) => {
      const match = e.match({
        host: requestHost,
        method: requestMethod,
        path: requestPath,
      });
      if (match !== false) {
        callStack.push(match.callbacks);
        if (match.method && match.params) {
          request.params = match.params;
          request.subdomains = match.subdomains;
        }
      }
    });

    function runMiddleware(callbacks, callbackIndex, error = null) {
      try {
        if (callbackIndex >= callbacks.length) {
          // No more middlewares to execute
          // Execute next callstack
          callIndex++;
          return runCallStack(callStack, callIndex, error);
        }

        if (typeof callbacks[callbackIndex] !== "function") {
          throw new TypeError(
            "Error: callback argument only accepts function as an argument"
          );
        }

        // Execute callbacks
        if (error === null && callbacks[callbackIndex].length <= 3) {
          callbacks[callbackIndex](request, response, function (err = null) {
            if (err === "skip") {
              // Skip all middlewares of current callstack and execute next callstack
              callIndex++;
              runCallStack(callStack, callIndex);
            } else {
              // Execute next middleware
              callbackIndex++;
              runMiddleware(callbacks, callbackIndex, err);
            }
          });
        } else if (error !== null && callbacks[callbackIndex].length > 3) {
          // Execute error handler
          callbacks[callbackIndex](
            error,
            request,
            response,
            function (err = null) {
              if (err === "skip") {
                // Skip all middlewares of current callstack and execute next callstack
                callIndex++;
                runCallStack(callStack, callIndex);
              } else {
                // Execute next middleware
                callbackIndex++;
                runMiddleware(callbacks, callbackIndex, err);
              }
            }
          );
        } else {
          // Skip current middleware
          callbackIndex++;
          runMiddleware(callbacks, callbackIndex, error);
        }
      } catch (exception) {
        callbackIndex++;
        if (callIndex < callStack.length) {
          runMiddleware(callbacks, callbackIndex, exception);
        } else {
          throw exception;
        }
      }
    }

    function runCallStack(callStack, callIndex, error = null) {
      if (callIndex >= callStack.length) {
        if (error !== null) {
          if (error instanceof Error) {
            throw error;
          } else {
            throw new Error(error);
          }
        }
        // Nothing to execute
        return;
      }
      // Execute callbacks
      runMiddleware(callStack[callIndex], 0, error);
    }

    runCallStack(callStack, callIndex);
  }

  handler() {
    function requestHandler(request, response) {
      var requestHost = request.headers ? request.headers.host : null;
      var requestMethod = request.method;
      var requestUrl = request.url;

      if (!requestHost && "getHeader" in request) {
        requestHost = request.getHeader("host");
      }
      if (!requestMethod && "getMethod" in request) {
        requestMethod = request.getMethod();
      }
      if (!requestUrl && "getUrl" in request) {
        requestUrl = request.getUrl();
      }

      this.handle({
        requestHost,
        requestMethod,
        requestUrl,
        request,
        response,
      });
    }
    return requestHandler.bind(this);
  }
}

module.exports = Router;
