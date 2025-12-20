import React, { useRef, useEffect, useState, useMemo } from 'react';
import './DotVisualizer.css';

interface DotVisualizerProps {
    value: number;
}

interface UnitDef {
    val: number;
    color: string;
    label: string;
}

// Draw Limit Threshold
// Changed to 10000 as requested
const UNIT_THRESHOLD = 10000;

const UNITS: UnitDef[] = [
    { val: 1, color: '#ff9f43', label: '1' }, // Orange
    { val: 100, color: '#54a0ff', label: '100' }, // Blue
    { val: 10000, color: '#5f27cd', label: '10,000' }, // Purple
    { val: 1000000, color: '#10ac84', label: '100万' }, // Green
    { val: 100000000, color: '#ee5253', label: '1億' }, // Red
];

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

    // Calculate Composition based on dynamic units
    const composition = useMemo(() => {
        if (value === 0) return [];

        const comps = [];

        let baseUnitIndex = 0;
        for (let i = 0; i < UNITS.length - 1; i++) {
            if ((value / UNITS[i].val) > UNIT_THRESHOLD) {
                baseUnitIndex = i + 1;
            } else {
                break;
            }
        }

        let rem = value;

        for (let i = baseUnitIndex; i >= 0; i--) {
            const u = UNITS[i];
            const count = Math.floor(rem / u.val);
            rem = rem % u.val;

            if (count > 0) {
                comps.push({ unit: u, count });
            }
        }

        return comps;
    }, [value]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        if (value === 0) return;

        // --- Layout Logic ---
        const getLayoutPos = (index: number) => {
            // 10x10 blocks layout
            const idxInBlock = index % 100;
            const blockIdx = Math.floor(index / 100);

            const bx = idxInBlock % 10;
            const by = Math.floor(idxInBlock / 10);

            const blocksPerRow = 10;
            const blockCol = blockIdx % blocksPerRow;
            const blockRow = Math.floor(blockIdx / blocksPerRow);

            const GAP_BLOCK = 1.0;

            const x = (blockCol * (10 + GAP_BLOCK)) + bx;
            const y = (blockRow * (10 + GAP_BLOCK)) + by;

            const group10k = Math.floor(blockRow / 10);
            const yGap = group10k * 2.0;

            return { x: x, y: y + yGap };
        };

        // Calculate Bounds for a count
        const calculateBounds = (cnt: number, startY: number) => {
            if (cnt === 0) return { width: 0, height: 0, maxY: startY };
            const last = getLayoutPos(cnt - 1);
            return {
                width: last.x + 1,
                height: last.y + 1,
                maxY: startY + last.y + 1
            };
        };

        let currentY = 0;
        let maxVirtualW = 0;

        const layoutSections = composition.map(comp => {
            const bounds = calculateBounds(comp.count, currentY);
            const sectionStart = currentY;
            const sectionH = bounds.height;

            if (bounds.width > maxVirtualW) maxVirtualW = bounds.width;

            // Advance Y for next section if current section is not empty
            // Gap between sections
            // Reduced gap to bring sections closer
            const SECTION_GAP = 1.0;
            currentY += sectionH + SECTION_GAP;

            return { ...comp, startY: sectionStart, bounds };
        });

        // Total Virtual Height
        // Add extra padding to total height to ensure bottom is not clipped
        const totalVirtualH = Math.max(1, currentY); // kept last gap as padding
        const totalVirtualW = Math.max(10, maxVirtualW);

        // Scale
        const padding = 20;
        const availW = dimensions.width - padding * 2;
        const availH = dimensions.height - padding * 2;

        const scaleX = availW / totalVirtualW;
        const scaleY = availH / totalVirtualH;

        // Use slightly smaller scale factor to ensure fit (95%)
        const scale = Math.min(scaleX, scaleY) * 0.98;

        // Center logic?
        // Currently top-left aligned + padding.

        // Draw
        layoutSections.forEach(section => {
            const { count, unit, startY } = section;
            const color = unit.color;

            const useRect = count > 5000;
            ctx.fillStyle = color;

            for (let i = 0; i < count; i++) {
                const p = getLayoutPos(i);
                const x = p.x * scale + padding;
                const y = (p.y + startY) * scale + padding;

                const size = scale * 0.8;

                if (size < 0.8) {
                    ctx.fillRect(x, y, 1, 1);
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
        });

    }, [value, dimensions, composition]);

    return (
        <div className="dot-visualizer-container" ref={containerRef}>
            <div className="legend">
                {composition.map((c, i) => (
                    <span key={i} style={{ color: c.unit.color, marginRight: '15px', fontWeight: 'bold' }}>
                        ● = {c.unit.label}
                    </span>
                ))}
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
