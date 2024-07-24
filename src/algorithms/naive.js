export default function naive(s, pattern) {
    const m  = pattern.length;
    const n = s.length;

    const result = [];

    for (let i = 0; i < n - m + 1; i++) {
        let j = 0;

        while (j < m) {
            if (s.charAt(i + j) != pattern.charAt(j)) break;
            j += 1;
        }

        if (j == m) {
            result.push(i);
        }
    }

    return result;
}