const Parser = require("tree-sitter");
const SwiftLang = require("tree-sitter-swift");

// Function to parse Swift code and extract relevant constructs
async function parseSwiftUsingTreeSitter(swiftCode) {
    console.log("Parsing Swift code...");

    try {
        const parser = new Parser();
        parser.setLanguage(SwiftLang);

        const tree = parser.parse(swiftCode);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                FunctionDeclaration: [],
                ClassDeclaration: [],
                StructDeclaration: [],
                IfStatement: [],
                ForStatement: [],
                WhileStatement: [],
                RepeatWhileStatement: [],
                VariableDeclaration: [],
                MethodCall: [],
            };

            extractAST(tree.rootNode, swiftCode, extracted);
            console.log("Extracted Swift Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing Swift code:", e);
        return null;
    }
}

// Function to extract the correct Swift snippet
const extractCode = (node, swiftCode) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > swiftCode.length) {
            console.error(`Invalid span: start=${start}, end=${end}, Script length=${swiftCode.length}`);
            return "";
        }

        return swiftCode.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to traverse AST and extract relevant Swift constructs
function extractAST(node, swiftCode, extracted) {
    if (!node) return;

    if (node.type in extracted) {
        const entry = {
            code: extractCode(node, swiftCode),
            ast: node,
        };

        if (node.type === "FunctionDeclaration") {
            entry.name = extractCode(node.childForFieldName("name"), swiftCode);
        }
        if (node.type === "ClassDeclaration" || node.type === "StructDeclaration") {
            entry.name = extractCode(node.childForFieldName("name"), swiftCode);
        }
        if (node.type === "IfStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), swiftCode);
        }
        if (node.type === "ForStatement" || node.type === "WhileStatement" || node.type === "RepeatWhileStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), swiftCode);
        }
        if (node.type === "VariableDeclaration") {
            entry.variable = extractCode(node.childForFieldName("name"), swiftCode);
            entry.value = extractCode(node.childForFieldName("value"), swiftCode);
        }
        if (node.type === "MethodCall") {
            entry.method = extractCode(node.childForFieldName("function"), swiftCode);
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), swiftCode, extracted);
    }
}

module.exports = { parseSwiftUsingTreeSitter };
