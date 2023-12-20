export default function hostRegex(host, options = { caseSensitive: false }) {
  let pathRegex = "";
  let params = [];
  let param = {};
  let isEscape = false;
  let caseSensitive = options?.caseSensitive ?? false;
  for (let i = 0; i < host.length; i++) {
    let char = host[i];
    // Match escape character
    if (host[i] === "\\" && isEscape === false) {
      isEscape = true;
      if (param.hasParamName === true && param.hasParamRegex !== true) {
        param.nameEnd = i - 1;
        if (param.nameStart !== param.nameEnd) {
          params.push(param);
        }
        param = {};
      }
      if (i == host.length - 1) {
        char = `\\${char}`;
      }
    } else if (isEscape === true) {
      // Ignore escaped character
      isEscape = false;
      if (param.hasParamRegex !== true && host[i] !== "\\") {
        // Escape special characters
        if (host[i].match(/[^\.\^\$\[\]\{\}\|\*\+\?\(\)]/g)) {
          char = `\\${char}`;
        }
      }
    } else {
      // Match params
      if (host[i] === ":") {
        if (param.hasParamName === true) {
          param.nameEnd = i - 1;
          if (param.nameStart !== param.nameEnd) {
            params.push(param);
          }
          param = {};
        }
        param.nameStart = i;
        param.hasParamName = true;
      } else if (param.hasParamRegex !== true && host[i].match(/^[\.]$/i)) {
        if (param.hasParamName === true) {
          param.nameEnd = i - 1;
          param.hasParamRegex = param.hasParamRegex === true;
          if (param.nameStart !== param.nameEnd) {
            params.push(param);
          }
        }
        if (param.hasParamRegex !== true) {
          char = `\\${char}`;
        }
        param = {};
      } else if (host[i].match(/^[^A-Za-z0-9_]+$/i)) {
        if (host[i] === "(") {
          if (host[i + 1] === "?") {
            if (host[i + 2] == ":") {
              throw new TypeError(
                `non-capturing groups are not allowed at ${i}`
              );
            }
            throw new TypeError(`pattern cannot start with "?" at ${i}`);
          }
          if (param.hasParamRegex === true) {
            throw new TypeError(`capturing groups are not allowed at ${i}`);
          }
          if (param.hasParamName === true && param.nameStart !== i - 1) {
            param.hasParamRegex = true;
            param.regexStart = i;
            param.nameEnd = i - 1;
          } else {
            param = {};
            param.hasParamName = false;
            param.hasParamRegex = true;
            param.regexStart = i;
          }
        } else if (param.hasParamRegex === true && host[i] === ")") {
          param.regexEnd = i;
          if (param.regexStart !== param.regexEnd) {
            params.push(param);
          }
          param = {};
        } else if (param.hasParamRegex !== true && host[i] === "*") {
          param = {};
          param.hasParamName = false;
          param.hasParamRegex = true;
          param.regexStart = i;
          param.regexEnd = i;
          params.push(param);
          param = {};
        } else if (param.hasParamRegex !== true) {
          // Escape special characters
          char = char.replace(/[\.\^\$\[\]\{\}\|\)]+/g, "\\$&");
        }

        if (param.hasParamRegex !== true && param.hasParamName === true) {
          param.nameEnd = i - 1;
          param.hasParamRegex = false;
          if (param.nameStart !== param.nameEnd) {
            params.push(param);
          }
          param = {};
        }
      }
    }
    if (i == host.length - 1) {
      if (
        param.hasParamRegex === true &&
        typeof param.regexEnd === "undefined"
      ) {
        throw new TypeError(`unterminated group at ${i}`);
      }
      if (param.hasParamName === true) {
        param.nameEnd = i;
        param.hasParamRegex = param.hasParamRegex === true;
        if (param.nameStart !== param.nameEnd) {
          params.push(param);
        }
      }
      param = {};
    }
    pathRegex += char;
  }
  if (pathRegex === "") {
    pathRegex = "";
  } else {
    pathRegex = `^${pathRegex}$`;
  }
  let allParams = [];
  let paramRegexCounter = 0;
  for (let e of params) {
    let regex = host.slice(e.regexStart, e.regexEnd + 1);
    if (regex === "*") {
      regex = "(.*)";
    }
    let replaceStart = e.nameStart ?? e.regexStart;
    let replaceEnd = e.regexEnd ?? e.nameEnd;
    let replaceParam = null;
    let paramDetails = {
      name: host.slice(e.nameStart + 1, e.nameEnd + 1),
      paramRegex: regex === "" ? "([^\\.]+?)" : regex,
      param: host.slice(replaceStart, replaceEnd + 1),
      optional: host[replaceEnd + 1] === "?",
    };
    if (paramDetails.optional === true) {
      if (host[replaceStart - 1] === ".") {
        replaceParam = `\\.${paramDetails.param}`;
        paramDetails.paramRegex = `(:?\\.${paramDetails.paramRegex})`;
      } else if (host[replaceEnd + 2] === ".") {
        replaceParam = `${paramDetails.param}?\\.`;
        paramDetails.paramRegex = `(:?${paramDetails.paramRegex}\\.)?`;
      } else {
        replaceParam = paramDetails.param;
      }
    } else {
      replaceParam = paramDetails.param;
    }
    if (paramDetails.name === "") {
      paramDetails.name = paramRegexCounter++;
    }
    if (replaceParam !== null) {
      pathRegex = pathRegex.replace(replaceParam, paramDetails.paramRegex);
    }
    allParams.push(paramDetails);
  }

  let regex =
    caseSensitive === true ? new RegExp(pathRegex, "i") : new RegExp(pathRegex);

  // Compiler regex to path
  function compile(params = {}, options = {}) {
    let tmpPath = regex.source;
    let validate = options?.validate ?? false;
    for (let e of allParams) {
      if (params.hasOwnProperty(e.name)) {
        let replaceStr = e.paramRegex;
        if (e.optional === true) {
          tmpPath = tmpPath.replace(replaceStr, `.${params[e.name]}`);
        } else {
          tmpPath = tmpPath.replace(replaceStr, params[e.name]);
        }
      } else {
        if (e.optional === true) {
          let replaceStr = e.paramRegex;
          tmpPath = tmpPath.replace(replaceStr, "");
        } else {
          throw new TypeError(
            "invalid route parameters, please provide all route parameters"
          );
        }
      }
    }

    let isEscape = false;
    let compiledPath = "";
    for (let i = 0; i < tmpPath.length; i++) {
      let char = tmpPath[i];
      // Match escape character
      if (tmpPath[i] === "\\" && isEscape === false) {
        isEscape = true;
        continue;
      } else if (isEscape === true) {
        // Ignore escaped character
        isEscape = false;
      } else {
        // Match params
        if (tmpPath[i] === "+") {
          char = "";
        } else if (tmpPath[i] === "?") {
          char = "";
        }
      }
      compiledPath += char;
    }
    compiledPath = compiledPath.replace(/(^\^|\$$)/gm, "");
    if (validate === true) {
      if (regex.test(compiledPath)) {
        return compiledPath;
      } else {
        throw new TypeError(
          "invalid route parameters, please provide all route parameters"
        );
      }
    } else {
      return compiledPath;
    }
  }

  return {
    host: host,
    params: allParams,
    regex,
    compile,
  };
}
