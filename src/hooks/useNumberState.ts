import { useState, useCallback, useMemo } from 'react';

export const useNumberState = () => {
    // Current value
    const [value, setValue] = useState<bigint>(0n);
    // Dynamic digit limit (default 5 for Phase 7 requirement)
    const [maxDigits, setMaxDigits] = useState<number>(5);

    // Dynamic MAX_VAL based on maxDigits
    const MAX_VAL = useMemo(() => 10n ** BigInt(maxDigits) - 1n, [maxDigits]);
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
    }, [MAX_VAL]); // Updated dependencies

    const decrementDigit = useCallback((powerOfTen: bigint) => {
        updateValue(-powerOfTen);
    }, [MAX_VAL]);

    const multiplyByTen = useCallback(() => {
        setValue(prev => {
            if (prev === 0n) return 10n > MAX_VAL ? MAX_VAL : 10n;
            const next = prev * 10n;
            if (next > MAX_VAL) return MAX_VAL;
            return next;
        });
    }, [MAX_VAL]);

    const divideByTen = useCallback(() => {
        setValue(prev => prev / 10n);
    }, []);

    // Also ensure current value doesn't exceed new MaxDigits
    const safeSetMaxDigits = useCallback((newMax: number) => {
        setMaxDigits(newMax);
        const newMaxVal = 10n ** BigInt(newMax) - 1n;
        setValue(prev => (prev > newMaxVal ? newMaxVal : prev));
    }, []);

    // Helper to get digits for display
    const digits = value.toString().split('').map(Number);

    return {
        value,
        digits,
        maxDigits,
        incrementDigit,
        decrementDigit,
        multiplyByTen,
        divideByTen,
        setMaxDigits: safeSetMaxDigits
    };
};
