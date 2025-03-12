const Parser = require("tree-sitter");
const BashLang = require("tree-sitter-bash");

// Function to parse Bash scripts and extract relevant constructs
async function parseBashUsingTreeSitter(bashScript) {
    console.log("Parsing Bash script...");

    try {
        const parser = new Parser();
        parser.setLanguage(BashLang);

        const tree = parser.parse(bashScript);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                Command: [],
                FunctionDefinition: [],
                IfStatement: [],
                WhileStatement: [],
                ForStatement: [],
                UntilStatement: [],
                Pipeline: [],
                Redirection: [],
                VariableAssignment: [],
            };

            extractAST(tree.rootNode, bashScript, extracted);
            console.log("Extracted Bash Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing Bash script:", e);
        return null;
    }
}

// Function to extract the correct Bash snippet
const extractCode = (node, bashScript) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > bashScript.length) {
            console.error(`Invalid span: start=${start}, end=${end}, Script length=${bashScript.length}`);
            return "";
        }

        return bashScript.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to traverse AST and extract relevant Bash constructs
function extractAST(node, bashScript, extracted) {
    if (!node) return;

    if (node.type in extracted) {
        const entry = {
            code: extractCode(node, bashScript),
            ast: node,
        };

        if (node.type === "FunctionDefinition") {
            entry.name = extractCode(node.childForFieldName("name"), bashScript);
        }
        if (node.type === "IfStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), bashScript);
        }
        if (node.type === "ForStatement") {
            entry.variable = extractCode(node.childForFieldName("variable"), bashScript);
        }
        if (node.type === "WhileStatement" || node.type === "UntilStatement") {
            entry.condition = extractCode(node.childForFieldName("condition"), bashScript);
        }
        if (node.type === "VariableAssignment") {
            entry.variable = extractCode(node.childForFieldName("name"), bashScript);
            entry.value = extractCode(node.childForFieldName("value"), bashScript);
        }

        extracted[node.type].push(entry);
    }

    for (let i = 0; i < node.childCount; i++) {
        extractAST(node.child(i), bashScript, extracted);
    }
}

module.exports = { parseBashUsingTreeSitter };
