class TreeNode {
    /**
     * @param {string} state 
     * @param {string} hash 
     * @param {Date} datetime 
     * @param {number} count
     * @param {TreeNode|null} [parent=null] 
     */
    constructor(state, hash, datetime, count, parent = null) {
        this.state = state;            // The state of the node (string)
        this.children = [];           // Array of child TreeNodes
        this.parent = parent;         // Parent TreeNode or null
        this.hash = hash;             // Unique identifier (string)
        this.datetime = datetime;     // Timestamp (Date object)
        this.count = count;           // Count or quantity (number)
    }

    /**
     * Adds a child node to the current node.
     * @param {TreeNode} childNode 
     * @throws {Error} 
     */
    addChild(childNode) {
        if (childNode instanceof TreeNode) {
            childNode.parent = this;
            this.children.push(childNode);
        } else {
            throw new Error('Invalid child node');
        }
    }
}

module.exports = TreeNode;
