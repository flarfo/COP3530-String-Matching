import './style.css'

const pageData = {
    curPage: 1,
    totalPages: 1,
    charsPerPage: 2000 
};

// "tosearch.txt" will be split into (totalPages) strings (content[]), based on charsPerPage
// then dynamically add (totalPages) buttons to pagination div
// the button number will be the index in (content[])
// so the "1" button will be (content[0])
// then display the text from (curPage)