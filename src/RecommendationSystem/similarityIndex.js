const { treeEditDistance } = require("./treeEditDistance")
const { nodeFrequencySimilarity } = require("./nodeFrequencyMatching")

function similarityIndex(node1, node2, alpha = 0.5) {
    const tedScore = treeEditDistance(node1, node2);
    const freqScore = nodeFrequencySimilarity(node1, node2);

    return alpha * tedScore + (1 - alpha) * freqScore;
}

module.exports = { similarityIndex }