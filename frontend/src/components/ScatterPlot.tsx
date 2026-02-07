import { useMemo, useState } from 'react';
import type { SearchCenter, AstronomicalObject } from '../types/search';
import { mapTypeLabel } from '../utils/typeMapper';

interface ScatterPlotProps {
    center: SearchCenter | null;
    results: AstronomicalObject[];
    onPointClick: (obj: AstronomicalObject) => void;
}

interface PlotPoint {
    x: number;
    y: number;
    name: string;
    type: string;
    mag: number | null;
    original: AstronomicalObject;
}

const ScatterPlot = ({ center, results, onPointClick }: ScatterPlotProps) => {
    const [hoveredPoint, setHoveredPoint] = useState<PlotPoint | null>(null);

    const colors = {
        'Star': '#ffff99',
        'Planetary nebula': '#64c8ff',
        'Nova': '#ff6464',
        'Active galaxy nucleus': '#ff9664',
        'Globular cluster (candidate)': '#9664ff',
        'Other': '#999999',
    } as Record<string, string>;

    const SVG_SIZE = 600;
    const PADDING = 60;
    const PLOT_SIZE = SVG_SIZE - 2 * PADDING;
    const CENTER_X = SVG_SIZE / 2;
    const CENTER_Y = SVG_SIZE / 2;

    const { points } = useMemo(() => {
        if (!center || results.length === 0) return { points: [] };

        const plotPoints: PlotPoint[] = results
            .filter(obj => obj.ra_deg !== null && obj.dec_deg !== null)
            .map(obj => {
                const dx = (obj.ra_deg! - center.ra) * Math.cos((center.dec * Math.PI) / 180);
                const dy = obj.dec_deg! - center.dec;
                
                const pixelsPerDegree = PLOT_SIZE / (2 * center.radius);
                const svgX = CENTER_X + dx * pixelsPerDegree;
                const svgY = CENTER_Y - dy * pixelsPerDegree;

                return {
                    x: svgX,
                    y: svgY,
                    name: obj.name,
                    type: mapTypeLabel(obj.type),
                    mag: obj.mag_v ? +obj.mag_v.toFixed(2) : null,
                    original: obj,
                };
            })
            .filter(p => p.x >= PADDING && p.x <= SVG_SIZE - PADDING && p.y >= PADDING && p.y <= SVG_SIZE - PADDING);

        return { points: plotPoints };
    }, [center, results]);

    if (!center || points.length === 0) return null;

    return (
        <div className="mt-8 bg-black/30 p-6 rounded-lg shadow-lg shadow-purple-800/20">
            <h3 className="text-xl mb-4">Sky Distribution</h3>
            <p className="text-xs text-gray-500 mb-4 italic">
                ⚠️ Note: Large datasets may experience slight lag while interacting with the plot.
            </p>
            
            <div className="flex justify-center">
                <div className="relative inline-block">
                    <svg
                        width={SVG_SIZE}
                        height={SVG_SIZE}
                        className="border border-purple-800/30 rounded bg-gray-900/50"
                        style={{ outline: 'none' }}
                    >
                        {/* Grid background */}
                        <rect x={PADDING} y={PADDING} width={PLOT_SIZE} height={PLOT_SIZE} fill="rgba(0, 0, 0, 0.3)" />

                        {/* Grid lines - subtle */}
                        <defs>
                            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(147, 51, 234, 0.08)" strokeWidth="0.5" />
                            </pattern>
                            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <rect width="100" height="100" fill="url(#smallGrid)" />
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(147, 51, 234, 0.15)" strokeWidth="0.8" />
                            </pattern>
                        </defs>
                        <rect x={PADDING} y={PADDING} width={PLOT_SIZE} height={PLOT_SIZE} fill="url(#grid)" />

                        {/* Search radius circle */}
                        <circle
                            cx={CENTER_X}
                            cy={CENTER_Y}
                            r={PLOT_SIZE / 2}
                            fill="none"
                            stroke="rgba(147, 51, 234, 0.3)"
                            strokeDasharray="5,5"
                            strokeWidth="1.5"
                        />

                        {/* X-axis (RA) */}
                        <line 
                            x1={PADDING} 
                            y1={CENTER_Y} 
                            x2={SVG_SIZE - PADDING} 
                            y2={CENTER_Y} 
                            stroke="rgb(147, 51, 234)" 
                            strokeWidth="2"
                        />
                        
                        {/* Y-axis (Dec) */}
                        <line 
                            x1={CENTER_X} 
                            y1={PADDING} 
                            x2={CENTER_X} 
                            y2={SVG_SIZE - PADDING} 
                            stroke="rgb(147, 51, 234)" 
                            strokeWidth="2"
                        />

                        {/* X-axis ticks and labels */}
                        {[-1, 1].map((tick) => {
                            const x = CENTER_X + (tick * PLOT_SIZE / 2);
                            if (x < PADDING || x > SVG_SIZE - PADDING) return null;
                            return (
                                <g key={`x-${tick}`}>
                                    <line x1={x} y1={CENTER_Y - 5} x2={x} y2={CENTER_Y + 5} stroke="rgb(147, 51, 234)" strokeWidth="1.5" />
                                    <text x={x} y={CENTER_Y + 18} fill="rgb(147, 51, 234)" fontSize="12" fontWeight="600" textAnchor="middle">
                                        {`${tick > 0 ? '+' : ''}${(tick * center.radius).toFixed(1)}°`}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Y-axis ticks and labels */}
                        {[-1, 1].map((tick) => {
                            const y = CENTER_Y - (tick * PLOT_SIZE / 2);
                            if (y < PADDING || y > SVG_SIZE - PADDING) return null;
                            return (
                                <g key={`y-${tick}`}>
                                    <line x1={CENTER_X - 5} y1={y} x2={CENTER_X + 5} y2={y} stroke="rgb(147, 51, 234)" strokeWidth="1.5" />
                                    <text x={CENTER_X - 15} y={y + 4} fill="rgb(147, 51, 234)" fontSize="12" fontWeight="600" textAnchor="end">
                                        {`${tick > 0 ? '+' : ''}${(tick * center.radius).toFixed(1)}°`}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Axis labels */}
                        <text x={SVG_SIZE - PADDING + 5} y={CENTER_Y - 10} fill="rgb(147, 51, 234)" fontSize="14" fontWeight="700">
                            RA
                        </text>
                        <text x={CENTER_X + 5} y={PADDING - 10} fill="rgb(147, 51, 234)" fontSize="14" fontWeight="700">
                            Dec
                        </text>

                        {/* Center point */}
                        <circle cx={CENTER_X} cy={CENTER_Y} r={3} fill="rgb(147, 51, 234)" opacity="0.8" />
                        {points.map((point, idx) => (
                            <circle
                                key={idx}
                                cx={point.x}
                                cy={point.y}
                                r={hoveredPoint === point ? 5 : 3}
                                fill={colors[point.type] || '#999999'}
                                opacity={hoveredPoint === point ? 1 : 0.7}
                                onClick={() => onPointClick(point.original)}
                                onMouseEnter={() => setHoveredPoint(point)}
                                onMouseLeave={() => setHoveredPoint(null)}
                                style={{ cursor: 'pointer', transition: 'r 0.1s' }}
                            />
                        ))}

                    </svg>

                    {/* Tooltip */}
                    {hoveredPoint && (
                        <div
                            className="absolute bg-black/95 p-2 rounded border border-purple-800/50 text-xs text-white pointer-events-none z-10 whitespace-nowrap"
                            style={{
                                left: `${hoveredPoint.x - PADDING + 20}px`,
                                top: `${hoveredPoint.y - PADDING - 60}px`,
                            }}
                        >
                            <p className="font-semibold">{hoveredPoint.name}</p>
                            <p className="text-gray-300">{hoveredPoint.type}</p>
                            {hoveredPoint.mag !== null && <p className="text-gray-400">Mag: {hoveredPoint.mag}</p>}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
                Click on a point to select it | Visible: {points.length}/{results.length}
            </p>
        </div>
    );
};

export default ScatterPlot;
