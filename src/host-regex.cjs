module.exports = function hostRegex(str, options = { caseSensitive: false }) {
  const caseSensitive = options?.caseSensitive ?? false;
  const tokens = [];
  let i = 0;
  let key = 0;
  while (i < str.length) {
    let char = str[i];

    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", value: str[i + 1] ?? "\\" });
      i = i + 2;
      continue;
    }

    if (char === "*" || char === "+" || char === "?") {
      if (char === "*") {
        tokens.push({
          type: "MODIFIER",
          value: str[i++],
          name: key++,
          regex: "(.*)",
        });
      } else {
        tokens.push({ type: "MODIFIER", value: str[i++] });
      }
      continue;
    }

    if (char === ".") {
      tokens.push({ type: "DELIMITER", value: str[i++] });
      continue;
    }

    if (char === ":") {
      let name = "";
      let j = i + 1;

      while (j < str.length) {
        const code = str.charCodeAt(j);
        if (
          // `0-9`
          (code >= 48 && code <= 57) ||
          // `A-Z`
          (code >= 65 && code <= 90) ||
          // `a-z`
          (code >= 97 && code <= 122) ||
          // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }

      if (!name) throw new TypeError(`Missing parameter name at ${i}`);

      tokens.push({
        type: "PARAM",
        value: name,
        name,
        regex: "([^\\.]+?)",
      });
      i = j;
      continue;
    }

    if (char === "(") {
      let count = 1;
      let pattern = "";
      let j = i + 1;

      if (str[j] === "?") {
        throw new TypeError(`Pattern cannot start with "?" at ${j}`);
      }

      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }

        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError(`Capturing groups are not allowed at ${j}`);
          }
        }

        pattern += str[j++];
      }

      if (count) throw new TypeError(`Unbalanced pattern at ${i}`);
      if (!pattern) throw new TypeError(`Missing pattern at ${i}`);

      if (tokens.length > 0 && tokens[tokens.length - 1].type === "PARAM") {
        tokens[tokens.length - 1] = {
          type: "PARAM_REGEX",
          value: pattern,
          name: tokens[tokens.length - 1].name,
          regex: "(" + pattern + ")",
        };
      } else {
        tokens.push({
          type: "REGEX",
          value: pattern,
          name: key++,
          regex: "(" + pattern + ")",
        });
      }
      i = j;
      continue;
    }

    let path = "";
    let j = i;
    while (j < str.length) {
      if (
        str[j] === "\\" ||
        str[j] === "*" ||
        str[j] === "+" ||
        str[j] === "?" ||
        str[j] === ":" ||
        str[j] === "(" ||
        str[j] === "."
      ) {
        break;
      }
      // Escape special characters
      path += str[j++];
      continue;
    }
    tokens.push({ type: "PATH", value: path });
    i = j;
  }

  const params = [];
  let pathRegex = "";
  let tokenIndex = 0;
  while (tokenIndex < tokens.length) {
    if (tokens[tokenIndex].type === "DELIMITER") {
      if (
        tokens[tokenIndex + 1] &&
        (tokens[tokenIndex + 1].type === "PARAM" ||
          tokens[tokenIndex + 1].type === "PARAM_REGEX" ||
          tokens[tokenIndex + 1].type === "REGEX")
      ) {
        if (
          tokens[tokenIndex + 2] &&
          tokens[tokenIndex + 2].type === "MODIFIER" &&
          tokens[tokenIndex + 2].value === "?" &&
          (typeof tokens[tokenIndex + 3] === "undefined" ||
            tokens[tokenIndex + 3].type === "DELIMITER")
        ) {
          tokenIndex++;
          continue;
        }
      }
      pathRegex += tokens[tokenIndex++].value;
      continue;
    }

    if (
      tokens[tokenIndex].type === "PARAM" ||
      tokens[tokenIndex].type === "PARAM_REGEX" ||
      tokens[tokenIndex].type === "REGEX"
    ) {
      let param = {
        name: tokens[tokenIndex].name,
        regex: tokens[tokenIndex].regex,
        optional: tokens[tokenIndex + 1]
          ? tokens[tokenIndex + 1].type === "MODIFIER" &&
            tokens[tokenIndex + 1].value === "?"
          : false,
      };

      if (param.optional === true) {
        if (
          tokens[tokenIndex - 1] &&
          tokens[tokenIndex - 1].type === "DELIMITER" &&
          (typeof tokens[tokenIndex + 2] === "undefined" ||
            tokens[tokenIndex + 2].type === "DELIMITER")
        ) {
          param.regex = "(?:\\." + param.regex + ")?";
          tokenIndex = tokenIndex + 2;
        } else if (
          typeof tokens[tokenIndex - 1] === "undefined" &&
          typeof tokens[tokenIndex + 2] &&
          tokens[tokenIndex + 2].type === "DELIMITER"
        ) {
          param.regex = "(?:" + param.regex + "\\.)?";
          tokenIndex = tokenIndex + 3;
        } else {
          param.regex = param.regex;
          tokenIndex++;
        }
      } else {
        param.regex = param.regex;
        tokenIndex++;
      }

      params.push(param);
      pathRegex += param.regex;
      continue;
    }

    if (
      tokens[tokenIndex].type === "MODIFIER" &&
      tokens[tokenIndex].value === "*"
    ) {
      let param = {
        name: tokens[tokenIndex].name,
        regex: tokens[tokenIndex].regex,
        optional: false,
      };

      params.push(param);
      pathRegex += param.regex;
      tokenIndex++;
      continue;
    }

    if (tokens[tokenIndex].type === "ESCAPED_CHAR") {
      pathRegex += "\\" + tokens[tokenIndex++].value;
      continue;
    }

    if (tokens[tokenIndex].type === "PATH") {
      pathRegex += tokens[tokenIndex++].value.replace(
        /([.+*?=^!:${}()[\]|/\\])/g,
        "\\$1"
      );
      continue;
    }
    pathRegex += tokens[tokenIndex++].value;
  }

  pathRegex = pathRegex.replace(/\/$/gm, "");
  if (pathRegex === "") {
    pathRegex = "";
  } else {
    pathRegex = `^${pathRegex}(?:\\:\\d+)?$`;
  }
  let regex =
    caseSensitive === false
      ? new RegExp(pathRegex, "i")
      : new RegExp(pathRegex);

  return {
    host: str,
    params,
    regex: regex,
    compile(params = {}, options = { validate: false }) {
      const validate = options?.validate ?? false;
      let compiledPath = "";
      let i = 0;
      while (i < tokens.length) {
        if (tokens[i].type === "DELIMITER") {
          compiledPath += tokens[i++].value;
          continue;
        }
        if (tokens[i].type === "PATH") {
          compiledPath += tokens[i++].value;
          continue;
        }
        if (
          tokens[i].type === "PARAM" ||
          tokens[i].type === "PARAM_REGEX" ||
          tokens[i].type === "REGEX" ||
          (tokens[i].type === "MODIFIER" && tokens[i].value === "*")
        ) {
          if (params.hasOwnProperty(tokens[i].name)) {
            compiledPath += params[tokens[i++].name];
            continue;
          } else {
            if (
              tokens[i + 1] &&
              tokens[i + 1].type === "MODIFIER" &&
              tokens[i + 1].value === "?"
            ) {
              if (tokens[i + 2] && tokens[i + 2].type === "DELIMITER") {
                i = i + 3;
                continue;
              }
            } else {
              throw new TypeError(
                "invalid route parameters, please provide all route parameters"
              );
            }
          }
        }
        i++;
      }
      return compiledPath;
    },
  };
};
