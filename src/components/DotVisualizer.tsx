import React, { useRef, useEffect, useState } from 'react';
import './DotVisualizer.css';

interface DotVisualizerProps {
    value: number;
}

export const DotVisualizer: React.FC<DotVisualizerProps> = ({ value }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Handle resizing
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };

        // Initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        if (value === 0) return;

        // Optimization for large numbers (> 10k)
        // Draw rectangles instead of arcs.
        const useRect = value > 2000;

        // Margin for container
        const padding = 10;
        const drawW = dimensions.width - padding * 2;
        const drawH = dimensions.height - padding * 2;

        // Recalculate with padding logic
        // We fit within drawW/drawH
        const rRatio = drawW / drawH;
        const rCols = Math.ceil(Math.sqrt(value * rRatio));
        // const rRows = Math.ceil(value / rCols); // Unused explicitly if we calc rSize directly

        // Effective size per cell
        // rSize = width / cols. Also height / rows approx same.
        const rSize = drawW / rCols;

        // Recalc rows based on actual size to ensure fit?
        // Not strictly needed for drawing loop

        const count = value;

        ctx.fillStyle = '#ff9f43'; // var(--color-dot) constant

        for (let i = 0; i < count; i++) {
            const c = i % rCols;
            const r = Math.floor(i / rCols);

            const x = c * rSize + padding;
            const y = r * rSize + padding;
            const d = rSize * 0.8; // Dot size (80% of cell)

            // Skip drawing if too small (< 0.5px) -> Just fill rect?
            if (d < 0.5) {
                // Too small. Draw 1px point for visibility if possible or simple density.
                // With 0.5px, rSize is < 0.6. 
                // Just fill 1px.
                ctx.fillRect(x, y, 1, 1);
                continue;
            }

            if (useRect) {
                ctx.fillRect(x, y, d, d);
            } else {
                ctx.beginPath();
                ctx.arc(x + d / 2, y + d / 2, d / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

    }, [value, dimensions]);

    return (
        <div className="dot-visualizer-container" ref={containerRef}>
            <div className="legend">
                かず: {value.toLocaleString()}
            </div>
            <canvas
                ref={canvasRef}
                width={dimensions.width}
                height={dimensions.height}
                className="dot-canvas"
            />
        </div>
    );
};
