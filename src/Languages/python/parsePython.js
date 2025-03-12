const Parser = require("tree-sitter");
const PythonLang = require("tree-sitter-python");

// Function to parse Python code and extract key constructs
async function parsePythonUsingTreeSitter(code) {
    console.log("Hi from Python parser");

    try {
        const parser = new Parser();
        parser.setLanguage(PythonLang);

        const tree = parser.parse(code);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                FunctionDefinition: [],
                ImportStatement: [],
                VariableAssignment: [],
                IfStatement: [],
                ForStatement: [],
                WhileStatement: [],
                TryStatement: [],
                ClassDefinition: [],
                ReturnStatement: [],
                ExpressionStatement: [],
            };

            extractAST(tree.rootNode, code, extracted);
            console.log("Extracted Statements:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error occurred while parsing Python code:", e);
        return null;
    }
}

// Function to extract correct code snippet
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

        if (node.type === "FunctionDefinition") {
            entry.name = node.childForFieldName("name")?.text || "";
        }
        if (node.type === "ImportStatement") {
            entry.importedModule = node.childForFieldName("module")?.text || "";
        }
        if (node.type === "VariableAssignment") {
            entry.variables = node.text;
        }
        if (node.type === "IfStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), code);
        }
        if (node.type === "TryStatement") {
            entry.exceptionHandlers = extractCode(node.childForFieldName("handlers"), code);
        }
        if (node.type === "ClassDefinition") {
            entry.name = node.childForFieldName("name")?.text || "";
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), code, extracted);
    }
}

module.exports = { parsePythonUsingTreeSitter };
