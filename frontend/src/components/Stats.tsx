import type { AstronomicalObject, SearchCenter } from '../types/search';
import { mapTypeLabel } from '../utils/typeMapper';

interface StatsProps {
    center: SearchCenter | null;
    results: AstronomicalObject[];
}

const Stats = ({ center, results }: StatsProps) => {
    if (!center || results.length === 0) return null;

    const density = results.length / (Math.PI * center.radius * center.radius);

    // Get top 5 types by frequency
    const typeFrequency: Record<string, number> = {};
    results.forEach((obj) => {
        const typeLabel = mapTypeLabel(obj.type);
        typeFrequency[typeLabel] = (typeFrequency[typeLabel] || 0) + 1;
    });

    const topTypes = Object.entries(typeFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    return (
        <div className="mt-6 bg-black/30 p-6 rounded-lg shadow-lg shadow-purple-800/20">
            <h3 className="text-xl mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                    <p className="text-gray-400">Objects Found</p>
                    <p className="text-2xl text-purple-400 font-semibold">{results.length}</p>
                </div>
                <div>
                    <p className="text-gray-400">Density</p>
                    <p className="text-2xl text-purple-400 font-semibold">{density.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">/deg²</p>
                </div>
            </div>

            <div className="mt-6">
                <p className="text-gray-400 mb-3">Top Types</p>
                <div className="space-y-2">
                    {topTypes.map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">{type}</span>
                            <div className="flex items-center gap-2">
                                <div className="w-24 bg-purple-800/20 rounded h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded"
                                        style={{ width: `${(count / results.length) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-purple-400 font-semibold w-8 text-right">{count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Stats;
