const Parser = require("tree-sitter");
const PowerShellLang = require("tree-sitter-powershell");

async function parsePowerShellUsingTreeSitter(psCode) {
    console.log("Parsing PowerShell...");

    try {
        const parser = new Parser();
        parser.setLanguage(PowerShellLang);

        const tree = parser.parse(psCode);
        console.log("AST produced:", tree.rootNode.toString());

        if (tree) {
            let extracted = {
                functions: [],
                commands: [],
                variables: [],
            };

            extractPowerShellAST(tree.rootNode, psCode, extracted);
            console.log("Extracted PowerShell Constructs:", extracted);

            return { ast: tree, extracted };
        }
    } catch (e) {
        console.log("Error while parsing PowerShell:", e);
        return null;
    }
}

// Function to extract code snippets
const extractCode = (node, psCode) => {
    try {
        if (!node || !node.startPosition || !node.endPosition) return "";

        const start = node.startIndex;
        const end = node.endIndex;

        if (start < 0 || end > psCode.length) {
            console.error(`Invalid span: start=${start}, end=${end}, PS length=${psCode.length}`);
            return "";
        }

        return psCode.slice(start, end);
    } catch (error) {
        console.log(`Error extracting code for ${node.type}:`, error);
        return "";
    }
};

// Function to extract relevant elements from the PowerShell AST
function extractPowerShellAST(node, psCode, extracted) {
    if (!node) return;

    if (node.type === "function_definition") {
        let nameNode = node.childForFieldName("name");
        let bodyNode = node.childForFieldName("body");

        if (nameNode && bodyNode) {
            extracted.functions.push({
                name: extractCode(nameNode, psCode),
                body: extractCode(bodyNode, psCode),
                ast: node,
            });
        }
    }

    if (node.type === "command") {
        extracted.commands.push({
            command: extractCode(node, psCode),
            ast: node,
        });
    }

    if (node.type === "variable") {
        extracted.variables.push({
            variable: extractCode(node, psCode),
            ast: node,
        });
    }

    for (let i = 0; i < node.childCount; i++) {
        extractPowerShellAST(node.child(i), psCode, extracted);
    }
}

module.exports = { parsePowerShellUsingTreeSitter };
