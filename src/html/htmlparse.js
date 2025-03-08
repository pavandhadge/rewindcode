const Parser = require("tree-sitter");
const HTMLLang = require("tree-sitter-html");
const CSSLang = require("tree-sitter-css");
const JSLang = require("tree-sitter-javascript");

async function parseHTMLWithEmbedded(htmlCode) {
    console.log("Parsing HTML...");

    try {
        const parser = new Parser();
        parser.setLanguage(HTMLLang);

        const tree = parser.parse(htmlCode);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                HTMLElement: [],
                InlineCSS: [],
                ExternalCSS: [],
                InlineJS: [],
                ExternalJS: [],
            };

            extractAST(tree.rootNode, htmlCode, extracted);
            console.log("Extracted HTML Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing HTML:", e);
        return null;
    }
}

// Function to extract code snippets
const extractCode = (node, htmlCode) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > htmlCode.length) {
            console.error(`Invalid span: start=${start}, end=${end}, Script length=${htmlCode.length}`);
            return "";
        }

        return htmlCode.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to extract relevant elements from the AST
function extractAST(node, htmlCode, extracted) {
    if (!node) return;

    if (node.type === "element") {
        const tagName = node.childForFieldName("name");
        extracted.HTMLElement.push({
            tag: extractCode(tagName, htmlCode),
            attributes: extractAttributes(node, htmlCode),
            code: extractCode(node, htmlCode),
            ast: node,
        });
    } else if (node.type === "style_element") {
        extracted.InlineCSS.push({
            css: extractCode(node, htmlCode),
            ast: node,
        });
    } else if (node.type === "script_element") {
        extracted.InlineJS.push({
            js: extractCode(node, htmlCode),
            ast: node,
        });
    } else if (node.type === "attribute" && node.childForFieldName("name").text === "href") {
        if (node.childForFieldName("value")?.text.endsWith(".css")) {
            extracted.ExternalCSS.push({
                link: extractCode(node.childForFieldName("value"), htmlCode),
            });
        }
    } else if (node.type === "attribute" && node.childForFieldName("name").text === "src") {
        if (node.childForFieldName("value")?.text.endsWith(".js")) {
            extracted.ExternalJS.push({
                script: extractCode(node.childForFieldName("value"), htmlCode),
            });
        }
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), htmlCode, extracted);
    }
}

// Function to extract attributes from an HTML element
function extractAttributes(node, htmlCode) {
    let attributes = [];
    for (let i = 0; i < node.childCount; i++) {
        if (node.child(i).type === "attribute") {
            let attrName = extractCode(node.child(i).childForFieldName("name"), htmlCode);
            let attrValue = extractCode(node.child(i).childForFieldName("value"), htmlCode);
            attributes.push({ name: attrName, value: attrValue });
        }
    }
    return attributes;
}

module.exports = { parseHTMLWithEmbedded };
