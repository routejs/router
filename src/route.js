const supportedMethod = require("./supported-method");

class Route {
  host = null;
  method = null;
  path = null;
  name = null;
  params = null;
  regexp = null;
  group = null;
  callbacks = null;
  caseSensitive = false;

  constructor({ host, method, path, name, group, callbacks, caseSensitive }) {
    if (!!host && !(typeof host === "string" || host instanceof String)) {
      throw new TypeError(
        "Error: route host accepts only string as an argument"
      );
    }

    if (!!method) {
      if (Array.isArray(method)) {
        method = method.map((e) => {
          if (!(typeof e === "string" || e instanceof String)) {
            throw new TypeError(
              "Error: route method accepts only string or array of string as an argument"
            );
          }
          if (!supportedMethod.includes(e.toUpperCase())) {
            throw new TypeError(
              `Error: ${e.toUpperCase()} method is not supported`
            );
          }
          return e.toUpperCase();
        });
      } else if (
        (typeof method === "string" || method instanceof String) &&
        !supportedMethod.includes(method.toUpperCase())
      ) {
        throw new TypeError(
          `Error: ${method.toUpperCase()} method is not supported`
        );
      } else {
        method = method.toUpperCase();
      }
    }

    if (!!path && !(typeof path === "string" || path instanceof String)) {
      throw new TypeError(
        "Error: route path accepts only string as an argument"
      );
    }

    if (Array.isArray(callbacks) === false) {
      throw new TypeError(
        "Error: route callback accepts only function as an argument"
      );
    }

    this.host = host;
    this.method = method;
    this.path = path;
    this.name = name;
    this.params = this.#getParams(path);
    this.caseSensitive = caseSensitive ?? false;
    this.regexp = path
      ? this.#compileRouteRegExp(path)
      : group
      ? this.#compileMiddlewareRegExp(group)
      : this.#compileMiddlewareRegExp("/");
    this.group = group;
    this.callbacks = callbacks?.map((callback) => {
      if (typeof callback !== "function") {
        throw new TypeError(
          `Error: ${
            !!path ? "route" : "middleware"
          } callback accepts only function as an argument`
        );
      }
      return callback;
    });
  }

  setName(name) {
    this.name = name;
    return this;
  }

  match({ host, method, path }) {
    if (!!host && !(typeof host === "string" || host instanceof String)) {
      throw new TypeError(
        "Error: request host accepts only string as an argument"
      );
    }

    if (!method) {
      throw new TypeError("Error: request method is required");
    }

    if (!(typeof method === "string" || method instanceof String)) {
      throw new TypeError(
        "Error: request method accepts only string as an argument"
      );
    }

    if (!path) {
      throw new TypeError("Error: request path is required");
    }

    if (!(typeof path === "string" || path instanceof String)) {
      throw new TypeError(
        "Error: request path accepts only string as an argument"
      );
    }

    if (this.regexp === null) {
      return false;
    }

    const route = {
      host: this.host,
      method: this.method,
      path: this.path,
      callbacks: this.callbacks,
      params: {},
    };

    if (!!this.host && host !== this.host) {
      return false;
    }

    if (!!this.method && method.toUpperCase() !== this.method) {
      return false;
    }

    const match = this.regexp?.exec(path);
    if (match === null) {
      return false;
    }

    if (match.length > 1) {
      let index = 0;
      for (let i = 1; i < match?.length ?? 0; i++) {
        if (this.params?.hasOwnProperty(index)) {
          route.params[this.params[index]] = match[i];
        }
        index++;
      }
    }
    return route;
  }

  #compileRouteRegExp(path) {
    try {
      let regexp = path
        ?.replace(/\/?$/, "\\/?")
        ?.replace(/\/:([^\\/]+)/g, "/([^\\/]+?)");
      if (this.caseSensitive === true) {
        return regexp ? new RegExp(`^${regexp}$`) : null;
      }
      return regexp ? new RegExp(`^${regexp}$`, "i") : null;
    } catch (err) {
      throw new TypeError(`Error: ${path} invalid regular expression`);
    }
  }

  #compileMiddlewareRegExp(path) {
    try {
      let regexp = path
        ?.replace(/\/?$/, "\\/?")
        ?.replace(/\/:([^\\/]+)/g, "/([^\\/]+?)");
      if (this.caseSensitive === true) {
        return regexp ? new RegExp(`^${regexp}(?:[\\/].*)?$`) : null;
      }
      return regexp ? new RegExp(`^${regexp}(?:[\\/].*)?$`, "i") : null;
    } catch (err) {
      throw new TypeError(`Error: ${path} invalid regular expression`);
    }
  }

  #getParams(path) {
    let params = path?.match(/\/:([^\/]*)/g)?.map((e) => e.replace("/:", ""));
    if (!params) {
      params = undefined;
    }
    return params;
  }
}

module.exports = Route;
