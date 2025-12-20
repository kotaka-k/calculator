import React, { useRef, useEffect, useState, useMemo } from 'react';
import './DotVisualizer.css';

interface DotVisualizerProps {
    value: bigint;
}

interface UnitDef {
    val: bigint;
    color: string;
    label: string;
}

// Draw Limit Threshold
const UNIT_THRESHOLD = 10000n;

// Generate 100x units up to 10^68 (Muryotaisu)
const generateUnits = () => {
    const baseColors = ['#ff9f43', '#54a0ff', '#5f27cd', '#10ac84', '#ee5253', '#ff9ff3', '#feca57', '#00d2d3'];
    const units: UnitDef[] = [];
    let val = 1n;

    // Japanese units every 10^4
    const jpUnits = ['', '万', '億', '兆', '京', '垓', '𥝱', '穣', '溝', '澗', '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'];

    // We want steps of 100x.
    // Loop until we pass ~10^70

    for (let i = 0; i <= 35; i++) {
        // power = i * 2. 10^(2i).

        // Construct label
        const power = 2 * i;

        let label = '';
        if (power === 0) label = '1';
        else if (power === 2) label = '100';
        else {
            // Power >= 4.
            // unit index = floor(power / 4)
            const unitIdx = Math.floor(power / 4);
            const rem = power % 4; // 0 or 2

            const unitName = unitIdx < jpUnits.length ? jpUnits[unitIdx] : '?';
            const prefix = rem === 2 ? '100' : '1';
            label = prefix + unitName;
        }

        units.push({
            val: val,
            color: baseColors[i % baseColors.length],
            label: label
        });

        val = val * 100n;
    }
    return units;
};

const DYNAMIC_UNITS = generateUnits();

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
        if (value === 0n) return [];

        const comps = [];

        let baseUnitIndex = 0;
        for (let i = 0; i < DYNAMIC_UNITS.length - 1; i++) {
            // Check if value is much larger than this unit
            if ((value / DYNAMIC_UNITS[i].val) > UNIT_THRESHOLD) {
                baseUnitIndex = i + 1;
            } else {
                break;
            }
        }

        let rem = value;

        for (let i = baseUnitIndex; i >= 0; i--) {
            const u = DYNAMIC_UNITS[i];
            const count = Number(rem / u.val); // Convert count to Number (safe because < Threshold)
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
        if (value === 0n) return;

        // --- Layout Logic ---
        const getLayoutPos = (index: number) => {
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

        // Calculate Bounds
        const calculateBounds = (cnt: number, startY: number) => {
            if (cnt === 0) return { width: 0, height: 0, maxY: startY };

            const lastIdx = cnt - 1;
            const lastPos = getLayoutPos(lastIdx);

            const blockIdx = Math.floor(lastIdx / 100);
            const blocksPerRow = 10;
            const blockRow = Math.floor(blockIdx / blocksPerRow);
            const colInRow = blockIdx % blocksPerRow;
            const GAP_BLOCK = 1.0;

            let width = lastPos.x + 1;

            if (blockRow > 0) {
                const maxBlockCol = 9;
                width = (maxBlockCol * (10 + GAP_BLOCK)) + 9 + 1;
            } else {
                const idxInBlock = lastIdx % 100;
                const by = Math.floor(idxInBlock / 10);
                if (by > 0) {
                    const startX = colInRow * (10 + GAP_BLOCK);
                    width = startX + 10;
                }
            }

            let height = lastPos.y + 1;
            const group10k = Math.floor(blockRow / 10);
            const yGap = group10k * 2.0;
            const blockRowStartY = (blockRow * (10 + GAP_BLOCK)) + yGap;

            if (colInRow > 0) {
                height = blockRowStartY + 10;
            }
            return { width, height, maxY: startY + height };
        };

        let currentY = 0;
        let maxVirtualW = 0;
        const SECTION_GAP = 2.0;

        const layoutSections = composition.map(comp => {
            const bounds = calculateBounds(comp.count, currentY);
            const sectionStart = currentY;
            const sectionH = bounds.height;

            if (bounds.width > maxVirtualW) maxVirtualW = bounds.width;

            if (sectionH > 0) {
                currentY += sectionH + SECTION_GAP;
            }

            return { ...comp, startY: sectionStart, bounds };
        });

        const totalVirtualH = Math.max(1, currentY);
        const totalVirtualW = Math.max(10, maxVirtualW);

        const padding = 20;
        const availW = dimensions.width - padding * 2;
        const availH = dimensions.height - padding * 2;

        const scaleX = availW / totalVirtualW;
        const scaleY = availH / totalVirtualH;
        const scale = Math.min(scaleX, scaleY) * 0.95;

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
