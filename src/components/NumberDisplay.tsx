import React from 'react';
import { DigitColumn } from './DigitColumn';
import './NumberDisplay.css';

interface NumberDisplayProps {
    digits: number[];
    onIncrementDigit: (powerOfTen: number) => void;
    onDecrementDigit: (powerOfTen: number) => void;
    onMultiply: () => void;
    onDivide: () => void;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({
    digits,
    onIncrementDigit,
    onDecrementDigit,
    onMultiply,
    onDivide
}) => {
    // Determine scale based on digits length
    const scaleClass = digits.length > 6 ? 'scale-small' : digits.length > 4 ? 'scale-medium' : '';

    return (
        <div className={`number-display-container ${scaleClass}`}>
            <div className="global-controls">
                <button className="global-btn" onClick={onMultiply} disabled={digits.length >= 9}>
                    ふやす
                </button>
                <button className="global-btn" onClick={onDivide} disabled={digits.length <= 1}>
                    へらす
                </button>
            </div>

            <div className="digits-row">
                {digits.map((digit, index) => {
                    // Calculate power of ten for this specific digit
                    // digits: [1, 2, 3] (value 123)
                    // index 0 -> digit '1' -> 100s place -> power 10^2
                    const powerOfTen = Math.pow(10, digits.length - 1 - index);

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
