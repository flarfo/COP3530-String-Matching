import './style.css'
import boyerMoore from './algorithms/boyer-moore.js'
import naive from './algorithms/naive.js';

async function doSearch() {
    fetch('./src/tosearch.txt').then((x) => x.text()).then((text) => {
        const search = "Potter";

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
}
    
// doSearch();
