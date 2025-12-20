
const ONES = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

// Helper to read 4 digits (up to 9999)
// Since input is handled in blocks of 10000, we can keep using number for the chunk value if < 10000
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

// Unit names for every 10^4
const UNIT_NAMES = [
    '',        // 10^0
    'まん',    // 10^4
    'おく',    // 10^8
    'ちょう',  // 10^12
    'けい',    // 10^16 (京)
    'がい',    // 10^20 (垓)
    'じょ',    // 10^24 (𥝱 - actually 'shi' or 'jo', usually 'jo' in this context?) 
    // Wikipedia: 𥝱 (Jo) or 秭 (Shi). Education usually uses Jo.
    'じょう',  // 10^28 (穣)
    'こう',    // 10^32 (溝)
    'かん',    // 10^36 (澗)
    'せい',    // 10^40 (正)
    'さい',    // 10^44 (載)
    'ごく',    // 10^48 (極)
    'ごうがしゃ', // 10^52 (恒河沙)
    'あそうぎ',   // 10^56 (阿僧祇)
    'なゆた',     // 10^60 (那由他)
    'ふかしぎ',   // 10^64 (不可思議)
    'むりょうたいすう' // 10^68 (無量大数)
];

export const numberToJapanese = (val: bigint): string => {
    if (val === 0n) return 'ぜろ';

    let currentVal = val;
    let unitIndex = 0;

    // We collect parts and prepend them, because we process from smaller units up
    // Or we can just calculate chunks. BigInt division works nicely.

    // Better strategy:
    // Convert to string, parse chunks of 4 digits from the end?
    // Or just divide by 10000n repeatedly.

    const parts: string[] = [];

    while (currentVal > 0n) {
        const chunk = Number(currentVal % 10000n);
        currentVal = currentVal / 10000n;

        if (chunk > 0) {
            const unit = unitIndex < UNIT_NAMES.length ? UNIT_NAMES[unitIndex] : '...';
            const read = read4Digits(chunk);
            parts.unshift(read + unit + ' '); // Prepend: "issenyonyaku" + "man" + " "
        }

        unitIndex++;
    }

    return parts.join('').trim();
};
