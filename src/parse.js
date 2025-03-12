const { parseJsUsingSWC } = require("./Languages/javascript/parserJs.js");
const { parseGoUsingTreeSitter } = require("./Languages/golang/parseGo.js");
const { parsePythonUsingTreeSitter } = require("./Languages/python/parsePython.js");
const { parseJavaUsingTreeSitter } = require("./Languages/java/parseJava.js");
const { parseCppUsingTreeSitter } = require("./Languages/cpp/parseCpp.js");
const { parseCUsingTreeSitter } = require("./Languages/c/parseC.js");
const { parseCSharpUsingTreeSitter } = require("./Languages/c#/parseCSharp.js");
const { parseRustUsingTreeSitter } = require("./Languages/rust/parseRust.js");
const { parseSwiftUsingTreeSitter } = require("./Languages/swift/parseSwift.js");
const { parseKotlinUsingTreeSitter } = require("./Languages/kotlin/parseKotlin.js");
const { parseRubyUsingTreeSitter } = require("./Languages/ruby/parseRuby.js");
const { parsePHPUsingTreeSitter } = require("./Languages/php/parsePhp.js");
const { parseHTMLWithEmbeddedUsingTreeSitter } = require("./Languages/html/parseHtml.js");
const { parseCssUsingTreeSitter } = require("./Languages/css/parseCss.js");
// const { parseSqlUsingTreeSitter } = require("./Languages/sql/parseSql.js");
// const { parsePowerShellUsingTreeSitter } = require("./Languages/powershell/parsePowerShell.js");
const { parseBashUsingTreeSitter } = require("./Languages/bash/parseBash.js");

const swc = require("@swc/core");

async function parseCode(language, framework, text_buff) {
  if (!language || language === "") {
    throw new Error("Language must be specified.");
  }

  let config;

  switch (language.name) {
    case "javascript":
      config = {
        syntax: "ecmascript",
        jsx: framework && ["react", "next.js", "solid"].includes(framework.name),
        isModule: language.ismodule ?? true,
        dynamicImport: true,
        minify: false,
        preserveAllComments: true,
      };
      return await parseJsUsingSWC(text_buff, config);

    case "typescript":
      config = {
        syntax: "typescript",
        tsx: framework && ["react", "next.js", "solid"].includes(framework.name),
        isModule: language.ismodule ?? true,
        dynamicImport: true,
        minify: false,
        preserveAllComments: true,
      };
      return await parseJsUsingSWC(text_buff, config);

    case "golang":
      return await parseGoUsingTreeSitter(text_buff);

    case "python":
      return await parsePythonUsingTreeSitter(text_buff);

    case "java":
      return await parseJavaUsingTreeSitter(text_buff);

    case "cpp":
      return await parseCppUsingTreeSitter(text_buff);

    case "c":
      return await parseCUsingTreeSitter(text_buff);

    case "csharp":
      return await parseCSharpUsingTreeSitter(text_buff);

    case "rust":
      return await parseRustUsingTreeSitter(text_buff);

    case "swift":
      return await parseSwiftUsingTreeSitter(text_buff);

    case "kotlin":
      return await parseKotlinUsingTreeSitter(text_buff);

    case "ruby":
      return await parseRubyUsingTreeSitter(text_buff);

    case "php":
      return await parsePHPUsingTreeSitter(text_buff);

    case "html":
      return await parseHTMLWithEmbeddedUsingTreeSitter(text_buff);

    case "css":
      return await parseCssUsingTreeSitter(text_buff);

    case "sql":
      // return await parseSqlUsingTreeSitter(text_buff);
      throw new Error(`Unsupported language: ${language.name}`);

    case "powershell":
      // return await parsePowerShellUsingTreeSitter(text_buff);
      throw new Error(`Unsupported language: ${language.name}`);

    case "bash":
      return await parseBashUsingTreeSitter(text_buff);

    default:
      throw new Error(`Unsupported language: ${language.name}`);
  }
}

module.exports = { parseCode };
