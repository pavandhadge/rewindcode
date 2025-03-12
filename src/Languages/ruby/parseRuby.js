const Parser = require("tree-sitter");
const RubyLang = require("tree-sitter-ruby");

// Function to parse Ruby code and extract relevant constructs
async function parseRubyUsingTreeSitter(rubyCode) {
    console.log("Parsing Ruby code...");

    try {
        const parser = new Parser();
        parser.setLanguage(RubyLang);

        const tree = parser.parse(rubyCode);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                MethodDeclaration: [],
                ClassDeclaration: [],
                ModuleDeclaration: [],
                IfStatement: [],
                WhileStatement: [],
                UntilStatement: [],
                ForStatement: [],
                VariableAssignment: [],
                MethodCall: [],
            };

            extractAST(tree.rootNode, rubyCode, extracted);
            console.log("Extracted Ruby Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing Ruby code:", e);
        return null;
    }
}

// Function to extract the correct Ruby snippet
const extractCode = (node, rubyCode) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > rubyCode.length) {
            console.error(`Invalid span: start=${start}, end=${end}, Script length=${rubyCode.length}`);
            return "";
        }

        return rubyCode.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to traverse AST and extract relevant Ruby constructs
function extractAST(node, rubyCode, extracted) {
    if (!node) return;

    if (node.type === "method") {
        extracted.MethodDeclaration.push({
            name: extractCode(node.childForFieldName("name"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "class") {
        extracted.ClassDeclaration.push({
            name: extractCode(node.childForFieldName("name"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "module") {
        extracted.ModuleDeclaration.push({
            name: extractCode(node.childForFieldName("name"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "if") {
        extracted.IfStatement.push({
            condition: extractCode(node.childForFieldName("condition"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "while") {
        extracted.WhileStatement.push({
            condition: extractCode(node.childForFieldName("condition"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "until") {
        extracted.UntilStatement.push({
            condition: extractCode(node.childForFieldName("condition"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "for") {
        extracted.ForStatement.push({
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "assignment") {
        extracted.VariableAssignment.push({
            variable: extractCode(node.childForFieldName("left"), rubyCode),
            value: extractCode(node.childForFieldName("right"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    } else if (node.type === "call") {
        extracted.MethodCall.push({
            method: extractCode(node.childForFieldName("method"), rubyCode),
            code: extractCode(node, rubyCode),
            ast: node,
        });
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), rubyCode, extracted);
    }
}

module.exports = { parseRubyUsingTreeSitter };
