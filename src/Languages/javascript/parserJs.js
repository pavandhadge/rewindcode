const swc = require("@swc/core");

// Main function to parse JavaScript using SWC
async function parseJsUsingSWC(code, config = null) {
  console.log("hi from js parser");
  try {
    const ast = await swc.parseSync(code, config || {
      syntax: "ecmascript",
      jsx: true,
      isModule: true,
      dynamicImport: true,
      minify: false,
      preserveAllComments: true,
    });

    console.log("parser config for ast:", config);

    if (ast) {
      console.log("Type of code var:", typeof code);

      // Compute the smallest span start before extracting code
      let minSpanStart = getMinSpanStart(ast);

      // Create a unique extracted object for this function call
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

      extractAST(ast, code, minSpanStart, extracted);

      console.log("Extracted Statements:", extracted);
      console.log("AST produced:", ast);

      return { ast, extracted };
    }
  } catch (e) {
    console.log("Error occurred while parsing JS code:", e);
    return null;
  }
}

// Function to find the minimum span start across the AST
function getMinSpanStart(node) {
  let minStart = Infinity;

  function traverse(n) {
    if (!n) return;
    if (n.span && n.span.start < minStart) {
      minStart = n.span.start;
    }

    for (const key in n) {
      if (typeof n[key] === "object" && n[key] !== null) {
        if (Array.isArray(n[key])) {
          n[key].forEach((child) => traverse(child));
        } else {
          traverse(n[key]);
        }
      }
    }
  }

  traverse(node);
  return minStart === Infinity ? 0 : minStart; // Default to 0 if no spans exist
}

// Function to extract the correct code snippet from the AST
const extractCode = (n, code, minSpanStart) => {
  try {
    if (!n.span) return "";

    // Normalize span values using precomputed minSpanStart
    const start = n.span.start - minSpanStart;
    const end = n.span.end - minSpanStart;

    if (start < 0 || end > code.length) {
      console.error(`Invalid span: start=${start}, end=${end}, code length=${code.length}`);
      return "";
    }

    return code.slice(start, end); // Extract correct substring
  } catch (error) {
    console.log(`Error extracting code for ${n.type}:`, error);
    return "";
  }
};

// Function to traverse AST and extract information
function extractAST(node, code, minSpanStart, extracted) {
  if (!node) return;

  if (node.type in extracted) {
    const entry = {
      code: extractCode(node, code, minSpanStart),
      ast: node,
    };

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
      entry.condition = extractCode(node.test, code, minSpanStart);
    }
    if (node.type === "TryStatement") {
      entry.tryBlock = extractCode(node.block, code, minSpanStart);
      entry.catchBlock = node.handler ? extractCode(node.handler, code, minSpanStart) : null;
    }
    if (node.type === "SwitchStatement") {
      entry.discriminant = extractCode(node.discriminant, code, minSpanStart);
    }

    extracted[node.type].push(entry);
  }

  for (const key in node) {
    if (typeof node[key] === "object" && node[key] !== null) {
      if (Array.isArray(node[key])) {
        node[key].forEach((child) => extractAST(child, code, minSpanStart, extracted));
      } else {
        extractAST(node[key], code, minSpanStart, extracted);
      }
    }
  }
}

module.exports = { parseJsUsingSWC };
