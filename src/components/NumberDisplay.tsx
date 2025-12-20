import React from 'react';
import { DigitColumn } from './DigitColumn';
import './NumberDisplay.css';

interface NumberDisplayProps {
    digits: number[];
    onIncrementDigit: (powerOfTen: number) => void;
    onDecrementDigit: (powerOfTen: number) => void;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({
    digits,
    onIncrementDigit,
    onDecrementDigit,
}) => {
    return (
        <div className="number-display-container">
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
