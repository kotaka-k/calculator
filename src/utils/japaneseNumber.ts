
const ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

// Helper to read 4 digits (up to 9999)
const read4Digits = (num: number): string => {
    if (num === 0) return '';

    let result = '';

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

    return result;
};

export const numberToJapanese = (num: number): string => {
    if (num === 0) return 'ぜろ';

    let result = '';

    // Oku (100,000,000s)
    const oku = Math.floor(num / 100000000);
    const remainderOku = num % 100000000;

    if (oku > 0) {
        result += read4Digits(oku) + 'おく ';
    }

    // Man (10,000s)
    // Need to handle 10000-99999999 range within 'man' block
    // Actually remainderOku is max 99999999.
    // Man part is floor(remainderOku / 10000). Max 9999.

    const man = Math.floor(remainderOku / 10000);
    const remainderMan = remainderOku % 10000;

    if (man > 0) {
        const manRead = read4Digits(man);
        result += manRead + 'まん ';
    }

    // Under 10,000
    if (remainderMan > 0) {
        result += read4Digits(remainderMan);
    }

    return result.trim();
};
