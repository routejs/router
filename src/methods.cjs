const nodePath = require("node:path");
const Route = require("./route.cjs");
const Router = require("./router.cjs");

module.exports.use = function use(...callbacks) {
  if (typeof callbacks[0] === "string" || callbacks[0] instanceof String) {
    if (callbacks.length < 2) {
      throw new TypeError(
        "use function callback accepts function or router as an argument"
      );
    }
    return mergeRoute({
      group: callbacks[0],
      callbacks: callbacks.slice(1),
    });
  } else {
    return mergeRoute({ callbacks: callbacks });
  }
};

module.exports.path = function path(method, path, ...callbacks) {
  return setRoute({ method, path, callbacks });
};

module.exports.all = function all(path, ...callbacks) {
  return setRoute({ path, callbacks });
};

module.exports.domain = function domain(host, routes) {
  if (!(typeof host === "string" || host instanceof String)) {
    throw new TypeError("domain host accepts only string as an argument");
  }

  if (typeof routes === "function") {
    const router = new Router();
    routes(router);
    return mergeRoute({ host, callbacks: router });
  } else {
    return mergeRoute({ host, callbacks: routes });
  }
};

function setRoute({ host, method, path, callbacks, group, name }) {
  return new Route({ host, method, path, callbacks, group, name });
}

function mergeRoute({ host, method, group, callbacks }) {
  const routes = [];
  if (callbacks instanceof Router) {
    callbacks.routes().forEach((route) => {
      routes.push(
        setRoute({
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
        })
      );
    });
  } else if (Array.isArray(callbacks)) {
    for (const route of callbacks) {
      if (route instanceof Route) {
        routes.push(
          setRoute({
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
          })
        );
      } else if (Array.isArray(route) || route instanceof Router) {
        routes.push(mergeRoute({ host, method, group, callbacks: route }));
      } else {
        routes.push(setRoute({ host, method, group, callbacks }));
        break;
      }
    }
  } else {
    routes.push(setRoute({ host, method, group, callbacks }));
  }
  return routes;
}
