const Parser = require("tree-sitter");
const RustLang = require("tree-sitter-rust");

// Function to parse Rust code and extract key constructs
async function parseRustUsingTreeSitter(code) {
    console.log("Parsing Rust code...");

    try {
        const parser = new Parser();
        parser.setLanguage(RustLang);

        const tree = parser.parse(code);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                FunctionItem: [],
                StructItem: [],
                ImplItem: [],
                LetDeclaration: [],
                IfExpression: [],
                WhileExpression: [],
                ForExpression: [],
                MatchExpression: [],
                ReturnStatement: [],
                ExpressionStatement: [],
            };

            extractAST(tree.rootNode, code, extracted);
            console.log("Extracted Rust Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing Rust code:", e);
        return null;
    }
}

// Function to extract the correct code snippet
const extractCode = (node, code) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > code.length) {
            console.error(`Invalid span: start=${start}, end=${end}, code length=${code.length}`);
            return "";
        }

        return code.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to traverse AST and extract information
function extractAST(node, code, extracted) {
    if (!node) return;

    if (node.type in extracted) {
        const entry = {
            code: extractCode(node, code),
            ast: node,
        };

        if (node.type === "FunctionItem") {
            entry.name = node.childForFieldName("name")?.text || "";
        }
        if (node.type === "StructItem") {
            entry.name = node.childForFieldName("name")?.text || "";
        }
        if (node.type === "ImplItem") {
            entry.implFor = node.childForFieldName("type")?.text || "";
        }
        if (node.type === "LetDeclaration") {
            entry.variables = node.text;
        }
        if (node.type === "IfExpression") {
            entry.condition = extractCode(node.childForFieldName("condition"), code);
        }
        if (node.type === "MatchExpression") {
            entry.matchValue = extractCode(node.childForFieldName("value"), code);
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), code, extracted);
    }
}

module.exports = { parseRustUsingTreeSitter };
