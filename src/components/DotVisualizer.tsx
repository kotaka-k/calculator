import React, { useRef, useEffect, useState } from 'react';
import './DotVisualizer.css';

interface DotVisualizerProps {
    value: number;
}

export const DotVisualizer: React.FC<DotVisualizerProps> = ({ value }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        if (value === 0) return;

        // --- Unit Decomposition ---
        const UNIT_MAN = 10000;
        const UNIT_HYAKU = 100;

        // Decompose
        const countMan = Math.floor(value / UNIT_MAN);
        const remMan = value % UNIT_MAN;

        const countHyaku = Math.floor(remMan / UNIT_HYAKU);
        const remHyaku = remMan % UNIT_HYAKU;

        const countOne = remHyaku;

        // Layout Logic
        // Standard Grid with gaps is best.

        const getLayoutPos = (index: number) => {
            // 1. Pos in 100-block (0-99)
            const idxInBlock = index % 100;
            const blockIdx = Math.floor(index / 100);

            const bx = idxInBlock % 10;
            const by = Math.floor(idxInBlock / 10);

            // 2. Arrange blocks. 
            // Let's say we arrange blocks in rows of 10 blocks (1000 dots total width).
            // 10 blocks wide = 10 * (10 + gap) wide.

            const blockCol = blockIdx % 10;
            const blockRow = Math.floor(blockIdx / 10);

            // 3. Spacing
            // Gap between blocks
            const GAP_BLOCK = 1.0;

            const x = (blockCol * (10 + GAP_BLOCK)) + bx;
            const y = (blockRow * (10 + GAP_BLOCK)) + by;

            // Gap for 1000s? (Every 10 blocks is a row, so natural gap via blockRow)
            // Gap for 10,000s? (Every 10 rows of blocks -> 100 blocks = 10,000 dots)
            // Add extra gap every 10 block-rows.

            const group10k = Math.floor(blockRow / 10);
            const yGap = group10k * 2.0;

            return { x: x, y: y + yGap };
        };

        // Bounds Calculation
        const calculateBounds = (cnt: number, offsetX: number, offsetY: number) => {
            if (cnt === 0) return { mx: offsetX, my: offsetY };
            // Check last item roughly
            const last = getLayoutPos(cnt - 1);
            return {
                mx: last.x + 1 + offsetX,
                my: last.y + 1 + offsetY
            };
        };

        // We stack sections vertically with colors.

        // 1. Man Section
        let manBounds = { mx: 0, my: 0 };
        if (countMan > 0) {
            manBounds = calculateBounds(countMan, 0, 0);
        }

        // 2. Hyaku Section
        // Start Y is manBounds.my + gap
        const manHeight = countMan > 0 ? manBounds.my : 0;
        const hyakuStartY = manHeight + (countMan > 0 ? 5 : 0); // Gap 5 units

        let hyakuBounds = { mx: 0, my: 0 };
        if (countHyaku > 0) {
            const b = calculateBounds(countHyaku, 0, hyakuStartY);
            hyakuBounds = { mx: b.mx, my: b.my };
        }

        // 3. One Section
        const hyakuHeight = countHyaku > 0 ? (hyakuBounds.my - hyakuStartY) : 0;
        const oneStartY = hyakuStartY + hyakuHeight + (countHyaku > 0 ? 5 : 0);

        let oneBounds = { mx: 0, my: 0 };
        if (countOne > 0) {
            const b = calculateBounds(countOne, 0, oneStartY);
            oneBounds = { mx: b.mx, my: b.my };
        }

        const finalMaxX = Math.max(manBounds.mx, hyakuBounds.mx, oneBounds.mx);
        const finalMaxY = Math.max(manBounds.my, hyakuBounds.my, oneBounds.my);

        // Layout Width/Height calculated.
        // Padding
        const padding = 10;
        const availW = dimensions.width - padding * 2;
        const availH = dimensions.height - padding * 2;

        const scaleX = availW / finalMaxX;
        const scaleY = availH / finalMaxY;
        const scale = Math.min(scaleX, scaleY);

        // Draw
        const drawSection = (cnt: number, startYUrl: number, color: string) => {
            const useRect = cnt > 5000; // Optimization

            ctx.fillStyle = color;

            for (let i = 0; i < cnt; i++) {
                const p = getLayoutPos(i);
                const x = p.x * scale + padding;
                const y = (p.y + startYUrl) * scale + padding;

                const size = scale * 0.8;

                if (size < 1) {
                    ctx.fillRect(x, y, Math.max(1, scale), Math.max(1, scale));
                    continue;
                }

                if (useRect) {
                    ctx.fillRect(x, y, size, size);
                } else {
                    ctx.beginPath();
                    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };

        // Draw Man
        if (countMan > 0) drawSection(countMan, 0, '#5f27cd'); // Purple for 10k

        // Draw Hyaku
        if (countHyaku > 0) drawSection(countHyaku, hyakuStartY, '#54a0ff'); // Blue for 100

        // Draw One
        if (countOne > 0) drawSection(countOne, oneStartY, '#ff9f43'); // Orange for 1

        // Check if we need legend for current view
        // Maybe draw text on canvas? Or just HTML Overlay. Use HTML Overlay (Legend).

    }, [value, dimensions]);

    return (
        <div className="dot-visualizer-container" ref={containerRef}>
            <div className="legend">
                {/* Helper Legend */}
                {value >= 10000 && <span style={{ color: '#5f27cd', marginRight: '10px' }}>● = 10,000</span>}
                {value >= 100 && <span style={{ color: '#54a0ff', marginRight: '10px' }}>● = 100</span>}
                <span style={{ color: '#ff9f43' }}>● = 1</span>
                <br />
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
