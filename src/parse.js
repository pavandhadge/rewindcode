const { parseJsUsingSWC } = require("./languages/javascript/parserJs.js");
const { parseGoUsingTreeSitter } = require("./languages/golang/parseGo.js");
const { parsePythonUsingTreeSitter } = require("./languages/python/parsePython.js");
const { parseJavaUsingTreeSitter } = require("./languages/java/parseJava.js");
const { parseCppUsingTreeSitter } = require("./languages/cpp/parseCpp.js");
const { parseCUsingTreeSitter } = require("./languages/c/parseC.js");
const { parseCSharpUsingTreeSitter} = require("./languages/c#/parseCSharp.js");
const { parseRustUsingTreeSitter } = require("./languages/rust/parseRust.js");
const { parseSwiftUsingTreeSitter } = require("./languages/swift/parseSwift.js");
const { parseKotlinUsingTreeSitter } = require("./languages/kotlin/parseKotlin.js");
const { parseRubyUsingTreeSitter } = require("./languages/ruby/parseRuby.js");
const { parsePHPUsingTreeSitter } = require("./languages/php/parsePhp.js");
const { parseHTMLWithEmbeddedUsingTreeSitter } = require("./languages/html/parseHtml.js");
const { parseCssUsingTreeSitter } = require("./languages/css/parseCss.js");
const { parseSqlUsingTreeSitter } = require("./languages/sql/parseSql.js");
const { parsePowerShellUsingTreeSitter } = require("./languages/powershell/parsePowerShell.js");
const { parseBashUsingTreeSitter } = require("./languages/bash/parseBash.js");

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
            return await parseSqlUsingTreeSitter(text_buff);

        case "powershell":
            return await parsePowerShellUsingTreeSitter(text_buff);

        case "bash":
            return await parseBashUsingTreeSitter(text_buff);

        default:
            throw new Error(`Unsupported language: ${language.name}`);
    }
}

module.exports = { parseCode };
