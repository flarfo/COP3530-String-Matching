// References:
// Boyer, Robert S. Moore, J Strother (October 1977). "A Fast String Searching Algorithm" 

const NUM_CHARS = 256; // assuming ASCII, can be changed to 26 for alphabetic strings

var endPromise = false;
var searching = false;

const visualizationActualText = document.getElementById('actual-text');
const visualizationMatchText = document.getElementById('match-text');

export default async function boyerSearch(s, pattern, visualize = false) {
    if (searching) {
        // end visualization if currently visualizing
        endPromise = true;
        // NOTE: this adds an additional await(200) to the time
        await(sleep(200));
    }
    
    return await(boyerMoore(s, pattern, visualize));
}

// string s, string pattern
async function boyerMoore(s, pattern, visualize = false) {
    searching = true;

    // PREPROCESSING
    const patternSize = pattern.length;
    
    const length = visualizationActualText.cells.length;
    if (visualize) {
        for (let i = 0; i < length; i++) {
            visualizationActualText.deleteCell(0);
            visualizationMatchText.deleteCell(0);
        }

        for (let i = 0; i < patternSize; i++) {
            const c = pattern.charAt(i);
            visualizationActualText.insertCell(i).textContent = c;
            visualizationMatchText.insertCell(i).textContent = '-';
        }
    }
    else {
        for (let i = 0; i < length; i++) {
            visualizationActualText.deleteCell(0);
            visualizationMatchText.deleteCell(0);
        }
    }

    /* 
    generate a bad-character table (t) to represent the amount our index can
    be shifted upon finding a given character (char). 
    */
    const badCharTable = [];

    // if char not in pattern, t[char] = pattern_length
    for (let i = 0; i < NUM_CHARS; i++) {
        badCharTable[i] = patternSize;
    }

    // else, t[char] = pattern_length - j (where j is the max integer s.t. pattern[j] = char)
    for (let i = 0; i < patternSize; i++) {
        badCharTable[pattern.charCodeAt(i)] =  Math.max(1, patternSize - i - 1);
    }

    /* 
    generate a shift table to represent the given pattern
    key: substring index in pattern
    value: number of skips to make upon mismatch at given index 
    */
    const shiftTable = [];

    for (let i = 0; i < patternSize; i++) {
        shiftTable[i] = Math.max(1, patternSize - i - 1);
    }

    // CALCULATING

    // array of indices where the pattern begins
    const result = [];

    let i = patternSize - 1;

    // if pattern greather than source, pattern cannot exist in source
    while (i < s.length) {
        if (visualize) { 
            if (endPromise) {
                // end visualization if another started
                endPromise = false;
                console.log(pattern);
                return result;
            }

            await(sleep(100));
            const start = i - patternSize + 1;
            for (let c = 0; c < patternSize; c++) {
                visualizationMatchText.cells[c].textContent = s.charAt(start + c);
                visualizationMatchText.cells[c].style.backgroundColor = 'transparent';
            }
        }

        let j = patternSize - 1;
        let pos = i;
        while (j >= 0) {
            if (visualize) {
                await(sleep(100));
            }
            
            // match
            if (s.charAt(pos) == pattern.charAt(j)) {
                if (visualize) {
                    visualizationMatchText.cells[j].style.backgroundColor = 'green';
                }

                if (j == 0) {
                    result.push({pattern: pattern, index: pos});
                    break;
                }

                j -= 1;
                pos -= 1;
                continue;
            }

            // no match
            if (visualize) {
                visualizationMatchText.cells[j].style.backgroundColor = 'red';
            }
            break;
        }

        i += Math.max(badCharTable[s.charCodeAt(i)], shiftTable[j]);
    }
    
    searching = false;
    return result;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}