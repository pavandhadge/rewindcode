const swc = require("@swc/core");

async function parseJsUsingSWC(code, config = null) {
  console.log("hi from js parser");
  try {
    // Parse the code to get AST
    const ast = await swc.parseSync(code, config || {
      syntax: "ecmascript",
      jsx: true,
      isModule: true,
      dynamicImport: true,
    });

    console.log("parser config for ast : ", config)
    if (ast) {
      console.log("Type of code var:", typeof code);

      // Reset extracted object before parsing
      Object.keys(extracted).forEach((key) => (extracted[key] = []));

      extractAST(ast, code);

      // Print extracted parts
      console.log("Extracted Statements:", extracted);

      console.log("AST produced:", ast);
    }
    return { ast, extracted };
  } catch (e) {
    console.log("Error occurred while parsing JS code:", e);
    return null;
  }
}

// Extracted code structures (stores both code and AST)

const extracted = {
  FunctionDeclaration: [],
  FunctionExpression: [],
  ImportDeclaration: [],
  VariableDeclaration: [],
  IfStatement: [],
  ForStatement: [],
  WhileStatement: [],
  DoWhileStatement: [],
  ClassDeclaration: [],
  ReturnStatement: [],
  TryStatement: [],
  ExpressionStatement: [],
  SwitchStatement: [],
};


function extractAST(node, code) {
  if (!node) return;

  const extractCode = (n) => code.slice(n.span.start, n.span.end);

  if (node.type in extracted) {
    extracted[node.type].push({
      code: extractCode(node),
      ast: node,
    });
  }

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
