const path = require("node:path");
const Route = require("./route");
const Router = require("./router");
const supportedMethod = require("./supported-method");

const methods = {
  checkout(path, ...callbacks) {
    return setRoute({ method: "CHECKOUT", path, callbacks });
  },

  copy(path, ...callbacks) {
    return setRoute({ method: "COPY", path, callbacks });
  },

  delete(path, ...callbacks) {
    return setRoute({ method: "DELETE", path, callbacks });
  },

  get(path, ...callbacks) {
    return setRoute({ method: "GET", path, callbacks });
  },

  head(path, ...callbacks) {
    return setRoute({ method: "HEAD", path, callbacks });
  },

  lock(path, ...callbacks) {
    return setRoute({ method: "LOCK", path, callbacks });
  },

  merge(path, ...callbacks) {
    return setRoute({ method: "MERGE", path, callbacks });
  },

  mkactivity(path, ...callbacks) {
    return setRoute({ method: "MKACTIVITY", path, callbacks });
  },

  mkcol(path, ...callbacks) {
    return setRoute({ method: "MKCOL", path, callbacks });
  },

  move(path, ...callbacks) {
    return setRoute({ method: "MOVE", path, callbacks });
  },

  notify(path, ...callbacks) {
    return setRoute({ method: "NOTIFY", path, callbacks });
  },

  options(path, ...callbacks) {
    return setRoute({ method: "OPTIONS", path, callbacks });
  },

  patch(path, ...callbacks) {
    return setRoute({ method: "PATCH", path, callbacks });
  },

  post(path, ...callbacks) {
    return setRoute({ method: "POST", path, callbacks });
  },

  propfind(path, ...callbacks) {
    return setRoute({ method: "PROPFIND", path, callbacks });
  },

  purge(path, ...callbacks) {
    return setRoute({ method: "PURGE", path, callbacks });
  },

  put(path, ...callbacks) {
    return setRoute({ method: "PUT", path, callbacks });
  },

  report(path, ...callbacks) {
    return setRoute({ method: "REPORT", path, callbacks });
  },

  search(path, ...callbacks) {
    return setRoute({ method: "SEARCH", path, callbacks });
  },

  subscribe(path, ...callbacks) {
    return setRoute({ method: "SUBSCRIBE", path, callbacks });
  },

  trace(path, ...callbacks) {
    return setRoute({ method: "TRACE", path, callbacks });
  },

  unlock(path, ...callbacks) {
    return setRoute({ method: "UNLOCK", path, callbacks });
  },

  unsubscribe(path, ...callbacks) {
    return setRoute({ method: "UNSUBSCRIBE", path, callbacks });
  },

  view(path, ...callbacks) {
    return setRoute({ method: "VIEW", path, callbacks });
  },

  any(methods, path, ...callbacks) {
    return setRoute({ method: methods, path, callbacks });
  },

  all(path, ...callbacks) {
    return setRoute({ method: supportedMethod, path, callbacks });
  },

  use(...callbacks) {
    if (typeof callbacks[0] === "string" || callbacks[0] instanceof String) {
      if (callbacks.length < 2) {
        throw new TypeError(
          "Error: use function accepts only function or router as an argument"
        );
      }
      return path(callbacks[0], callbacks[1]);
    } else {
      return setRoute({ callbacks: callbacks });
    }
  },

  path(path, routes) {
    if (!(typeof path === "string" || path instanceof String)) {
      throw new TypeError(
        "Error: group path accepts only string as an argument"
      );
    }

    if (typeof routes === "function") {
      const router = new Router();
      routes(router);
      return mergeRoute({ group: path, callbacks: router });
    } else {
      return mergeRoute({ group: path, callbacks: routes });
    }
  },

  domain(host, routes) {
    if (!(typeof host === "string" || host instanceof String)) {
      throw new TypeError(
        "Error: group host accepts only string as an argument"
      );
    }

    if (typeof routes === "function") {
      const router = new Router();
      routes(router);
      return mergeRoute({ host, callbacks: router });
    } else {
      return mergeRoute({ host, callbacks: routes });
    }
  },
};

function setRoute({ method, path, callbacks, group, name }) {
  return new Route({ method, path, callbacks, group, name });
}

function mergeRoute({ host, method, group, callbacks }) {
  const routes = [];
  if (callbacks instanceof Router) {
    callbacks.routes()?.forEach((route) => {
      routes.push(
        setRoute({
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
        })
      );
    });
  } else if (Array.isArray(callbacks)) {
    callbacks.forEach((route) => {
      if (route instanceof Route) {
        routes.push(
          setRoute({
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
          })
        );
      } else {
        throw new TypeError("Error: route should be instanceof Route");
      }
    });
  } else {
    routes.push(setRoute({ host, method, path: group, callbacks }));
  }
  return routes;
}

module.exports = methods;
