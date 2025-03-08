const { parseJsUsingSWC } = require("./javascript/parserJs.js");
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

        default:
            throw new Error(`Unsupported language: ${language.name}`);
    }
}

module.exports = { parseCode };
