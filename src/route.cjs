const LRUCache = require("@opensnip/lrujs");
const hostRegex = require("./host-regex.cjs");
const pathRegex = require("./path-regex.cjs");

module.exports = class Route {
  host = null;
  hostRegexp = null;
  method = null;
  path = null;
  pathRegexp = null;
  compilePathRegexpToPath = null;
  group = null;
  name = null;
  params = null;
  subdomains = null;
  callbacks = null;
  caseSensitive = false;
  #regexCache = null;

  constructor({ host, method, path, name, group, callbacks, caseSensitive }) {
    if (host && !(typeof host === "string" || host instanceof String)) {
      throw new TypeError("route host accepts only string as an argument");
    }

    if (method) {
      if (Array.isArray(method)) {
        method = method.map((e) => {
          if (!(typeof e === "string" || e instanceof String)) {
            throw new TypeError(
              "route method accepts only string or array of string as an argument"
            );
          }
          return e.toUpperCase();
        });
      } else if (typeof method === "string" || method instanceof String) {
        method = method.toUpperCase();
      } else {
        throw new TypeError(
          "route method accepts only string or array of string as an argument"
        );
      }
    }

    if (path && !(typeof path === "string" || path instanceof String)) {
      throw new TypeError("route path accepts only string as an argument");
    }

    if (Array.isArray(callbacks) === false && typeof callbacks !== "function") {
      throw new TypeError(
        "route callback accepts only function as an argument"
      );
    }

    let hostRegexp = host ? this.#compileHostRegExp(host) : {};
    let pathRegexp = path
      ? this.#compileRouteRegExp(path)
      : group
      ? this.#compileMiddlewareRegExp(group)
      : this.#compileMiddlewareRegExp("/");

    this.caseSensitive = caseSensitive ?? false;
    this.host = host;
    this.hostRegexp = hostRegexp?.regexp;
    this.method = method;
    this.path = path;
    this.pathRegexp = pathRegexp?.regexp;
    this.compilePathRegexpToPath = pathRegexp?.compile;
    this.group = group;
    this.name = name;
    this.params = pathRegexp?.params;
    this.subdomains = hostRegexp?.params;
    this.callbacks = Array.isArray(callbacks)
      ? callbacks.map((callback) => {
          if (typeof callback !== "function") {
            throw new TypeError(
              "" +
                (path ? "route" : "middleware") +
                " callback accepts only function as an argument"
            );
          }
          return callback;
        })
      : [callbacks];
    this.#regexCache = new LRUCache({
      maxLength: 250,
    });
  }

  setName(name) {
    this.name = name;
    return this;
  }

  match({ host, method, path }) {
    if (host && !(typeof host === "string" || host instanceof String)) {
      throw new TypeError("request host accepts only string as an argument");
    }

    if (!method) {
      throw new TypeError("request method is required");
    }

    if (!(typeof method === "string" || method instanceof String)) {
      throw new TypeError("request method accepts only string as an argument");
    }

    if (!path) {
      throw new TypeError("request path is required");
    }

    if (!(typeof path === "string" || path instanceof String)) {
      throw new TypeError("request path accepts only string as an argument");
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

    if (this.hostRegexp) {
      let match = this.#regexCache.get("host:" + host);
      if (typeof match === "undefined") {
        match = this.hostRegexp.exec(host);
        this.#regexCache.set("host:" + host, match);
      }
      if (match === null) {
        return false;
      }
      if (match.length > 1 && this.subdomains.length > 0) {
        for (let i = 1; i < match.length ?? 0; i++) {
          if (this.subdomains.hasOwnProperty(i - 1)) {
            route.subdomains[this.subdomains[i - 1]] = match[i];
          }
        }
      }
    }

    if (this.method) {
      if (Array.isArray(this.method)) {
        if (!this.method.includes(method.toUpperCase())) {
          return false;
        }
      } else if (method.toUpperCase() !== this.method) {
        return false;
      }
    }

    let match = this.#regexCache.get("path:" + path);
    if (typeof match === "undefined") {
      match = this.pathRegexp.exec(path);
      this.#regexCache.set("path:" + path, match);
    }
    if (match === null) {
      return false;
    }

    if (match.length > 1 && this.params.length > 0) {
      for (let i = 1; i < match.length ?? 0; i++) {
        if (this.params.hasOwnProperty(i - 1)) {
          route.params[this.params[i - 1]] = match[i];
        }
      }
    }
    return route;
  }

  #compileHostRegExp(host) {
    try {
      let hostRegexp = hostRegex(host, {
        caseSensitive: this.caseSensitive,
      });
      return {
        regexp: hostRegexp.regex,
        params: hostRegexp.params.map((e) => e.name),
        compile: hostRegexp.compile,
      };
    } catch (err) {
      throw new TypeError("" + host + " invalid regular expression");
    }
  }

  #compileRouteRegExp(path) {
    try {
      let pathRegexp = pathRegex(path, {
        caseSensitive: this.caseSensitive,
      });
      return {
        regexp: pathRegexp.regex,
        params: pathRegexp.params.map((e) => e.name),
        compile: pathRegexp.compile,
      };
    } catch (err) {
      throw new TypeError("" + path + " invalid regular expression");
    }
  }

  #compileMiddlewareRegExp(path) {
    try {
      let pathRegexp = pathRegex(path, {
        caseSensitive: this.caseSensitive,
      });
      let regexp = new RegExp(
        pathRegexp.regex.source.replace(/(\$$)/gm, "(?=/|$)")
      );
      return {
        regexp,
        params: pathRegexp.params.map((e) => e.name),
        compile: pathRegexp.compile,
      };
    } catch (err) {
      throw new TypeError("" + path + " invalid regular expression");
    }
  }
};
