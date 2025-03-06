const swc = require("@swc/core");

async function parseJsUsingSWC(code, config = null) {
  console.log("hi from js parser");
  try {
    const ast = await swc.parseSync(code, config || {
      syntax: "ecmascript",
      jsx: true,
      isModule: true,
      dynamicImport: true,
      minify: false, // Ensure SWC doesn't alter the code
      preserveAllComments: true, // Keeps original comments & whitespace
    });



    console.log("parser config for ast:", config);
    if (ast) {
      console.log("Type of code var:", typeof code);

      // Reset extracted object
      Object.keys(extracted).forEach((key) => (extracted[key] = []));

      extractAST(ast, code);

      console.log("Extracted Statements:", extracted);
      console.log("AST produced:", ast);
    }
    return { ast, extracted };
  } catch (e) {
    console.log("Error occurred while parsing JS code:", e);
    return null;
  }
}

// Extracted code structures
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

// Extract function with semantic details
function extractAST(node, code) {
  if (!node) return;

  const extractCode = (n) => {
    try {
      const utf16Array = [...code]; // Convert to UTF-16 array
      console.log("lets check hte utf 16 array : ", utf16Array)
      return utf16Array.slice(n.span.start, n.span.end).join("");
    } catch (error) {
      console.log(`Error extracting code for ${node.type}:`, error);
      return "";
    }
  };

  if (node.type in extracted) {
    const entry = {
      code: extractCode(node),
      ast: node,
    };

    // Add semantic information like the first version
    if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression") {
      entry.name = node.identifier ? node.identifier.value : "anonymous";
    }
    if (node.type === "ImportDeclaration") {
      entry.source = node.source.value;
    }
    if (node.type === "VariableDeclaration") {
      entry.kind = node.kind;
    }
    if (node.type === "IfStatement") {
      entry.condition = extractCode(node.test);
    }
    if (node.type === "TryStatement") {
      entry.tryBlock = extractCode(node.block);
      entry.catchBlock = node.handler ? extractCode(node.handler) : null;
    }
    if (node.type === "SwitchStatement") {
      entry.discriminant = extractCode(node.discriminant);
    }

    extracted[node.type].push(entry);
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
