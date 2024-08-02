import fs from 'fs';
import path from 'path';
import AhoCorasick from './aho-corasick.js'; // Import the AhoCorasick class

// Function to initialize patterns and search text
function testAhoCorasick(patterns, text) {
    const ac = new AhoCorasick();

    // Add patterns to the Trie
    for (let pattern of patterns) {
        ac.addPattern(pattern);
    }

    // Build failure links
    ac.buildFailureLinks();

    // Search for patterns in the text
    const results = ac.search(text);

    // Print the results
    for (let result of results) {
        console.log(`Pattern "${result.pattern}" found at index ${result.index}`);
    }
}

// Sample patterns
const patterns = ['Sally', 'sea', 'shells', 'shore'];

// Read text file (you can change the file path as needed)
const textFilePath = path.join(path.dirname(''), 'test.txt');
fs.readFile(textFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the text file:', err);
        return;
    }

    // Test the Aho-Corasick implementation
    testAhoCorasick(patterns, data);
});
