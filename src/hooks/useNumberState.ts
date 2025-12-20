import { useState, useCallback } from 'react';

export const useNumberState = () => {
    const [value, setValue] = useState<number>(0);

    // Constants
    const MAX_VAL = 999999999; // 9 digits
    const MIN_VAL = 0;

    const updateValue = (delta: number) => {
        setValue(prev => {
            let next = prev + delta;

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

    const multiplyByTen = useCallback(() => {
        setValue(prev => {
            const next = prev * 10;
            if (next > MAX_VAL) return MAX_VAL;
            return next;
        });
    }, []);

    const divideByTen = useCallback(() => {
        setValue(prev => Math.floor(prev / 10));
    }, []);

    // Helper to get digits for display
    const digits = value.toString().split('').map(Number);

    return {
        value,
        digits,
        incrementDigit,
        decrementDigit,
        multiplyByTen,
        divideByTen
    };
};
