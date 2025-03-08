const Parser = require("tree-sitter");
const CppLang = require("tree-sitter-cpp");

// Function to parse C++ code and extract key constructs
async function parseCppUsingTreeSitter(code) {
    console.log("Parsing C++ code...");

    try {
        const parser = new Parser();
        parser.setLanguage(CppLang);

        const tree = parser.parse(code);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                ClassSpecifier: [],
                FunctionDefinition: [],
                ConstructorDeclaration: [],
                VariableDeclaration: [],
                IfStatement: [],
                WhileStatement: [],
                ForStatement: [],
                SwitchStatement: [],
                ReturnStatement: [],
                ExpressionStatement: [],
            };

            extractAST(tree.rootNode, code, extracted);
            console.log("Extracted C++ Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing C++ code:", e);
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

// Function to traverse AST and extract relevant C++ constructs
function extractAST(node, code, extracted) {
    if (!node) return;

    if (node.type in extracted) {
        const entry = {
            code: extractCode(node, code),
            ast: node,
        };

        if (node.type === "ClassSpecifier") {
            entry.name = node.childForFieldName("name")?.text || "";
        }
        if (node.type === "FunctionDefinition") {
            entry.name = node.childForFieldName("name")?.text || "";
            entry.parameters = extractCode(node.childForFieldName("parameters"), code);
        }
        if (node.type === "ConstructorDeclaration") {
            entry.name = node.childForFieldName("name")?.text || "";
        }
        if (node.type === "VariableDeclaration") {
            entry.variables = extractCode(node, code);
        }
        if (node.type === "IfStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), code);
        }
        if (node.type === "SwitchStatement") {
            entry.switchValue = extractCode(node.childForFieldName("value"), code);
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), code, extracted);
    }
}

module.exports = { parseCppUsingTreeSitter };
