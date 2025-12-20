import { useState, useCallback } from 'react';

export const useNumberState = (initialDigits = 3) => {
    // We manage the number as an array of digits to easily handle individual column manipulation
    // e.g., 123 -> [3, 2, 1] (index 0 is ones place, index 1 is tens place, etc.)
    // Wait, standard reading is Left to Right (Hundreds -> Ones).
    // But math-wise, index 0 as ones place is easier.
    // Let's store as number and derive digits, OR store as digits.
    // Storing as digits allows "007" if we want, but usually we just want the number.
    // The requirement says "Number of digits" (桁数) can change.
    // If we have 3 digits, we can show 000-999? Or just 0-999.
    // "Slot reel" implies we manipulate each digit individually.
    // So [1, 2, 3] for 123 is probably better for UI state.

    // Let's use an array of numbers, where index 0 is the Most Significant Digit?
    // Or index 0 is least significant?
    // User sees: [1] [2] [3]
    // Controls: Up/Down for each.

    const [digits, setDigits] = useState<number[]>(new Array(initialDigits).fill(0));

    const incrementDigit = useCallback((index: number) => {
        setDigits(prev => {
            const newDigits = [...prev];
            newDigits[index] = (newDigits[index] + 1) % 10;
            return newDigits;
        });
    }, []);

    const decrementDigit = useCallback((index: number) => {
        setDigits(prev => {
            const newDigits = [...prev];
            newDigits[index] = (newDigits[index] - 1 + 10) % 10;
            return newDigits;
        });
    }, []);

    const addDigit = useCallback(() => {
        setDigits(prev => {
            if (prev.length >= 5) return prev; // Max 5 digits for now
            return [0, ...prev]; // Add 0 at the beginning (MSD)
        });
    }, []);

    const removeDigit = useCallback(() => {
        setDigits(prev => {
            if (prev.length <= 1) return prev; // Min 1 digit
            // Remove the first digit (MSD)
            const newDigits = [...prev];
            newDigits.shift();
            return newDigits;
        });
    }, []);

    // Calculate total value
    const value = parseInt(digits.join(''), 10);

    return {
        digits,
        value,
        incrementDigit,
        decrementDigit,
        addDigit,
        removeDigit
    };
};
