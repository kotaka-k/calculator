import { useState, useCallback } from 'react';

export const useNumberState = () => {
    const [value, setValue] = useState<number>(0);

    // Constants
    const MAX_VAL = 999999999; // 9 digits
    const MIN_VAL = 0;

    const updateValue = (delta: number) => {
        setValue(prev => {
            let next = prev + delta;

            // Handle special case: if we are at 0 and decrease 10, should we go to min?
            // Logic: 0 -> (-10) -> Clamps to 0. 
            // This is expected.

            if (next > MAX_VAL) next = MAX_VAL;
            if (next < MIN_VAL) next = MIN_VAL;

            return next;
        });
    };

    const incrementDigit = useCallback((powerOfTen: number) => {
        updateValue(powerOfTen);
    }, []);

    const decrementDigit = useCallback((powerOfTen: number) => {
        updateValue(-powerOfTen);
    }, []);

    // Helper to get digits for display
    // We want to ensure at least 1 digit is returned [0]
    const digits = value.toString().split('').map(Number);

    return {
        value,
        digits,
        incrementDigit,
        decrementDigit
    };
};
