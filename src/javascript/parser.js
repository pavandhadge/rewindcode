const swc = require("@swc/core");

async function parseJsUsingSWC(code, config = null) {
  console.log("hi from js parser");
  try {
    // Parse the code to get AST
    const ast = swc.parseSync(code, {
      syntax: "ecmascript",
      jsx: true,
      isModule: true,
      dynamicImport: true,
    });

    if (ast) {
      console.log("Type of code var:", typeof code);

      // Reset extracted object before parsing
      Object.keys(extracted).forEach((key) => (extracted[key] = []));

      extractAST(ast, code);

      // Print extracted parts
      console.log("Extracted Functions:", extracted.functions);
      console.log("Extracted Imports:", extracted.imports);
      console.log("Extracted Variables:", extracted.variables);
      console.log("Extracted Loops:", extracted.loops);
      console.log("Extracted If-Else Statements:", extracted.ifElse);
      console.log("Extracted Classes:", extracted.classes);
      console.log("Extracted Return Statements:", extracted.returns);
      console.log("Extracted Try-Catch Blocks:", extracted.tryCatch);
      console.log("Extracted Switch Cases:", extracted.switchCases);

      console.log("AST produced:", ast);
    }
    return ast;
  } catch (e) {
    console.log("Error occurred while parsing JS code:", e);
    return null;
  }
}

// Extracted code structures (stores both code and AST)
const extracted = {
  functions: [],
  imports: [],
  variables: [],
  loops: [],
  ifElse: [],
  classes: [],
  returns: [],
  tryCatch: [],
  switchCases: [],
};

// Function to extract code and AST from AST
function extractAST(node, code) {
  if (!node) return;

  const extractCode = (n) => code.slice(n.span.start, n.span.end);

  switch (node.type) {
    case "FunctionDeclaration":
    case "FunctionExpression":
      extracted.functions.push({
        name: node.identifier ? node.identifier.value : "anonymous",
        code: extractCode(node),
        ast: node, // Store AST
      });
      break;

    case "ImportDeclaration":
      extracted.imports.push({
        source: node.source.value,
        code: extractCode(node),
        ast: node,
      });
      break;

    case "VariableDeclaration":
      extracted.variables.push({
        kind: node.kind, // const, let, var
        code: extractCode(node),
        ast: node,
      });
      break;

    case "IfStatement":
      extracted.ifElse.push({
        condition: extractCode(node.test),
        code: extractCode(node),
        ast: node,
      });
      break;

    case "ForStatement":
    case "WhileStatement":
    case "DoWhileStatement":
      extracted.loops.push({
        type: node.type,
        code: extractCode(node),
        ast: node,
      });
      break;

    case "ClassDeclaration":
      extracted.classes.push({
        name: node.identifier ? node.identifier.value : "anonymous",
        code: extractCode(node),
        ast: node,
      });
      break;

    case "ReturnStatement":
      extracted.returns.push({
        value: extractCode(node),
        ast: node,
      });
      break;

    case "TryStatement":
      extracted.tryCatch.push({
        tryBlock: extractCode(node.block),
        catchBlock: node.handler ? extractCode(node.handler) : null,
        ast: node,
      });
      break;

    case "SwitchStatement":
      extracted.switchCases.push({
        discriminant: extractCode(node.discriminant),
        code: extractCode(node),
        ast: node,
      });
      break;
  }

  // Recursively process child nodes
  for (const key in node) {
    if (typeof node[key] === "object" && node[key] !== null) {
      if (Array.isArray(node[key])) {
        node[key].forEach((child) => extractAST(child, code));
      } else {
        extractAST(node[key], code);
      }
    }
  }
}

module.exports = { parseJsUsingSWC };
