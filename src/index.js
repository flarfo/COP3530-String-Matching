import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import naive from './algorithms/naive.js';

const pageData = {
    curPage: 0, // 0 indexed
    totalPages: 0, // 0 indexed
    charsPerPage: 8000 
};

const content = [];
let searchResult = [];

const searchButton = document.getElementById('search-button');
searchButton.addEventListener('click', e => {
    e.preventDefault();

    // TODO: make able to search for specified word
});

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

const textContainer = document.getElementById('text-container');
const inputFile = document.getElementById('input-file');
const inputForm = document.getElementById('input-form');

// TODO: actually calculate width, especially if a fallback font is needed
const fontWidth = 10;

inputForm.addEventListener('change', e => {
    e.preventDefault();

    // read text from uploaded file
    const fileReader = new FileReader();
    fileReader.onload = () => {
        textContainer.textContent = fileReader.result;
        doSearch(fileReader.result, 'still');
    };

    fileReader.readAsText(inputFile.files[0]);
});

function doSearch(text, search) {
    content.length = 0;

    let start = Date.now();
    searchResult = boyerMoore(text, search);
    let elapsed = Date.now() - start;

    console.log(searchResult.length + " instances of '" + search + "' found.")
    console.log("Boyer-Moore (ms): " + elapsed);

    calculatePageDisplay(text, search);

    // do text highlighting
    displayText(0);
}

function calculatePageDisplay(text, search) {
    // append text overflow to next "page"
    let overflow = textContainer.clientHeight < textContainer.scrollHeight;

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
            while (searchResult[i] < maxChars * (count + 1)) {
                innerHTML += text.substring(pos, searchResult[i]) + "<span style='color:yellow'>" + search + '</span>';
                pos = searchResult[i] + search.length;
                i++;
            }

            innerHTML += text.substring(pos, maxChars * (count + 1));
            pos = maxChars * (count + 1);

            content.push(innerHTML);
            count++;
        }
    }
    else {
        console.log('No overflow');
        content.push(text);
    }

    pageData.totalPages = content.length - 1;
}

function displayText(page) {
    console.log('displaying page: ' + page);

    // don't go beyond contents of text
    if (page > pageData.totalPages) return;
    if (page < 0) return;

    if (page > 0) {
        prevButton.disabled = false;
    }

    if (page == pageData.totalPages) {
        nextButtonButton.disabled = false;
    }

    pageData.curPage = page;
    textContainer.innerHTML = content[page];
}

const editableDiv = document.querySelector('div[contenteditable="true"]');

// solution from: https://stackoverflow.com/questions/6899659/remove-formatting-from-a-contenteditable-div
editableDiv.addEventListener("paste", function(e) {
  e.preventDefault();
  var text = e.clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, text);
});


// "tosearch.txt" will be split into (totalPages) strings (content[]), based on charsPerPage
// then dynamically add (totalPages) buttons to pagination div
// the button number will be the index in (content[])
// so the "1" button will be (content[0])
// then display the text from (curPage)