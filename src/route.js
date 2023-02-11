const supportedMethod = require("./supported-method");

class Route {
  host = null;
  hostRegexp = null;
  method = null;
  path = null;
  pathRegexp = null;
  group = null;
  name = null;
  params = null;
  subdomains = null;
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
      } else if (typeof method === "string" || method instanceof String) {
        if (!supportedMethod.includes(method.toUpperCase())) {
          throw new TypeError(
            `Error: ${method.toUpperCase()} method is not supported`
          );
        }
        method = method.toUpperCase();
      } else {
        throw new TypeError(
          "Error: route method accepts only string or array of string as an argument"
        );
      }
    }

    if (!!path && !(typeof path === "string" || path instanceof String)) {
      throw new TypeError(
        "Error: route path accepts only string as an argument"
      );
    }

    if (Array.isArray(callbacks) === false && typeof callbacks !== "function") {
      throw new TypeError(
        "Error: route callback accepts only function as an argument"
      );
    }

    this.caseSensitive = caseSensitive ?? false;
    this.host = host;
    this.hostRegexp = host ? this.#compileHostRegExp(host) : undefined;
    this.method = method;
    this.path = path;
    this.pathRegexp = path
      ? this.#compileRouteRegExp(path)
      : group
      ? this.#compileMiddlewareRegExp(group)
      : this.#compileMiddlewareRegExp("/");
    this.group = group;
    this.name = name;
    this.params = path ? this.#getParams(path) : this.#getParams(group);
    this.subdomains = this.#getParams(host);
    this.callbacks = Array.isArray(callbacks)
      ? callbacks.map((callback) => {
          if (typeof callback !== "function") {
            throw new TypeError(
              `Error: ${
                !!path ? "route" : "middleware"
              } callback accepts only function as an argument`
            );
          }
          return callback;
        })
      : [callbacks];
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

    if (this.pathRegexp === null) {
      return false;
    }

    const route = {
      host: this.host,
      method: this.method,
      path: this.path,
      callbacks: this.callbacks,
      params: {},
      subdomains: {},
    };

    if (!!this.hostRegexp) {
      const match = this.hostRegexp.exec(host);
      if (match === null) {
        return false;
      }
      if (match.length > 1) {
        let index = 0;
        for (let i = 1; i < match.length ?? 0; i++) {
          if (this.subdomains && this.subdomains.hasOwnProperty(index)) {
            route.subdomains[this.subdomains[index]] = match[i];
          }
          index++;
        }
      }
    }

    if (!!this.method) {
      if (
        Array.isArray(this.method) &&
        !this.method.includes(method.toUpperCase())
      ) {
        return false;
      } else if (method.toUpperCase() !== this.method) {
        return false;
      }
    }

    const match = this.pathRegexp.exec(path);
    if (match === null) {
      return false;
    }

    if (match.length > 1) {
      let index = 0;
      for (let i = 1; i < match.length ?? 0; i++) {
        if (this.params && this.params.hasOwnProperty(index)) {
          route.params[this.params[index]] = match[i];
        }
        index++;
      }
    }
    return route;
  }

  #compileHostRegExp(host) {
    try {
      let regexp = host
        ? host
            .replace(/\{([^\}]+)\:/g, "")
            .replace(/\)\}/g, ")")
            .replace(/\{(.*?)\}/g, "(?:([^.]+?))")
        : "";
      if (this.caseSensitive === true) {
        return regexp ? new RegExp(`^${regexp}$`) : null;
      }
      return regexp ? new RegExp(`^${regexp}$`, "i") : null;
    } catch (err) {
      throw new TypeError(`Error: ${host} invalid regular expression`);
    }
  }

  #compileRouteRegExp(path) {
    try {
      let regexp = path
        ? path
            .replace(/^\/?|\/?$/g, "/?")
            .replace(/\/\?\/\?/, "/?")
            .replace(/\{([^\}]+)\:/g, "")
            .replace(/\)\}/g, ")")
            .replace(/\{(.*?)\}/g, "(?:([^/]+?))")
        : "";
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
        ? path
            .replace(/^\/?|\/?$/g, "/?")
            .replace(/\/\?\/\?/, "/?")
            .replace(/\{([^\}]+)\:/g, "")
            .replace(/\)\}/g, ")")
            .replace(/\{(.*?)\}/g, "(?:([^/]+?))")
        : "";
      if (this.caseSensitive === true) {
        return regexp ? new RegExp(`^${regexp}(?=\/|$)`) : null;
      }
      return regexp ? new RegExp(`^${regexp}(?=\/|$)`, "i") : null;
    } catch (err) {
      throw new TypeError(`Error: ${path} invalid regular expression`);
    }
  }

  #getParams(path) {
    let params = path ? path.match(/(?<=\{).+?(?=\})/g) : null;
    if (!params) {
      return undefined;
    }
    return params.map((e) => e.replace(/\:\((.*)?/, ""));
  }
}

module.exports = Route;
