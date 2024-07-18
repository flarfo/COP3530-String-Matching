// References:
// Boyer, Robert S. Moore, J Strother (October 1977). "A Fast String Searching Algorithm" 

const NUM_CHARS = 256; // assuming ASCII, can be changed to 26 for alphabetic strings

// string s, string pattern
export default function boyerMoore(s, pattern) {

    // PREPROCESSING
    const patternSize = pattern.length;
    
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
        badCharTable[pattern.charCodeAt(i)] = Math.max(1, patternSize - i - 1);
    }

    /* 
    generate a shift table (map) to represent the given pattern
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
        let j = patternSize - 1;

        while (j >= 0) {
            console.log("i: " + s.charAt(i) + ", j: " + pattern.charAt(j))
            if (s.charAt(i) == pattern.charAt(j)) {
                console.log("match");
                j -= 1;

                if (j == 0) {
                    result.push(i - 1)
                    console.log("added");
                    break;
                }

                i -= 1;
                continue;
            }
            console.log("no match");
            break;
        }

        const shift = Math.max(badCharTable[s.charCodeAt(i)], shiftTable[j]);
        
        console.log(shift + " bad: " + badCharTable[s.charCodeAt(i)] + ", shift: " + shiftTable[j]);
        i += shift;
        console.log("j = " + j);
        console.log("i = " + i);
    }
    
    return result;
}