const { similarityIndex } = require("./similarityIndex");
const { getFuncRecommendations } = require("../Config/configStore");

function dfsIterative(startNode, candidate, candidateType) {
  const funcRecommendations = getFuncRecommendations();
  if (!startNode) return [];

  const stack = [startNode];
  const suggestions = []; // Store matches locally

  while (stack.length > 0) {
    const node = stack.pop(); // Get the last inserted node

    // Get the relevant extracted array based on candidateType
    const candidateArray = node.parsed?.extracted[candidateType] || [];
    console.log("curr node : ", node, " extracted  : ", node.parsed?.extracted);
    console.log("check", candidateArray);
    candidateArray.forEach((element) => {
      console.log("traversing the candidate array : ", element, element.code);
      const result = similarityIndex(element.ast, candidate);
      if (result >= (funcRecommendations?.["thrushold"] || 0.1)) {
        // Adjust threshold as needed
        suggestions.push(element.code);
      }
    });

    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }

  return suggestions; // Return collected matches
}

function recommendation(rootNode, parsedData) {
  if (!parsedData.ast.body.length) return [];

  const candidateNode = parsedData.ast.body[0];
  const candidateType = candidateNode.type; // Extracting type dynamically
  console.log("this is the candidate type : ", candidateType);
  return dfsIterative(rootNode, candidateNode, candidateType); // Return final suggestions
}

module.exports = { recommendation };
