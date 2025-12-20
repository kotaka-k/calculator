import React from 'react';
import { DigitColumn } from './DigitColumn';
import './NumberDisplay.css';

interface NumberDisplayProps {
    digits: number[];
    onIncrementDigit: (index: number) => void;
    onDecrementDigit: (index: number) => void;
    onAddDigit: () => void;
    onRemoveDigit: () => void;
}

export const NumberDisplay: React.FC<NumberDisplayProps> = ({
    digits,
    onIncrementDigit,
    onDecrementDigit,
    onAddDigit,
    onRemoveDigit
}) => {
    return (
        <div className="number-display-container">
            <div className="digit-controls">
                <button
                    className="control-btn add-digit"
                    onClick={onAddDigit}
                    disabled={digits.length >= 5}
                >
                    桁をふやす +
                </button>
                <button
                    className="control-btn remove-digit"
                    onClick={onRemoveDigit}
                    disabled={digits.length <= 1}
                >
                    桁をへらす -
                </button>
            </div>

            <div className="digits-row">
                {digits.map((digit, index) => (
                    <DigitColumn
                        key={index} // Note: Using index as key is acceptable here as we don't reorder, just add/remove from start/end? 
                        // Wait, we add/remove from START (MSD). Re-indexing might cause animation glitches or state jump if we tracked internal state.
                        // But DigitColumn is stateless (controlled).
                        // If we add to front: [2, 1] -> [0, 2, 1].
                        // Index 0 becomes 1. Old index 0 component gets prop digit=0.
                        // React reconciles by index. 
                        // Ideally we should use stable IDs, but index is fine for now as we just swap values.
                        digit={digit}
                        onIncrement={() => onIncrementDigit(index)}
                        onDecrement={() => onDecrementDigit(index)}
                    />
                ))}
            </div>
        </div>
    );
};
