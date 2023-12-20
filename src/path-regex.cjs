module.exports = function pathRegex(path, options = { caseSensitive: false }) {
  let pathRegex = "";
  let params = [];
  let param = {};
  let isEscape = false;
  let caseSensitive = options?.caseSensitive ?? false;
  for (let i = 0; i < path.length; i++) {
    let char = path[i];
    // Match escape character
    if (path[i] === "\\" && isEscape === false) {
      isEscape = true;
      if (param.hasParamName === true && param.hasParamRegex !== true) {
        param.nameEnd = i - 1;
        if (param.nameStart !== param.nameEnd) {
          params.push(param);
        }
        param = {};
      }
      if (i == path.length - 1) {
        char += `\\${char}`;
      }
    } else if (isEscape === true) {
      // Ignore escaped character
      isEscape = false;
      if (param.hasParamRegex !== true && path[i] !== "\\") {
        // Escape special characters
        if (path[i].match(/[^\.\^\$\[\]\{\}\|\*\+\?\(\)]/g)) {
          char = `\\${char}`;
        }
      }
    } else {
      // Match params
      if (path[i] === ":") {
        if (param.hasParamName === true) {
          param.nameEnd = i - 1;
          if (param.nameStart !== param.nameEnd) {
            params.push(param);
          }
          param = {};
        }
        param.nameStart = i;
        param.hasParamName = true;
      } else if (param.hasParamRegex !== true && path[i].match(/^[\/]$/i)) {
        if (param.hasParamName === true) {
          param.nameEnd = i - 1;
          param.hasParamRegex = param.hasParamRegex === true;
          if (param.nameStart !== param.nameEnd) {
            params.push(param);
          }
        }
        param = {};
      } else if (path[i].match(/^[^A-Za-z0-9_]+$/i)) {
        if (path[i] === "(") {
          if (path[i + 1] === "?") {
            if (path[i + 2] == ":") {
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
        } else if (param.hasParamRegex === true && path[i] === ")") {
          param.regexEnd = i;
          if (param.regexStart !== param.regexEnd) {
            params.push(param);
          }
          param = {};
        } else if (param.hasParamRegex !== true && path[i] === "*") {
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
    if (i == path.length - 1) {
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
  pathRegex = pathRegex.replace(/(^\/|\/$)/gm, "");
  if (pathRegex === "") {
    pathRegex = "^/?$";
  } else {
    pathRegex = `^/${pathRegex}/?$`;
  }
  let allParams = [];
  let paramRegexCounter = 0;
  for (let e of params) {
    let regex = path.slice(e.regexStart, e.regexEnd + 1);
    if (regex === "*") {
      regex = "(.*)";
    }
    let replaceStart = e.nameStart ?? e.regexStart;
    let replaceEnd = e.regexEnd ?? e.nameEnd;
    let replaceParam = null;
    let paramDetails = {
      name: path.slice(e.nameStart + 1, e.nameEnd + 1),
      paramRegex: regex === "" ? "([^\\/]+?)" : regex,
      param: path.slice(replaceStart, replaceEnd + 1),
      optional: path[replaceEnd + 1] === "?",
    };
    if (paramDetails.optional === true && path[replaceStart - 1] === "/") {
      replaceParam = `/${paramDetails.param}`;
      paramDetails.paramRegex = `(:?\\/${paramDetails.paramRegex})`;
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

  // Compile regex to path
  function compile(params = {}, options = {}) {
    let tmpPath = regex.source;
    let validate = options?.validate ?? false;
    for (let e of allParams) {
      if (params.hasOwnProperty(e.name)) {
        let replaceStr = e.paramRegex;
        if (e.optional === true) {
          tmpPath = tmpPath.replace(replaceStr, `/${params[e.name]}`);
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
    compiledPath = compiledPath.replace(/(^\^|\/\$$)/gm, "");
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
    path: path,
    params: allParams,
    regex,
    compile,
  };
};
