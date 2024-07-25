import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import naive from './algorithms/naive.js';

const pageData = {
    curPage: 1,
    totalPages: 1,
    charsPerPage: 2000 
};

const inputFile = document.getElementById('input-file');
const inputForm = document.getElementById('input-form');

inputForm.addEventListener('submit', e => {
    e.preventDefault();

    // read text from uploaded file
    const fileReader = new FileReader();
    fileReader.onload = () => {
        doSearch(fileReader.result, 'text');
    };

    fileReader.readAsText(inputFile.files[0]);
});

function doSearch(text, search) {
    let start = Date.now();
    let result = boyerMoore(text, search);
    let elapsed = Date.now() - start;

    console.log(result.length + " instances of '" + search + "' found.")
    console.log("Boyer-Moore (ms): " + elapsed);

    start = Date.now();
    result = naive(text, search);
    elapsed = Date.now() - start;

    console.log(result.length + " instances of '" + search + "' found.")
    console.log("Naive (ms): " + elapsed);
}

// old async method for local files
/*async function doSearch(file) {
    fetch(file).then((x) => x.text()).then((text) => {
        const search = "Copy";
        console.log(text);
        let start = Date.now();
        let result = boyerMoore(text, search);
        let elapsed = Date.now() - start;

        console.log(result.length + " instances of '" + search + "' found.")
        console.log("Boyer-Moore (ms): " + elapsed);

        start = Date.now();
        result = naive(text, search);
        elapsed = Date.now() - start;

        console.log(result.length + " instances of '" + search + "' found.")
        console.log("Naive (ms): " + elapsed);
    });
}*/

// "tosearch.txt" will be split into (totalPages) strings (content[]), based on charsPerPage
// then dynamically add (totalPages) buttons to pagination div
// the button number will be the index in (content[])
// so the "1" button will be (content[0])
// then display the text from (curPage)