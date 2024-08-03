import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import naive from './algorithms/naive.js';

sessionStorage.clear(); 

const pageData = {
    curPage: 0, // 0 indexed
    totalPages: 0, // 0 indexed
    charsPerPage: 8000 
};

const content = [];
let searchResult = [];
let searchText;

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
    
    doSearch(searchText, searchInputField.value);
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

    let start = Date.now();
    searchResult = await(boyerMoore(text, search, visualization));
    let elapsed = Date.now() - start;

    console.log(searchResult.length + " instances of '" + search + "' found.")
    console.log("Boyer-Moore (ms): " + elapsed);

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

    const maxLines = Math.floor(window.devicePixelRatio * (textContainer.clientHeight - 20) / (Number.parseFloat(window.getComputedStyle(textContainer).fontSize) * 1.2 * window.devicePixelRatio));

    // number of lines not displayed due to too much text
    // const overflowAmount = Math.floor(window.devicePixelRatio * (textContainer.scrollHeight - 20) / (Number.parseFloat(window.getComputedStyle(textContainer).fontSize) * 1.2 * window.devicePixelRatio)) - maxLines;

    // console.log('Overflow Amount: ' + overflowAmount);
    // console.log('Max Lines: '  + maxLines);

    // console.log('Div Width: ' + textContainer.clientWidth * window.devicePixelRatio);
    const maxCharsPerLine = Math.floor(textContainer.clientWidth / fontWidth);
    // console.log('Max Chars Per Line: ' + maxCharsPerLine);

    const maxChars = maxLines * maxCharsPerLine;
    pageData.charsPerPage = maxChars;

    let overflow = text.length > maxChars;

    // console.log('Max Chars: ' + maxChars);
    // console.log('Text Length: ' + text.length);

    if (overflow) {
        let count = 0;
        let pos = 0;
        let i = 0;
        // TODO: may need to fix for final page ?
        while (maxChars * count < text.length) {
            let innerHTML = "";
            // get current "page" without overflow
            // do text highlighting
            if (highlight) {
                while (searchResult[i] < maxChars * (count + 1)) {
                    innerHTML += text.substring(pos, searchResult[i]) + "<mark>" + search + '</mark>';
                    pos = searchResult[i] + search.length;
                    i++;
                }
            }

            innerHTML += text.substring(pos, maxChars * (count + 1));
            pos = maxChars * (count + 1);

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
}

// "tosearch.txt" will be split into (totalPages) strings (content[]), based on charsPerPage
// then dynamically add (totalPages) buttons to pagination div
// the button number will be the index in (content[])
// so the "1" button will be (content[0])
// then display the text from (curPage)