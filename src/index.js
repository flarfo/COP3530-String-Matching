import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import AhoCorasick from './algorithms/aho-corasick.js';

sessionStorage.clear(); 

// store relevant page data for displaying text contents
const pageData = {
    curMatch: 0,
    searchPattern: '',
    curPage: 0, // 0 indexed
    totalPages: -1, // 0 indexed
    charsPerPage: 8000
};

// algorithm time taken
const timeText = document.getElementById('time-display');
// search pattern + number of instances text
const searchPatternText = document.getElementById('search-pattern');

// store all loaded text data into a page in content[]
const content = [];

// {pattern, index} of all matching string searchs
let searchResult = [];

// complete text loaded from file
let searchText;

let algorithm = false; // false = boyer, true = aho
const boyerToggle = document.getElementById('boyer-toggle');
boyerToggle.addEventListener('click', e => {
    e.preventDefault();

    // swap algorithms on click
    algorithm = !algorithm;
    if (algorithm) {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            // enable aho-corasick additional text inputs
            searchList.children[i].disabled = false;
        }

        boyerToggle.style.backgroundColor = '#f85149';
        ahoToggle.style.backgroundColor = '#438a55';
    }
    else {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            // disable aho-corasick additional text inputs
            searchList.children[i].disabled = true;
        }

         boyerToggle.style.backgroundColor = '#438a55';
         ahoToggle.style.backgroundColor = '#f85149';
    }
});

const ahoToggle = document.getElementById('aho-toggle');
ahoToggle.addEventListener('click', e => {
    e.preventDefault();

    // swap algorithms on click
    algorithm = !algorithm;
    if (algorithm) {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            // enable aho-corasick additional text inputs
            searchList.children[i].disabled = false;
        }

        ahoToggle.style.backgroundColor = '#438a55';
        boyerToggle.style.backgroundColor = '#f85149';
    }
    else {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            // disable aho-corasick additional text inputs
            searchList.children[i].disabled = true;
        }

        ahoToggle.style.backgroundColor = '#f85149';
        boyerToggle.style.backgroundColor = '#438a55';
    }
});

let visualization = false; // currently only works for boyer-moore algorithm
const visualizationToggle = document.getElementById('visualization-toggle');
visualizationToggle.addEventListener('click', e => {
    e.preventDefault();
    
    // toggle visualization on click 
    visualization = !visualization;
    if (visualization) {
        visualizationToggle.style.backgroundColor = '#438a55';
    }
    else {
         visualizationToggle.style.backgroundColor = '#f85149';
    }
});

const searchList = document.getElementById('search-list');
document.getElementById('increase-aho').addEventListener('click', e => {
    e.preventDefault();

    // increase number of additional text inputs on click
    const element = document.createElement('input');
    element.setAttribute('class', 'search-input-field');

    if (!algorithm) {
        // if aho-corasick not selected, disable text input
        element.setAttribute('disabled', 'true');
    }
    
    searchList.appendChild(element);
});

document.getElementById('decrease-aho').addEventListener('click', e => {
    e.preventDefault();

    // reduce number of additional text inputs on click
    if (searchList.childNodes.length > 1) {
        searchList.removeChild(searchList.childNodes[searchList.childNodes.length - 1]);
    }
});

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', e => {
    e.preventDefault();

    const patterns = [];

    const sortedSearchList = [];
    // sort patterns to identify overlap
    for (let i = 0; i < searchList.children.length; i++) {
        if (searchList.children[i].value == '') continue;
        sortedSearchList.push(searchList.children[i].value);
    }

    sortedSearchList.sort((a, b) => b.length - a.length);

    if (algorithm) {
        for (let i = 0; i < sortedSearchList.length; i++) {
            let add = true;
            for (let j = 0; j < patterns.length; j++) {
                // prevent overlapping patterns (for example, [51, 5] : 51 contains 5)
                // overlap does not work with pattern highlighting and I do not have time to fix
                if (patterns[j].includes(sortedSearchList[i])) {
                    add = false;
                    break;
                }
            }

            if (add) {
                patterns.push(sortedSearchList[i]);
            }
        }
    }
    else if (searchList.children[0].value != '')
    {
        patterns.push(searchList.children[0].value);
    }

    if (patterns.length == 0) return;

    doSearch(searchText, patterns);
});

const pageNumberDisplay = document.getElementById('page-number');

const prevInstanceButton = document.getElementById('prev-instance');
prevInstanceButton.addEventListener('click', e => {
    e.preventDefault();
    // go to previous found match on click (left ... button)
    goToPrevPageOfInstance();
});

const nextInstanceButton = document.getElementById('next-instance');
nextInstanceButton.addEventListener('click', e => {
    e.preventDefault();
    // go to next found match on click (right ... button)
    goToNextPageOfInstance();
});

const firstButton = document.getElementById('first-page');
firstButton.addEventListener('click', e => {
    e.preventDefault();
    // go to first page on click (<< button)
    displayText(0);
})

const prevButton = document.getElementById('prev-page');
prevButton.addEventListener('click', e => {
    e.preventDefault();
    // go to previous page on click (< button)
    displayText(pageData.curPage - 1);
});

const nextButton = document.getElementById('next-page');
nextButton.addEventListener('click', e => {
    e.preventDefault();
    // go to next page on click (> button)
    displayText(pageData.curPage + 1);
});

const lastButton = document.getElementById('last-page');
lastButton.addEventListener('click', e => {
    e.preventDefault();
    // go to last page on click (>> button)
    displayText(pageData.totalPages);
})

const textContainer = document.getElementById('text-container');
const inputFile = document.getElementById('input-file');
const inputForm = document.getElementById('input-form');

const fileReader = new FileReader();
inputForm.addEventListener('change', e => {
    e.preventDefault();

    // read text from uploaded file
    fileReader.onload = () => {
        pageData.curMatch = 0;

        let text = fileReader.result;
        text = text.replace(/[^\x00-\x7F]/g, "");
        searchText = text;
        calculatePageDisplay(text, '', false);
        displayText(0);
    };

    fileReader.readAsText(inputFile.files[0]);
});

async function doSearch(text, patterns) {
    if (text == null) return;

    pageData.curMatch = 0;

    if (algorithm) {
        // do Aho-Corasick
        const ac = new AhoCorasick();
        // add patterns to the Trie
        let start = Date.now();
        for (let pattern of patterns) {
            ac.addPattern(pattern);
        }

        // build failure links
        ac.buildFailureLinks();

        // search for patterns in the text
        searchResult = ac.search(text);

        let elapsed = Date.now() - start;

        timeText.textContent = 'Time: ' + elapsed + 'ms';
    }
    else {
        // do Boyer-Moore
        let start = Date.now();
        // await for visualization
        searchResult = await(boyerMoore(text, patterns[0], visualization));
        let elapsed = Date.now() - start;

        timeText.textContent = 'Time: ' + elapsed + 'ms';
    }

    const patternMap = new Map();
    for (let pattern of patterns) { 
        patternMap.set(pattern, {val: 0});
    }

    for (let result of searchResult) {
        patternMap.get(result.pattern).val++;
    }

    // display each pattern with respective number of instances
    let patternText = '';
    for (let pattern of patterns) { 
        patternText += '<strong>' + patternMap.get(pattern).val + "</strong> Instances of '<strong>" + pattern + "</strong>'<br>"; 
    }

    searchPatternText.innerHTML = patternText;

    // do text highlighting
    calculatePageDisplay(text);

    displayText(pageData.curPage);
}

function calculatePageDisplay(text, highlight = true) {
    // append text overflow to next "page"
    content.length = 0;
    let overflow = text.length > pageData.charsPerPage;

    if (overflow) {
        let count = 0;
        let pos = 0;
        let i = 0;
        
        while (pageData.charsPerPage * count < text.length) {
            let innerHTML = "";
            // get current "page" without overflow
            // do text highlighting
            if (highlight) {
                while (i < searchResult.length && searchResult[i].index < pageData.charsPerPage * (count + 1)) {
                    innerHTML += text.substring(pos, searchResult[i].index) + "<mark>" + searchResult[i].pattern + '</mark>';
                    pos = searchResult[i].index + searchResult[i].pattern.length;
                    i++;
                }
            }

            innerHTML += text.substring(pos, pageData.charsPerPage * (count + 1));
            pos = pageData.charsPerPage * (count + 1);

            content.push(innerHTML);
            count++;
        }
    }
    else {
        let innerHTML = "";
        let pos = 0;

        if (highlight) {
            for (let i = 0; i < searchResult.length; i++) {
                innerHTML += text.substring(pos, searchResult[i].index) + '<mark>' + searchResult[i].pattern + '</mark>';
                pos = searchResult[i].index + searchResult[i].pattern.length;
            }
        }

        innerHTML += text.substring(pos)
        content.push(innerHTML);
    }

    pageData.totalPages = content.length - 1;
}

function displayText(page) {
    // don't go beyond contents of text
    if (content.length == 0) return;
    if (page > pageData.totalPages) return;
    if (page < 0) return;

    pageData.curPage = page;
    textContainer.innerHTML = content[page];
    pageNumberDisplay.textContent = page + 1;
}

function goToPrevPageOfInstance() {
    if (pageData.totalPages == -1) return;
    if (searchResult.length == 0) return;
    if (pageData.curPage * pageData.charsPerPage < searchResult[0].index) return;

    let page = Math.floor(searchResult[pageData.curMatch].index / pageData.charsPerPage);

    // find first page that is less than current page with a match
    for (let i = searchResult.length - 1; i >= 0; i--) {
        pageData.curMatch = i;
        if (Math.floor(searchResult[i].index / pageData.charsPerPage) < pageData.curPage) break;
    }

    page = Math.floor(searchResult[pageData.curMatch].index / pageData.charsPerPage);
    displayText(page);
}

function goToNextPageOfInstance() {
    if (pageData.totalPages == -1) return;
    if (pageData.curMatch >= searchResult.length) return;

    let page = Math.floor(searchResult[pageData.curMatch].index / pageData.charsPerPage);
    
    // find first page that is greater than current page with a match
    for (let i = pageData.curMatch; i < searchResult.length - 1; i++) {
        if (Math.floor(searchResult[i].index / pageData.charsPerPage) > pageData.curPage) break;
        pageData.curMatch++;
    }

    page = Math.floor(searchResult[pageData.curMatch].index / pageData.charsPerPage);
    displayText(page);
}