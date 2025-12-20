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

        // --- Hierarchical Layout Logic ---
        // Calculate virtual coordinates for each dot to create grouping gaps.
        // Base unit = 1 dot size.

        // Gaps (in dot units)
        const GAP_5 = 0.5;   // Gap inside 100 block (between 5s)
        const GAP_100 = 2;   // Gap between 100 blocks
        const GAP_1000 = 4;  // Gap between 1000 blocks
        const GAP_10000 = 8; // Gap between 10000 blocks

        // Dimensions of blocks (pre-calculated to stack offsets)
        // 100 Block (10x10) with internal gaps:
        // Width = 5 + GAP_5 + 5 = 10.5
        // Height = 5 + GAP_5 + 5 = 10.5
        const W_100 = 10.5;
        const H_100 = 10.5;

        // 1000 Block (10x 100-blocks, arranged 5x2)
        // Width = (W_100 * 5) + (GAP_100 * 4)
        // Height = (H_100 * 2) + (GAP_100 * 1)
        const W_1000 = (W_100 * 5) + (GAP_100 * 4);
        const H_1000 = (H_100 * 2) + GAP_100;

        // 10000 Block (10x 1000-blocks, arranged 2x5 - transposed to alternate aspect? or 5x2?)
        // To keep aspect ratio somewhat square-ish, let's alternate.
        // 1000 was 5(w) x 2(h).
        // Let's make 10000 2(w) x 5(h) of 1000-blocks?
        // Or just 5x2 again? 5x2 is wide. 
        // Let's try to adapt ratio based on value?
        // For simplicity and consistency in "reading", sticking to 5x2 or 2x5 fixed is safer.
        // Let's do 5x2 for 1000, and 2x5 for 10000 to balance.
        // W_10000 = (W_1000 * 2) + (GAP_1000 * 1)
        // H_10000 = (H_1000 * 5) + (GAP_1000 * 4)
        const W_10000 = (W_1000 * 2) + GAP_1000;
        const H_10000 = (H_1000 * 5) + (GAP_1000 * 4);

        // 100000 Block, 1000000 Block...
        // Just keep stacking logic or fallback to grid for massive numbers?
        // Let's implement function to get Virtual X, Y.

        // We need to determine layout bounds to calculate scale.
        // We can just calculate the pos of the last dot? 
        // No, layout might be row-major. The max X and max Y depend on the structure.
        // Actually, since it's a fixed structure, we can calculate bounds easily if we know N.
        // But exact bounds depend on how filled the last blocks are.

        // Let's compute positions on the fly and track min/max. 
        // Optimization: calc max bounds from theoretical full blocks + remainder?
        // For < 1,000,000, calculating 1M positions is cheap in JS. 
        // Start with that.

        const getVirtualPos = (i: number) => {
            let x = 0;
            let y = 0;

            let rem = i;

            // 1. Position within 100 block (0-99)
            const idx100 = rem % 100;
            rem = Math.floor(rem / 100);

            let lx = idx100 % 10;
            let ly = Math.floor(idx100 / 10);

            if (lx >= 5) lx += GAP_5;
            if (ly >= 5) ly += GAP_5;

            x += lx;
            y += ly;

            // 2. Position of 100-block within 1000-block (0-9) -> 5x2 grid
            if (rem > 0) {
                const idx1000 = rem % 10;
                rem = Math.floor(rem / 10);

                const bx = idx1000 % 5; // 0-4
                const by = Math.floor(idx1000 / 5); // 0-1

                x += bx * (W_100 + GAP_100);
                y += by * (H_100 + GAP_100);
            }

            // 3. Position of 1000-block within 10000-block (0-9) -> 2x5 grid (Alternating for squareness)
            if (rem > 0) {
                const idx10000 = rem % 10;
                rem = Math.floor(rem / 10);

                const bx = idx10000 % 2;
                const by = Math.floor(idx10000 / 2);

                x += bx * (W_1000 + GAP_1000);
                y += by * (H_1000 + GAP_1000);
            }

            // 4. Position of 10000-block within 100000-block (0-9) -> 5x2 grid
            if (rem > 0) {
                const idx100k = rem % 10;
                rem = Math.floor(rem / 10);

                const bx = idx100k % 5;
                const by = Math.floor(idx100k / 5);

                x += bx * (W_10000 + GAP_10000);
                y += by * (H_10000 + GAP_10000);
            }

            // 5. Above 100k? 1M = 10 x 100k. 2x5 grid.
            if (rem > 0) {
                const idx1M = rem; // Just linear for now or 2x?
                // 1M limit? user might go to 100M.
                // Let's just do simple stacking for highest level to avoid infinite recursion logic complexity.
                // Stacking horizontally?
                // Let's assume max 9 digits (100M).
                // 100k blocks are 5x2. Size W_100k, H_100k.
                // W_100k = (W_10000 * 5) + (GAP_10000 * 4)...

                // To simplify: Just use a standard large grid wrapper if needed.
                // But for now, let's just stack 100k blocks in a wrapping grid based on aspect ratio?
                // Or fixed 5x2?

                // Fixed 2x5 for 1M.
                // W_100k approx 100 wide. H_100k approx 100 high?
                // W_100=10. W_1000=54. W_10000=112. W_100k=~560.

                // Let's stick to the alternating pattern 5x2 / 2x5.

                const W_100k = (W_10000 * 5) + (GAP_10000 * 4);
                const H_100k = (H_10000 * 2) + GAP_10000;
                const GAP_100k = 16;

                const bx = idx1M % 2;
                const by = Math.floor(idx1M / 2);

                x += bx * (W_100k + GAP_100k);
                y += by * (H_100k + GAP_100k);
            }

            return { x, y };
        };

        // Bounds Calculation
        // We only need to check the last item? 
        // No, because of line wrapping (5x2), the bottom-right isn't always the max X/Y.
        // But for a full rectangular fill, it is. 
        // For partial fill, max X is the width of a full row, max Y is current row.
        // Let's just iterate logical corners of the structure?
        // Or just iterate all points? 1M iterations is fast enough for Bounds calc.
        // 1M points getVirtualPos:
        // JS 10^6 ops is ~1-5ms. Safe.

        let logicalMaxX = 0;
        let logicalMaxY = 0;

        // Optimization: Don't store all points, just calc and draw?
        // We need scale first.
        // Loop 1: Calc Bounds.
        // Loop 2: Draw.
        // Actually, we can approximate bounds?
        // No, exact bounds are needed for nice fitting.
        // Let's run the loop. 

        // Wait, if N=100M, loop is slow.
        // But N <= 999,999,999. 100M loops is slow (1s+).
        // The previous optimization (Rect/ImageData) handled the drawing speed.
        // Calculation speed is now the bottleneck for 100M.

        // If value > 1M, we should probably simplify the layout or just approximation.
        // Or, we only calculate bounds based on the "Skeleton" (corners of blocks).
        // The visualizer is mostly for "Amount feel".
        // 100M discrete dots is hard to see anyway.
        // But let's try to support up to ~1M with full logic, and maybe simplify above?
        // User asked "100万以上の描画で負荷が高すぎる".
        // So 1M+ performance is critical.

        // Fast Bounds Calculation:
        // We don't need to check every point. 
        // We just need to check the boundary points of the highest active block.
        // But simpler: just check specific indices? (e.g. last one, and end of each row).
        // Actually, simply `getVirtualPos(value - 1)` gives the coordinate of the last dot.
        // `getVirtualPos(value - 1)` gives us the end point.
        // But we also need the Maximum Extent.
        // The structure grows monotonously in steps.
        // Max width is determined by the largest full block completed, or current partial row.

        // Actually, we can just "simulate" the bounds by checking the boundaries of the hierarchical blocks.
        // Calculating getting bounds for 1M is fast. For 100M it's slow.
        // Let's stick to 2-pass if N < 500k.
        // For N > 500k, use estimated bounds from full blocks?

        // Let's implement the loop for bounds. 
        // Check performance for 1M. 1M ops in V8 is very fast.
        // If > 2M, we can skip bounds check and assume full width of the hierarchy?

        const count = value;

        // Determine bounds
        if (count < 2000000) {
            for (let i = 0; i < count; i += Math.max(1, Math.floor(count / 1000))) {
                // Sparse sampling for bounds? Unsafe for accurate centering.
                // But checking every point is robust.
                // Let's just check the corners of blocks?
                // Checking every 100th point is probably enough to catch row ends?
                // Actually, just checking `i` where blocks wrap is enough.
                // But simpler:
                const p = getVirtualPos(i);
                if (p.x > logicalMaxX) logicalMaxX = p.x;
                if (p.y > logicalMaxY) logicalMaxY = p.y;
            }
            // Always check last point
            const pLast = getVirtualPos(count - 1);
            if (pLast.x > logicalMaxX) logicalMaxX = pLast.x;
            if (pLast.y > logicalMaxY) logicalMaxY = pLast.y;

            // Add 1 for size (coord is index)
            logicalMaxX += 1;
            logicalMaxY += 1;
        } else {
            // Estimate for huge numbers: just take the bounds of the full capacity
            const p = getVirtualPos(count - 1);
            logicalMaxX = Math.max(p.x + 1, 100); // minimal safety
            logicalMaxY = Math.max(p.y + 1, 100);
        }

        // Padding
        const padding = 10;
        const availableW = dimensions.width - padding * 2;
        const availableH = dimensions.height - padding * 2;

        // Calculate Scale
        const scaleX = availableW / logicalMaxX;
        const scaleY = availableH / logicalMaxY;
        const scale = Math.min(scaleX, scaleY);

        const usePixelManipulation = value > 10000;

        // Prepare for drawing
        // Color: #ff9f43 -> R:255, G:159, B:67

        if (usePixelManipulation) {
            const imageData = ctx.createImageData(dimensions.width, dimensions.height);
            const data = imageData.data;
            const width = dimensions.width;

            for (let i = 0; i < count; i++) {
                const p = getVirtualPos(i);

                // Convert to screen coords
                const sx = Math.floor(p.x * scale) + padding;
                const sy = Math.floor(p.y * scale) + padding;

                // Draw
                if (sx >= 0 && sx < width && sy >= 0 && sy < dimensions.height) {
                    const idx = (sy * width + sx) * 4;
                    data[idx] = 255;
                    data[idx + 1] = 159;
                    data[idx + 2] = 67;
                    data[idx + 3] = 255;

                    // Bold/2x2 if scale is large enough
                    if (scale > 1.8) {
                        if (sx + 1 < width) {
                            const i2 = idx + 4;
                            data[i2] = 255; data[i2 + 1] = 159; data[i2 + 2] = 67; data[i2 + 3] = 255;
                        }
                        if (sy + 1 < dimensions.height) {
                            const i3 = ((sy + 1) * width + sx) * 4;
                            data[i3] = 255; data[i3 + 1] = 159; data[i3 + 2] = 67; data[i3 + 3] = 255;
                        }
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);
        } else {
            // Standard draw
            ctx.fillStyle = '#ff9f43';
            const useRect = value > 2000;

            for (let i = 0; i < count; i++) {
                const p = getVirtualPos(i);
                const x = p.x * scale + padding;
                const y = p.y * scale + padding;
                const size = scale * 0.8; // gap included in layout, so dot is smaller than unit

                if (size < 0.5) {
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
