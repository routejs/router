import nodePath from "node:path";
import url from "node:url";
import LRUCache from "@opensnip/lrujs";
import Route from "./route.mjs";

export default class Router {
  #routes = [];
  #config = {
    caseSensitive: false,
    host: undefined,
  };
  #route = null;
  #pathCache = null;

  constructor(options = {}) {
    if (options.caseSensitive === true) {
      this.#config.caseSensitive = true;
    }
    this.#config.host = options.host;
    this.#pathCache = new LRUCache({
      maxLength: 250,
    });
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
    return this.#setRoute({ path, callbacks });
  }

  add(method, path, ...callbacks) {
    return this.#setRoute({ method, path, callbacks });
  }

  use(...callbacks) {
    if (typeof callbacks[0] === "string" || callbacks[0] instanceof String) {
      if (callbacks.length < 2) {
        throw new TypeError(
          "use function callback accepts function or router as an argument"
        );
      }
      return this.#mergeRoute({
        group: callbacks[0],
        callbacks: callbacks.slice(1),
      });
    } else {
      return this.#mergeRoute({ callbacks: callbacks });
    }
  }

  group(path, callback) {
    if (!(typeof path === "string" || path instanceof String)) {
      throw new TypeError("group path accepts only string as an argument");
    }

    if (typeof callback === "function") {
      const router = new Router();
      callback(router);
      return this.#mergeRoute({ group: path, callbacks: router });
    } else {
      return this.#mergeRoute({ group: path, callbacks: callback });
    }
  }

  domain(host, callback) {
    if (!(typeof host === "string" || host instanceof String)) {
      throw new TypeError("domain host accepts only string as an argument");
    }

    if (typeof callback === "function") {
      const router = new Router();
      callback(router);
      return this.#mergeRoute({ host, callbacks: router });
    } else {
      return this.#mergeRoute({ host, callbacks: callback });
    }
  }

  setName(name) {
    // Set route name
    if (this.#route instanceof Route) {
      this.#route.setName(name);
    } else {
      throw new TypeError("setName can not set name for middleware");
    }
    return this;
  }

  routes() {
    return this.#routes;
  }

  route(name, params = []) {
    let namedRoute = null;
    this.routes().map((route) => {
      if (route.name === name) {
        namedRoute = route;
      }
    });
    return namedRoute.compilePathRegexpToPath(params);
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
    this.#route = route;
    return this;
  }

  #mergeRoute({ host, method, group, callbacks }) {
    if (callbacks instanceof Router) {
      callbacks.routes().forEach((route) => {
        this.#setRoute({
          host: host ?? route.host,
          method: method ?? route.method,
          path: group
            ? route.path
              ? nodePath.join(group, route.path)
              : null
            : route.path,
          callbacks: route.callbacks,
          group: group ? nodePath.join(group, route.group ?? "") : route.group,
          name: route.name,
        });
      });
    } else if (Array.isArray(callbacks)) {
      for (const route of callbacks) {
        if (route instanceof Route) {
          this.#setRoute({
            host: host ?? route.host,
            method: method ?? route.method,
            path: group
              ? route.path
                ? nodePath.join(group, route.path)
                : null
              : route.path,
            callbacks: route.callbacks,
            group: group
              ? nodePath.join(group, route.group ?? "")
              : route.group,
            name: route.name,
          });
        } else if (Array.isArray(route) || route instanceof Router) {
          this.#mergeRoute({ host, method, group, callbacks: route });
        } else {
          this.#setRoute({ host, method, group, callbacks });
          break;
        }
      }
    } else {
      this.#setRoute({ host, method, group, callbacks });
    }
    // Set name is not allowed on middleware
    if (this.#route) {
      this.#route = null;
    }
    return this;
  }

  handle({ requestHost, requestMethod, requestUrl, request, response }) {
    let that = this;
    let requestPath = that.#pathCache.get(requestUrl);
    if (typeof requestPath === "undefined") {
      const parsedUrl = url.parse(requestUrl ? requestUrl : "");
      requestPath = decodeURI(parsedUrl.pathname);
      that.#pathCache.set(requestUrl, requestPath);
    }

    const callStack = {
      stack: this.routes(),
      index: 0,
    };

    function runMiddleware(callbacks, error = null) {
      try {
        if (typeof callbacks.stack[callbacks.index] === "undefined") {
          // No more middlewares to execute
          // Execute next callstack
          callStack.index++;
          return runCallback(error);
        }

        if (typeof callbacks.stack[callbacks.index] !== "function") {
          throw new TypeError(
            "callback argument only accepts function as an argument"
          );
        }

        // Execute callbacks
        if (error === null && callbacks.stack[callbacks.index].length <= 3) {
          callbacks.stack[callbacks.index](
            request,
            response,
            function (err = null) {
              if (err === "skip") {
                // Skip all middlewares of current callstack and execute next callstack
                callStack.index++;
                runCallback();
              } else {
                // Execute next middleware
                callbacks.index++;
                runMiddleware(callbacks, err);
              }
            }
          );
        } else if (
          error !== null &&
          callbacks.stack[callbacks.index].length > 3
        ) {
          // Execute error handler
          callbacks.stack[callbacks.index](
            error,
            request,
            response,
            function (err = null) {
              if (err === "skip") {
                // Skip all middlewares of current callstack and execute next callstack
                callStack.index++;
                runCallback();
              } else {
                // Execute next middleware
                callbacks.index++;
                runMiddleware(callbacks, err);
              }
            }
          );
        } else {
          // Skip current middleware
          callbacks.index++;
          runMiddleware(callbacks, error);
        }
      } catch (exception) {
        callbacks.index++;
        if (typeof callStack.stack[callStack.index] !== "undefined") {
          runMiddleware(callbacks, exception);
        } else {
          throw exception;
        }
      }
    }

    function runCallback(error = null) {
      if (typeof callStack.stack[callStack.index] === "undefined") {
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

      let match = callStack.stack[callStack.index].match({
        host: requestHost,
        method: requestMethod,
        path: requestPath,
      });

      // Execute callbacks
      if (match !== false) {
        request.params = match.params;
        request.subdomains = match.subdomains;
        const callbacks = {
          stack: match.callbacks,
          index: 0,
        };
        return runMiddleware(callbacks, error);
      } else {
        callStack.index++;
        return runCallback(error);
      }
    }

    runCallback();
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
