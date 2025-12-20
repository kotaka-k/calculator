import React from 'react';
import './DigitColumn.css';

interface DigitColumnProps {
    digit: number;
    onIncrement: () => void;
    onDecrement: () => void;
}

export const DigitColumn: React.FC<DigitColumnProps> = ({ digit, onIncrement, onDecrement }) => {
    return (
        <div className="digit-column">
            <button
                className="digit-btn up"
                onClick={onIncrement}
                aria-label="数を増やす"
            >
                ▲
            </button>
            <div className="digit-display">
                <span className="digit-value">{digit}</span>
            </div>
            <button
                className="digit-btn down"
                onClick={onDecrement}
                aria-label="数を減らす"
            >
                ▼
            </button>
        </div>
    );
};
