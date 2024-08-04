import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import AhoCorasick from './algorithms/aho-corasick.js';
import naive from './algorithms/naive.js';

sessionStorage.clear(); 

const pageData = {
    curMatch: 0,
    searchPattern: '',
    curPage: 0, // 0 indexed
    totalPages: 0, // 0 indexed
    charsPerPage: 8000
};

const content = [];
let searchResult = [];
let searchText;

let algorithm = false; // false = boyer, true = aho
const boyerToggle = document.getElementById('boyer-toggle');
boyerToggle.addEventListener('click', e => {
    e.preventDefault();
    algorithm = !algorithm;
    if (algorithm) {
        boyerToggle.style.backgroundColor = '#f85149';
        ahoToggle.style.backgroundColor = '#438a55';
    }
    else {
         boyerToggle.style.backgroundColor = '#438a55';
         ahoToggle.style.backgroundColor = '#f85149';
    }
});

const ahoToggle = document.getElementById('aho-toggle');
ahoToggle.addEventListener('click', e => {
    e.preventDefault();
    algorithm = !algorithm;
    if (algorithm) {
        ahoToggle.style.backgroundColor = '#438a55';
        boyerToggle.style.backgroundColor = '#f85149';
    }
    else {
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

const searchButton = document.getElementById('search-button');
const searchInputField = document.getElementById('search-input-field');
searchButton.addEventListener('click', e => {
    e.preventDefault();

    if (searchInputField.value == '') return;
    pageData.searchPattern = searchInputField.value;
    doSearch(searchText, searchInputField.value);
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

async function doSearch(text, search) {
    if (text == null) return;

    pageData.curMatch = 0;

    if (algorithm) {
        const ac = new AhoCorasick();
        // Add patterns to the Trie
        ac.addPattern(search);

        // Build failure links
        ac.buildFailureLinks();

        // Search for patterns in the text
        searchResult.length = 0;
       
        let start = Date.now();

        for (let result of ac.search(text)) {
            searchResult.push(result.index);
        }

        let elapsed = Date.now() - start;

        console.log(searchResult.length + " instances of '" + search + "' found.")
        console.log("Aho-Corasick (ms): " + elapsed);
        
    }
    else {
        let start = Date.now();
        searchResult = await(boyerMoore(text, search, visualization));
        let elapsed = Date.now() - start;

        console.log(searchResult.length + " instances of '" + search + "' found.")
        console.log("Boyer-Moore (ms): " + elapsed);
    }

    calculatePageDisplay(text, search);

    // do text highlighting
    displayText(pageData.curPage);
}

function calculatePageDisplay(text, search, highlight = true) {
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
        // TODO: may need to fix for final page ?
        while (pageData.charsPerPage * count < text.length) {
            let innerHTML = "";
            // get current "page" without overflow
            // do text highlighting
            if (highlight) {
                while (searchResult[i] < pageData.charsPerPage * (count + 1)) {
                    innerHTML += text.substring(pos, searchResult[i]) + "<mark>" + search + '</mark>';
                    pos = searchResult[i] + search.length;
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
                innerHTML += text.substring(pos, searchResult[i]) + '<mark>' + search + '</mark>';
                pos = searchResult[i] + search.length;
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
    if (pageData.curPage * pageData.charsPerPage < searchResult[0]) return;

    let page = Math.floor(searchResult[pageData.curMatch] / pageData.charsPerPage);

    for (let i = searchResult.length; i >= 0; i--) {
        pageData.curMatch = i;
        if (Math.floor(searchResult[i] / pageData.charsPerPage) < pageData.curPage) break;
    }

    page = Math.floor(searchResult[pageData.curMatch] / pageData.charsPerPage);
    
    displayText(page);
}

function goToNextPageOfInstance() {
    if (pageData.curMatch >= searchResult.length) return;

    let page = Math.floor(searchResult[pageData.curMatch] / pageData.charsPerPage);
    
    for (let i = pageData.curMatch; i < searchResult.length - 1; i++) {
        if (Math.floor(searchResult[i] / pageData.charsPerPage) > pageData.curPage) break;
        pageData.curMatch++;
    }

    page = Math.floor(searchResult[pageData.curMatch] / pageData.charsPerPage);

    displayText(page);
    console.log(page);
}

// "tosearch.txt" will be split into (totalPages) strings (content[]), based on charsPerPage
// then dynamically add (totalPages) buttons to pagination div
// the button number will be the index in (content[])
// so the "1" button will be (content[0])
// then display the text from (curPage)