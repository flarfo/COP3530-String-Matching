// references:
// Alfred V. Aho and Margaret J. Corasick: "Efficient String Matching: An Aid to Bibliographic Search" (1975)
// Bertrand Meyer: Incremental String Matching (1985)
// https://www.geeksforgeeks.org/aho-corasick-algorithm-pattern-searching/


// Trie class
// represents a node in the Trie
class TrieNode {
    constructor() {
        this.children = {};      // Maps characters to child nodes
        this.failureLink = null; // Reference to the failure link node
        this.output = [];        // List of patterns that end at this node
    }
}

// Main aho-corasick class that constructrs Trie, creates failure links, and searches text
class AhoCorasick {
    constructor() {
        this.root = new TrieNode(); // initialize root node of Trie
    }

    // Method to add pattern to Trie
    addPattern(pattern) {
        let node = this.root;
        for (let char of pattern) {
            // Create a new Trie node if the character does not exist
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char]; // move to child node
        }
        node.output.push(pattern);      // add pattern to output list of the node
    }

    // method to build failure links for the trie nodes
    buildFailureLinks() {
        let queue = [];
        let root = this.root;

        // Initialize the queue with the root's children and set their failure links to root
        for (let char in root.children) {
            let child = root.children[char];
            child.failureLink = root;
            queue.push(child);
        }

        // process the queue to build failure links for all nodes
        while (queue.length > 0) {
            let currentNode = queue.shift();

            // Iterate through each child of the current node
            for (let char in currentNode.children) {
                let child = currentNode.children[char];
                let failureNode = currentNode.failureLink;

                // Follow failure links until a matching child is found or root is reached
                while (failureNode && !failureNode.children[char]) {
                    failureNode = failureNode.failureLink;
                }

                // set the failure link to matching child or root
                if (failureNode) {
                    child.failureLink = failureNode.children[char];
                } else {
                    child.failureLink = root;
                }

                // Merge the output of the failure link node with the child node
                child.output = child.output.concat(child.failureLink.output);
                queue.push(child); // add child to queue
            }
        }
    }
    
    // Method to search for patterns in a given text
    search(text) {
        let node = this.root;
        let results = [];

        // Iterate through each character in text
        for (let i = 0; i < text.length; i++) {
            let char = text[i];

            // Follow failure links until a matching child is found or root is reached
            while (node && !node.children[char]) {
                node = node.failureLink;
            }

            // if no node is found, continue from root
            if (!node) {
                node = this.root;
                continue;
            }

            node = node.children[char]; // Move to matching child node

            // If node has output patterns, add them to result
            if (node.output.length > 0) { 
                for (let pattern of node.output) {
                    results.push({pattern: pattern, index: i - pattern.length + 1});
                }
            }
        }

        return results; // return list of matches
    }
}

// Export ahocorasick class as ES module
export default AhoCorasick;


// To do:
// 1. intializing pattern based off of user input
// 2. file reading/transforming? (however we handle that)