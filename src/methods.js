const path = require("node:path");
const Route = require("./route");
const Router = require("./router");
const supportedMethod = require("./supported-method");

const methods = {
  use(...callbacks) {
    if (typeof callbacks[0] === "string" || callbacks[0] instanceof String) {
      if (callbacks.length < 2) {
        throw new TypeError(
          "Error: use function accepts only function or router as an argument"
        );
      }
      if (callbacks.length == 2) {
        return mergeRoute({
          group: callbacks[0],
          callbacks: callbacks[1],
        });
      } else {
        return setRoute({ path: callbacks[0], callbacks: callbacks.slice(1) });
      }
    } else {
      return setRoute({ callbacks: callbacks });
    }
  },

  route(method, path, ...callbacks) {
    return setRoute({ method, path, callbacks });
  },

  all(path, ...callbacks) {
    return setRoute({ method: supportedMethod, path, callbacks });
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
