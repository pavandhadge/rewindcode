function getNodeFrequency(node, frequencyMap = {}) {
    if (!node || typeof node !== "object") return frequencyMap;

    frequencyMap[node.type] = (frequencyMap[node.type] || 0) + 1;

    for (const key in node) {
        if (Array.isArray(node[key])) {
            node[key].forEach((child) => getNodeFrequency(child, frequencyMap));
        } else if (typeof node[key] === "object") {
            getNodeFrequency(node[key], frequencyMap);
        }
    }

    return frequencyMap;
}

function nodeFrequencySimilarity(node1, node2) {
    const freq1 = getNodeFrequency(node1);
    const freq2 = getNodeFrequency(node2);

    const allKeys = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);
    let dotProduct = 0,
        magnitude1 = 0,
        magnitude2 = 0;

    for (const key of allKeys) {
        const count1 = freq1[key] || 0;
        const count2 = freq2[key] || 0;

        dotProduct += count1 * count2;
        magnitude1 += count1 ** 2;
        magnitude2 += count2 ** 2;
    }

    if (magnitude1 === 0 || magnitude2 === 0) return 0; // Avoid division by zero
    return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2)); // Cosine similarity
}


module.exports = { nodeFrequencySimilarity }