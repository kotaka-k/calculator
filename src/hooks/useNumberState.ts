import { useState, useCallback } from 'react';

export const useNumberState = () => {
    // Use BigInt for value to support up to 10^68 (Muryotaisu)
    const [value, setValue] = useState<bigint>(0n);

    // Constants
    // Muryotaisu is 10^68. Let's set max slightly above or exact.
    // 10^68 is 1 followed by 68 zeros. (69 digits)
    const MAX_VAL = 10n ** 69n - 1n;
    const MIN_VAL = 0n;

    const updateValue = (delta: bigint) => {
        setValue(prev => {
            let next = prev + delta;

            if (next > MAX_VAL) next = MAX_VAL;
            if (next < MIN_VAL) next = MIN_VAL;

            return next;
        });
    };

    const incrementDigit = useCallback((powerOfTen: bigint) => {
        updateValue(powerOfTen);
    }, []);

    const decrementDigit = useCallback((powerOfTen: bigint) => {
        updateValue(-powerOfTen);
    }, []);

    const multiplyByTen = useCallback(() => {
        setValue(prev => {
            if (prev === 0n) return 10n;
            const next = prev * 10n;
            if (next > MAX_VAL) return MAX_VAL;
            return next;
        });
    }, []);

    const divideByTen = useCallback(() => {
        setValue(prev => prev / 10n);
    }, []);

    // Helper to get digits for display
    // BigInt.toString() works like Number.toString()
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
