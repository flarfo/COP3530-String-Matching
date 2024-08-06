# COP3530 Project 3 - String Searching
This project implements two common string-searching algorithms, the Boyer-Moore and Aho-Corasick algorithms. View the project explanation and analysis here: 'video-link'

## Online Testing
An online demo is available at https://flarfo.github.io/COP3530-String-Matching/

Here are some example texts that can be used for searching: https://github.com/amephraim/nlp/tree/master/texts

## Local Deployment
To run the code on a local machine, Node.js is required.

1. Download the [latest branch](https://github.com/flarfo/COP3530-String-Matching/archive/refs/heads/main.zip)
2. With Node.js, run *npm install* to install the necessary packages (Vite)
3. Finally, run *npm run dev* to run the files locally at http://localhost:{default-port}/

## Known Bugs
Overlapping pattern search with Aho-Corasick method does not work with page highlighting, overlapped characters are thus ignored based on length. For example with search patterns [51, 5], 5 would be ignored since it is contained within 51.

Page highlighting does not carry across pages. If a match is found to start on one page and end on the other, it will be highlighted on the first page, while the rest of the match on the next page will not be.
