const Parser = require("tree-sitter");
const GoLang = require("tree-sitter-go");

async function parseGoUsingTreeSitter(code) {
    console.log("Hi from Go parser");

    try {
        const parser = new Parser();
        parser.setLanguage(GoLang);

        const tree = parser.parse(code);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                FunctionDeclaration: [],
                ImportDeclaration: [],
                VariableDeclaration: [],
                IfStatement: [],
                ForStatement: [],
                WhileStatement: [],
                SwitchStatement: [],
                StructDeclaration: [],
                ReturnStatement: [],
                ExpressionStatement: [],
            };

            extractAST(tree.rootNode, code, extracted);

            // Transform into recommendation-compatible format
            const parsedData = {
                ast: convertToRecommendationFormat(tree.rootNode),
                extracted,
            };

            console.log("Extracted Statements:", extracted);
            return parsedData;
        }
    } catch (e) {
        console.log("Error occurred while parsing Go code:", e);
        return null;
    }
}

// Function to extract code snippet correctly
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

// Function to traverse AST and extract relevant information
function extractAST(node, code, extracted) {
    if (!node) return;

    if (node.type in extracted) {
        const entry = {
            code: extractCode(node, code),
            ast: node, // Store AST for recommendation system
        };

        if (node.type === "FunctionDeclaration") {
            entry.name = node.firstChild.text; // Function name
        }
        if (node.type === "ImportDeclaration") {
            entry.importedPath = node.childForFieldName("path")?.text || "";
        }
        if (node.type === "VariableDeclaration") {
            entry.variables = node.text;
        }
        if (node.type === "IfStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), code);
        }
        if (node.type === "SwitchStatement") {
            entry.expression = extractCode(node.childForFieldName("value"), code);
        }
        if (node.type === "StructDeclaration") {
            entry.name = node.childForFieldName("name")?.text || "";
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), code, extracted);
    }
}

// Converts Tree-Sitter AST to match Recommendation System Structure
function convertToRecommendationFormat(node) {
    if (!node) return null;

    return {
        type: node.type,
        text: node.text || "",
        children: node.children.map(convertToRecommendationFormat),
    };
}

module.exports = { parseGoUsingTreeSitter };
