const Parser = require("tree-sitter");
const KotlinLang = require("tree-sitter-kotlin");

// Function to parse Kotlin code and extract relevant constructs
async function parseKotlinUsingTreeSitter(kotlinCode) {
    console.log("Parsing Kotlin code...");

    try {
        const parser = new Parser();
        parser.setLanguage(KotlinLang);

        const tree = parser.parse(kotlinCode);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                FunctionDeclaration: [],
                ClassDeclaration: [],
                ObjectDeclaration: [],
                IfStatement: [],
                WhileStatement: [],
                ForStatement: [],
                VariableAssignment: [],
                FunctionCall: [],
            };

            extractAST(tree.rootNode, kotlinCode, extracted);
            console.log("Extracted Kotlin Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing Kotlin code:", e);
        return null;
    }
}

// Function to extract the correct Kotlin snippet
const extractCode = (node, kotlinCode) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > kotlinCode.length) {
            console.error(`Invalid span: start=${start}, end=${end}, Script length=${kotlinCode.length}`);
            return "";
        }

        return kotlinCode.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to traverse AST and extract relevant Kotlin constructs
function extractAST(node, kotlinCode, extracted) {
    if (!node) return;

    if (node.type === "function_declaration") {
        extracted.FunctionDeclaration.push({
            name: extractCode(node.childForFieldName("name"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "class_declaration") {
        extracted.ClassDeclaration.push({
            name: extractCode(node.childForFieldName("name"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "object_declaration") {
        extracted.ObjectDeclaration.push({
            name: extractCode(node.childForFieldName("name"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "if_expression") {
        extracted.IfStatement.push({
            condition: extractCode(node.childForFieldName("condition"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "while_expression") {
        extracted.WhileStatement.push({
            condition: extractCode(node.childForFieldName("condition"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "for_expression") {
        extracted.ForStatement.push({
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "variable_declaration") {
        extracted.VariableAssignment.push({
            variable: extractCode(node.childForFieldName("name"), kotlinCode),
            value: extractCode(node.childForFieldName("initializer"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    } else if (node.type === "call_expression") {
        extracted.FunctionCall.push({
            function: extractCode(node.childForFieldName("function"), kotlinCode),
            code: extractCode(node, kotlinCode),
            ast: node,
        });
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), kotlinCode, extracted);
    }
}

module.exports = { parseKotlinUsingTreeSitter };
