module.exports = class Route {
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
      const match = this.hostRegexp.exec(host);
      if (match === null) {
        return false;
      }
      if (match.length > 1) {
        for (let i = 1; i < match.length ?? 0; i++) {
          if (this.subdomains && this.subdomains.hasOwnProperty(i - 1)) {
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

    const match = this.pathRegexp.exec(path);
    if (match === null) {
      return false;
    }

    if (match.length > 1) {
      for (let i = 1; i < match.length ?? 0; i++) {
        if (this.params && this.params.hasOwnProperty(i - 1)) {
          route.params[this.params[i - 1]] = match[i];
        }
      }
    }
    return route;
  }

  #compileHostRegExp(host) {
    try {
      let { regexp, params } = this.#compileRegExp(host, ".");
      if (this.caseSensitive === true) {
        regexp = regexp ? new RegExp("^" + regexp + "$") : null;
      } else {
        regexp = regexp ? new RegExp("^" + regexp + "$", "i") : null;
      }
      return { regexp, params };
    } catch (err) {
      throw new TypeError("" + host + " invalid regular expression");
    }
  }

  #compileRouteRegExp(path) {
    try {
      let { regexp, params } = this.#compileRegExp(path);
      if (this.caseSensitive === true) {
        regexp = regexp
          ? new RegExp("^/?" + regexp + "/?$")
          : regexp === ""
          ? new RegExp("^/?$")
          : null;
      } else {
        regexp = regexp
          ? new RegExp("^/?" + regexp + "/?$", "i")
          : regexp === ""
          ? new RegExp("^/?$", "i")
          : null;
      }
      return { regexp, params };
    } catch (err) {
      throw new TypeError("" + path + " invalid regular expression");
    }
  }

  #compileMiddlewareRegExp(path) {
    try {
      let { regexp, params } = this.#compileRegExp(path);
      if (this.caseSensitive === true) {
        regexp = regexp
          ? new RegExp("^/?" + regexp + "/?(?=/|$)")
          : regexp === ""
          ? new RegExp("^/?(?=/|$)")
          : null;
      } else {
        regexp = regexp
          ? new RegExp("^/?" + regexp + "/?(?=/|$)", "i")
          : regexp === ""
          ? new RegExp("^/?(?=/|$)", "i")
          : null;
      }
      return { regexp, params };
    } catch (err) {
      throw new TypeError("" + path + " invalid regular expression");
    }
  }

  #compileRegExp(path, delimiter = "/") {
    try {
      let regexp = [];
      let params = [];
      path.split(new RegExp("(?<!\\\\)\\" + delimiter)).forEach((e) => {
        if (e === "") {
          return;
        }

        let keys = e.match(/(?<=(?<!\\)\{)(([^\{]|\\{)+?)(?=(?<!\\)\})/g);
        if (keys) {
          keys.map((e) => {
            params.push(e.replace(/\:\((.*)?/, ""));
          });
        }

        e = e
          // Esacep regexp special char except inside {} and ()
          .replace(/(?<!\\)[.^$|[\]](?![^{(]*(\}|\)))/g, "\\$&")
          .replace(/(?<!\\)[\*](?![^{(]*(\}|\)))/g, "(?:.*)")
          // Add user defined regexp
          .replace(/(?<!\\)\{(([^\{]|\\{)+?)\:(?=(.*)(?<!\\)\})/g, "")
          .replace(/(?<=\))\}/g, "")
          // Named regexp
          .replace(
            /(?<!\\)\{(([^\{]|\\{)+?)(?<!\\)\}/g,
            "([^\\" + delimiter + "]+?)"
          );

        regexp.push(e);
      });
      return { regexp: regexp.join("\\" + delimiter), params: params };
    } catch (err) {
      console.log(err);
      throw new TypeError("" + path + " invalid regular expression");
    }
  }
};
