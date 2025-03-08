const Parser = require("tree-sitter");
const CSSLang = require("tree-sitter-css");

async function parseCSS(cssCode) {
    console.log("Parsing CSS...");

    try {
        const parser = new Parser();
        parser.setLanguage(CSSLang);

        const tree = parser.parse(cssCode);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                selectors: [],
                properties: [],
                fullRules: [],
            };

            extractCSSAST(tree.rootNode, cssCode, extracted);
            console.log("Extracted CSS Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing CSS:", e);
        return null;
    }
}

// Function to extract code snippets
const extractCode = (node, cssCode) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > cssCode.length) {
            console.error(`Invalid span: start=${start}, end=${end}, CSS length=${cssCode.length}`);
            return "";
        }

        return cssCode.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to extract relevant elements from the CSS AST
function extractCSSAST(node, cssCode, extracted) {
    if (!node) return;

    if (node.type === "rule_set") {
        let selectorNode = node.childForFieldName("selectors");
        let bodyNode = node.childForFieldName("block");

        if (selectorNode) {
            extracted.selectors.push({
                selector: extractCode(selectorNode, cssCode),
                ast: selectorNode,
            });
        }

        if (bodyNode) {
            let properties = [];
            for (let i = 0; i < bodyNode.childCount; i++) {
                if (bodyNode.child(i).type === "declaration") {
                    let propertyNode = bodyNode.child(i).childForFieldName("property");
                    let valueNode = bodyNode.child(i).childForFieldName("value");

                    if (propertyNode && valueNode) {
                        properties.push({
                            property: extractCode(propertyNode, cssCode),
                            value: extractCode(valueNode, cssCode),
                        });

                        extracted.properties.push({
                            property: extractCode(propertyNode, cssCode),
                            value: extractCode(valueNode, cssCode),
                            ast: bodyNode.child(i),
                        });
                    }
                }
            }

            extracted.fullRules.push({
                selector: extractCode(selectorNode, cssCode),
                properties,
                code: extractCode(node, cssCode),
                ast: node,
            });
        }
    }

    for (let i = 0; i < node.childCount; i++) {
        extractCSSAST(node.child(i), cssCode, extracted);
    }
}

module.exports = { parseCSS };
