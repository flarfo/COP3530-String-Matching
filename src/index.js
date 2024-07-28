import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import naive from './algorithms/naive.js';

const pageData = {
    curPage: 1,
    totalPages: 1,
    charsPerPage: 2000 
};

const content = [];

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
        doSearch(fileReader.result, 'a');
    };

    fileReader.readAsText(inputFile.files[0]);
});

function doSearch(text, search) {
    let start = Date.now();
    let result = boyerMoore(text, search);
    let elapsed = Date.now() - start;

    console.log(result.length + " instances of '" + search + "' found.")
    console.log("Boyer-Moore (ms): " + elapsed);

    // append text overflow to next "page"
    let overflow = textContainer.clientHeight < textContainer.scrollHeight;
    console.log('Overflow: ' + overflow);
    console.log('Client Height: ' + textContainer.clientHeight);
    console.log('Scroll Height: ' + textContainer.scrollHeight);

    // TODO: update on screen size change (zoom/resize)

    // update content division based on text overflow amount
    
    // calculate max lines possible to display in text div based on current zoom
    // divide height of div by line height, (* window.devicePixelRatio to account for zoom)
    const maxLines = Math.floor(window.devicePixelRatio * (textContainer.clientHeight - 20) / (Number.parseFloat(window.getComputedStyle(textContainer).fontSize) * 1.2 * window.devicePixelRatio));

    // number of lines not displayed due to too much text
    const overflowAmount = Math.floor(window.devicePixelRatio * (textContainer.scrollHeight - 20) / (Number.parseFloat(window.getComputedStyle(textContainer).fontSize) * 1.2 * window.devicePixelRatio)) - maxLines;

    console.log('Overflow Amount: ' + overflowAmount);
    console.log('Max Lines: '  + maxLines);

    console.log('Div Width: ' + textContainer.clientWidth * window.devicePixelRatio);
    const maxChars = window.devicePixelRatio * textContainer.clientWidth / fontWidth;
    console.log('Max Chars: ' + maxChars);

    let curText = text;
    /*while (overflow) {
        overflow = textContainer.clientHeight < textContainer.scrollHeight;
        // set curText
        // append curText to content[]
    }*/

    // do text highlighting
    let innerHTML = "";
    let pos = 0;

    for (let i = 0; i < result.length; i++) {
        innerHTML += text.substring(pos, result[i]) + "<span style='color:yellow'>" + search + '</span>';
        pos = result[i] + search.length;
    }

    innerHTML += text.substring(pos);
    textContainer.innerHTML = innerHTML;
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