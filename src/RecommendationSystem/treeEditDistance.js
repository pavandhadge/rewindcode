function treeEditDistance(node1, node2) {
    function ted(n1, n2) {
        if (!n1 && !n2) return 0;
        if (!n1) return 1 + (n2.children ? n2.children.length : 0);
        if (!n2) return 1 + (n1.children ? n1.children.length : 0);

        const cost = n1.type === n2.type ? 0 : 1;
        const children1 = n1.children || [];
        const children2 = n2.children || [];

        const dp = Array(children1.length + 1)
            .fill(null)
            .map(() => Array(children2.length + 1).fill(0));

        for (let i = 0; i <= children1.length; i++) dp[i][0] = i;
        for (let j = 0; j <= children2.length; j++) dp[0][j] = j;

        for (let i = 1; i <= children1.length; i++) {
            for (let j = 1; j <= children2.length; j++) {
                const costSub = ted(children1[i - 1], children2[j - 1]);
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1, // Delete
                    dp[i][j - 1] + 1, // Insert
                    dp[i - 1][j - 1] + costSub // Replace (if types differ)
                );
            }
        }
        return dp[children1.length][children2.length] + cost;
    }

    const maxSize = Math.max(
        (node1.children ? node1.children.length : 0) + 1,
        (node2.children ? node2.children.length : 0) + 1
    );
    const distance = ted(node1, node2);
    return 1 - distance / maxSize; // Normalize score (1 = identical, 0 = totally different)
}


module.exports = { treeEditDistance }