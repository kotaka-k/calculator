import React, { useMemo } from 'react';
import './DotVisualizer.css';

interface DotVisualizerProps {
    value: number;
}

export const DotVisualizer: React.FC<DotVisualizerProps> = ({ value }) => {
    // Determine the "Unit" value for a single dot based on magnitude
    // to prevent rendering millions of DOM nodes.
    // Thresholds:
    // <= 2,000: Unit 1 (Dots)
    // <= 200,000: Unit 100 (Each dot is 100)
    // <= 20,000,000: Unit 10,000
    // > 20,000,000: Unit 1,000,000

    const unit = useMemo(() => {
        if (value <= 2000) return 1;
        if (value <= 500000) return 100;
        if (value <= 50000000) return 10000;
        return 1000000;
    }, [value]);

    const displayValue = Math.ceil(value / unit);

    // Dynamic sizing logic
    // We want the dots to fill ~75% of the screen (right panel).
    // The right panel size is roughly window.innerWidth * 0.75 x window.innerHeight.
    // We can approximate or use a ResizeObserver.
    // For simplicity, let's use a ref and simple heuristic in CSS variables or key.

    // We categorize displayValue count to set a "density class".
    const densityInfo = useMemo(() => {
        if (displayValue <= 10) return { className: 'density-vv-low', dotSize: 40 };
        if (displayValue <= 100) return { className: 'density-v-low', dotSize: 20 };
        if (displayValue <= 500) return { className: 'density-low', dotSize: 10 };
        if (displayValue <= 1000) return { className: 'density-medium', dotSize: 8 };
        if (displayValue <= 5000) return { className: 'density-high', dotSize: 5 };
        return { className: 'density-extreme', dotSize: 3 };
    }, [displayValue]);

    // Grouping Logic
    // We visualize `displayValue` items.
    // Grouping hierarchy:
    // 10 items -> 1 Row/Group
    // 100 items -> 1 Block (10x10)
    // 1000 items -> 1 Large Block (collection of 10 Blocks)

    // We'll render hierarchically.
    // Top Level: Thousands
    // Next: Hundreds
    // Next: Tens (if we want explicit rows, or just grid flow)
    // Actually, standard grid flow of 10x10 blocks is easiest to read.

    // Let's break down `displayValue` into 100-blocks.

    const blocks100 = useMemo(() => {
        const blocks = [];
        const numHundreds = Math.ceil(displayValue / 100);

        for (let i = 0; i < numHundreds; i++) {
            const remaining = displayValue - (i * 100);
            const count = Math.min(remaining, 100);
            blocks.push(count);
        }
        return blocks;
    }, [displayValue]);

    return (
        <div className={`dot-visualizer-container ${densityInfo.className}`}>
            <div className="legend">
                現在のかず: {value.toLocaleString()}
                {unit > 1 && <span className="unit-label"> (● = {unit.toLocaleString()})</span>}
            </div>

            <div className="dots-scroll-area">
                <div className="blocks-container">
                    {blocks100.map((count, idx) => (
                        <HundredBlock key={idx} count={count} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const HundredBlock: React.FC<{ count: number }> = ({ count }) => {
    // Render 100 items (or less)
    // We can just render dots directly, Grid CSS handles the 10-per-row.
    // However, to strictly visualize "10 rows of 10", CSS Grid 10 cols is perfect.

    // Performance optimization: 
    // If count < 100, we might strictly show empty slots? 
    // No, standard is just show existing.

    const dots = Array.from({ length: count });

    return (
        <div className="hundred-block">
            {dots.map((_, i) => (
                <div key={i} className="dot"></div>
            ))}
        </div>
    );
};
