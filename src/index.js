import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import AhoCorasick from './algorithms/aho-corasick.js';

sessionStorage.clear(); 

const pageData = {
    curMatch: 0,
    searchPattern: '',
    curPage: 0, // 0 indexed
    totalPages: -1, // 0 indexed
    charsPerPage: 8000
};

const timeText = document.getElementById('time-display');
const searchPatternText = document.getElementById('search-pattern');

const content = [];
let searchResult = [];
let searchText;

let algorithm = false; // false = boyer, true = aho
const boyerToggle = document.getElementById('boyer-toggle');
boyerToggle.addEventListener('click', e => {
    e.preventDefault();
    algorithm = !algorithm;
    if (algorithm) {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            searchList.children[i].disabled = false;
        }

        boyerToggle.style.backgroundColor = '#f85149';
        ahoToggle.style.backgroundColor = '#438a55';
    }
    else {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            searchList.children[i].disabled = true;
        }

         boyerToggle.style.backgroundColor = '#438a55';
         ahoToggle.style.backgroundColor = '#f85149';
    }
});

const ahoToggle = document.getElementById('aho-toggle');
ahoToggle.addEventListener('click', e => {
    e.preventDefault();
    algorithm = !algorithm;
    if (algorithm) {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            searchList.children[i].disabled = false;
        }

        ahoToggle.style.backgroundColor = '#438a55';
        boyerToggle.style.backgroundColor = '#f85149';
    }
    else {
        for (let i = searchList.children.length - 1; i > 0; i--) {
            searchList.children[i].disabled = true;
        }

        ahoToggle.style.backgroundColor = '#f85149';
        boyerToggle.style.backgroundColor = '#438a55';
    }
});

let visualization = false;
const visualizationToggle = document.getElementById('visualization-toggle');
visualizationToggle.addEventListener('click', e => {
    e.preventDefault();
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

    const element = document.createElement('input');
    element.setAttribute('class', 'search-input-field');

    if (!algorithm) {
        element.setAttribute('disabled', 'true');
    }
    
    searchList.appendChild(element);
});

document.getElementById('decrease-aho').addEventListener('click', e => {
    e.preventDefault();

    if (searchList.childNodes.length > 1) {
        searchList.removeChild(searchList.childNodes[searchList.childNodes.length - 1]);
    }
});

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', e => {
    e.preventDefault();

    const patterns = [];

    const sortedSearchList = [];
    for (let i = 0; i < searchList.children.length; i++) {
        if (searchList.children[i].value == '') continue;
        sortedSearchList.push(searchList.children[i].value);
    }

    sortedSearchList.sort((a, b) => b.length - a.length);

    if (algorithm) {
        for (let i = 0; i < sortedSearchList.length; i++) {
            let add = true;
            for (let j = 0; j < patterns.length; j++) {
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
    goToPrevPageOfInstance();
});

const nextInstanceButton = document.getElementById('next-instance');
nextInstanceButton.addEventListener('click', e => {
    goToNextPageOfInstance();
});

const firstButton = document.getElementById('first-page');
firstButton.addEventListener('click', e => {
    e.preventDefault();

    displayText(0);
})

const prevButton = document.getElementById('prev-page');
prevButton.addEventListener('click', e => {
    e.preventDefault();

    displayText(pageData.curPage - 1);
});

const nextButton = document.getElementById('next-page');
nextButton.addEventListener('click', e => {
    e.preventDefault();

    displayText(pageData.curPage + 1);
});

const lastButton = document.getElementById('last-page');
lastButton.addEventListener('click', e => {
    e.preventDefault();

    displayText(pageData.totalPages);
})

const textContainer = document.getElementById('text-container');
const inputFile = document.getElementById('input-file');
const inputForm = document.getElementById('input-form');

// TODO: actually calculate width, especially if a fallback font is needed
const fontWidth = 10;

const fileReader = new FileReader();
inputForm.addEventListener('change', e => {
    e.preventDefault();

    // read text from uploaded file
    
    fileReader.onload = () => {
        //content.length = 0;
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
        const ac = new AhoCorasick();
        // Add patterns to the Trie
        let start = Date.now();
        for (let pattern of patterns) {
            ac.addPattern(pattern);
        }

        // Build failure links
        ac.buildFailureLinks();

        // Search for patterns in the text
        searchResult = ac.search(text);

        let elapsed = Date.now() - start;

        timeText.textContent = 'Time: ' + elapsed + 'ms';
    }
    else {
        let start = Date.now();
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

    // TODO: update on screen size change (zoom/resize)

    // update content division based on text overflow amount
    
    // calculate max lines possible to display in text div based on current zoom
    // divide height of div by line height, (* window.devicePixelRatio to account for zoom)

    //const maxLines = Math.floor(window.devicePixelRatio * (textContainer.clientHeight - 20) / (Number.parseFloat(window.getComputedStyle(textContainer).fontSize) * 1.2 * window.devicePixelRatio));

    // number of lines not displayed due to too much text
    // const overflowAmount = Math.floor(window.devicePixelRatio * (textContainer.scrollHeight - 20) / (Number.parseFloat(window.getComputedStyle(textContainer).fontSize) * 1.2 * window.devicePixelRatio)) - maxLines;

    // console.log('Overflow Amount: ' + overflowAmount);
    // console.log('Max Lines: '  + maxLines);

    // console.log('Div Width: ' + textContainer.clientWidth * window.devicePixelRatio);
    //const maxCharsPerLine = Math.floor(textContainer.clientWidth / fontWidth);
    // console.log('Max Chars Per Line: ' + maxCharsPerLine);

    //const maxChars = maxLines * maxCharsPerLine;
    //pageData.charsPerPage = maxChars;

    let overflow = text.length > pageData.charsPerPage;

    // console.log('Max Chars: ' + maxChars);
    // console.log('Text Length: ' + text.length);

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
    if (pageData.curPage * pageData.charsPerPage < searchResult[0].index) return;

    let page = Math.floor(searchResult[pageData.curMatch].index / pageData.charsPerPage);

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
    
    for (let i = pageData.curMatch; i < searchResult.length - 1; i++) {
        if (Math.floor(searchResult[i].index / pageData.charsPerPage) > pageData.curPage) break;
        pageData.curMatch++;
    }

    page = Math.floor(searchResult[pageData.curMatch].index / pageData.charsPerPage);

    displayText(page);
}