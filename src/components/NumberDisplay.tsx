import React from 'react';
import { DigitColumn } from './DigitColumn';
import './NumberDisplay.css';

interface NumberDisplayProps {
    digits: number[];
    maxDigits: number; // Added for limit control
    onIncrementDigit: (powerOfTen: bigint) => void;
    onDecrementDigit: (powerOfTen: bigint) => void;
    onMultiply: () => void;
    onDivide: () => void;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({
    digits,
    maxDigits, // Add this
    onIncrementDigit,
    onDecrementDigit,
    onMultiply,
    onDivide
}) => {
    // Determine scale based on digits length
    // With wrap, we don't need to shrink too aggressively unless line is full
    // Max 16 digits. ~8 per line.
    const scaleClass = digits.length > 7 ? 'scale-small' : digits.length > 5 ? 'scale-medium' : '';

    return (
        <div className={`number-display-container ${scaleClass}`}>
            <div className="global-controls">
                <button className="global-btn" onClick={onMultiply} disabled={digits.length >= maxDigits}>
                    ふやす
                </button>
                <button className="global-btn" onClick={onDivide} disabled={digits.length <= 1}>
                    へらす
                </button>
            </div>

            <div className="digits-row">
                {digits.map((digit, index) => {
                    // Calculate power of ten for this specific digit
                    // use BigInt
                    const power = digits.length - 1 - index;
                    const powerOfTen = 10n ** BigInt(power);

                    return (
                        <DigitColumn
                            key={`digit-${digits.length}-${index}`}
                            digit={digit}
                            onIncrement={() => onIncrementDigit(powerOfTen)}
                            onDecrement={() => onDecrementDigit(powerOfTen)}
                        />
                    );
                })}
            </div>
            <div className="label-text">
                ▲ ふやす / ▼ へらす
            </div>
        </div>
    );
};
