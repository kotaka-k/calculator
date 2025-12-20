
// Using '4' and '7' as placeholders because they change often?
// Actually 'yon' and 'nana' are standard for counting. 'shi' and 'shichi' are less common for simple counting.
// Let's stick to standard reading.
const ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

export const numberToJapanese = (num: number): string => {
    if (num === 0) return 'ぜろ';

    let result = '';
    // Breaks down into chunks of 10000 (man) if needed, but for now let's handle up to 99999

    // 10000s
    const tenThousands = Math.floor(num / 10000) % 10;
    if (tenThousands > 0) {
        if (tenThousands === 1) {
            result += 'いちまん '; // "Ichiman" is explicit, unlike "Ichi hyaku" -> "Hyaku"
        } else {
            result += ONES[tenThousands] + 'まん ';
        }
    }

    // 1000s
    const thousands = Math.floor(num / 1000) % 10;
    if (thousands > 0) {
        if (thousands === 1) result += 'せん ';
        else if (thousands === 3) result += 'さんぜん ';
        else if (thousands === 8) result += 'はっせん ';
        else result += ONES[thousands] + 'せん ';
    }

    // 100s
    const hundreds = Math.floor(num / 100) % 10;
    if (hundreds > 0) {
        if (hundreds === 1) result += 'ひゃく ';
        else if (hundreds === 3) result += 'さんびゃく ';
        else if (hundreds === 6) result += 'ろっぴゃく ';
        else if (hundreds === 8) result += 'はっぴゃく ';
        else result += ONES[hundreds] + 'ひゃく ';
    }

    // 10s
    const tens = Math.floor(num / 10) % 10;
    if (tens > 0) {
        if (tens === 1) result += 'じゅう ';
        else result += ONES[tens] + 'じゅう ';
    }

    // 1s
    const ones = num % 10;
    if (ones > 0) {
        result += ONES[ones];
    }

    return result.trim();
};
