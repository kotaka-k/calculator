import React, { useMemo } from 'react';
import './DotVisualizer.css';

interface DotVisualizerProps {
    value: number;
}

export const DotVisualizer: React.FC<DotVisualizerProps> = ({ value }) => {
    // We want to group dots:
    // - 10 per row/block
    // - 100 per block
    // This means a block of 100 contains 10 rows of 10 dots.

    // Let's create an array of "Hundreds" blocks.
    // Each hundreds block contains min(remaining, 100) dots.

    const blocks = useMemo(() => {
        const numHundreds = Math.ceil(value / 100);
        const result = [];

        for (let i = 0; i < numHundreds; i++) {
            const remaining = value - (i * 100);
            const count = Math.min(remaining, 100);
            result.push(count);
        }
        return result;
    }, [value]);

    // Dynamic size class based on digits
    const sizeClass = value < 100 ? 'size-large' : value < 1000 ? 'size-medium' : 'size-small';

    return (
        <div className={`dot-visualizer ${sizeClass}`}>
            {blocks.map((count, index) => (
                <div key={index} className="hundred-block">
                    {Array.from({ length: count }).map((_, dotIndex) => (
                        <div key={dotIndex} className={`dot ${(dotIndex + 1) % 10 === 0 ? 'tenth' : ''}`} />
                    ))}
                </div>
            ))}
        </div>
    );
};
