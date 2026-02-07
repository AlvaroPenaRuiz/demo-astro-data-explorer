import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import type { SearchCenter, AstronomicalObject } from '../types/search';
import ScatterPlot from './ScatterPlot';
import Stats from './Stats';
import { mapTypeLabel } from '../utils/typeMapper';

interface LocationState {
    center: SearchCenter;
    count: number;
    results: AstronomicalObject[];
    queryTime?: number;
}

const ITEMS_PER_PAGE = 10;

const SearchResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState | null;
    const [center] = useState<SearchCenter | null>(() => state?.center || null);
    const [queryTime] = useState<number | undefined>(() => state?.queryTime);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterType, setFilterType] = useState<string>('');
    const [filterRaMin, setFilterRaMin] = useState<string>('');
    const [filterRaMax, setFilterRaMax] = useState<string>('');
    const [filterDecMin, setFilterDecMin] = useState<string>('');
    const [filterDecMax, setFilterDecMax] = useState<string>('');
    const [filterMagMin, setFilterMagMin] = useState<string>('');
    const [filterMagMax, setFilterMagMax] = useState<string>('');
    const [showScatterPlot, setShowScatterPlot] = useState(false);

    const { count = 0, results = [] } = state || {};

    const filteredAndSorted = useMemo(() => {
        let filtered = [...results];

        if (filterType) {
            filtered = filtered.filter(obj => mapTypeLabel(obj.type) === filterType);
        }

        if (filterRaMin) {
            const min = parseFloat(filterRaMin);
            filtered = filtered.filter(obj => (obj.ra_deg || 0) >= min);
        }

        if (filterRaMax) {
            const max = parseFloat(filterRaMax);
            filtered = filtered.filter(obj => (obj.ra_deg || 0) <= max);
        }

        if (filterDecMin) {
            const min = parseFloat(filterDecMin);
            filtered = filtered.filter(obj => (obj.dec_deg || 0) >= min);
        }

        if (filterDecMax) {
            const max = parseFloat(filterDecMax);
            filtered = filtered.filter(obj => (obj.dec_deg || 0) <= max);
        }

        if (filterMagMin) {
            const min = parseFloat(filterMagMin);
            filtered = filtered.filter(obj => obj.mag_v !== undefined && obj.mag_v !== null && obj.mag_v !== '' && parseFloat(obj.mag_v) >= min);
        }

        if (filterMagMax) {
            const max = parseFloat(filterMagMax);
            filtered = filtered.filter(obj => obj.mag_v !== undefined && obj.mag_v !== null && obj.mag_v !== '' && parseFloat(obj.mag_v) <= max);
        }

        if (sortBy) {
            filtered.sort((a, b) => {
                let aVal: any = a[sortBy as keyof AstronomicalObject];
                let bVal: any = b[sortBy as keyof AstronomicalObject];

                if (aVal === undefined || aVal === null) aVal = '';
                if (bVal === undefined || bVal === null) bVal = '';

                const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return sortOrder === 'asc' ? comparison : -comparison;
            });
        }
        return filtered;
    }, [results, filterType, filterRaMin, filterRaMax, filterDecMin, filterDecMax, filterMagMin, filterMagMax, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResults = filteredAndSorted.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const uniqueTypes = Array.from(new Set(results.map(obj => mapTypeLabel(obj.type)))).sort();

    return (
        <div className="w-full lg:w-3/4 mx-auto mt-12 mb-12">
            <div className="bg-black/30 p-8 rounded-lg shadow-lg shadow-purple-800/20 mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl text-center flex-1">Search Parameters</h2>
                    {queryTime !== undefined && (
                        <div className="text-sm text-gray-400">Query time: <span className="text-purple-400 font-semibold">{(queryTime / 1000).toFixed(2)}</span> s</div>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <p className="text-gray-400">Right Ascension</p>
                        <p className="text-white font-semibold">{center?.ra.toFixed(4)}°</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Declination</p>
                        <p className="text-white font-semibold">{center?.dec.toFixed(4)}°</p>
                    </div>
                    <div>
                        <p className="text-gray-400">Radius</p>
                        <p className="text-white font-semibold">{center?.radius.toFixed(2)}°</p>
                    </div>
                </div>
                <div className="flex gap-x-4 justify-center mt-8">
                    <button 
                        onClick={() => navigate('/', { state: { initialRa: center?.ra, initialDec: center?.dec, initialRadius: center?.radius } })}
                        className="shadow shadow-white/20 bg-purple-800/30 py-2 px-6 rounded-sm hover:scale-104 transition-transform"
                    >
                        ← Modify Search
                    </button>
                    <button 
                        onClick={() => {
                            const url = `${window.location.origin}/api/search/?ra=${center?.ra}&dec=${center?.dec}&radius=${center?.radius}`;
                            navigator.clipboard.writeText(url);
                        }}
                        className="shadow shadow-white/20 bg-purple-800/30 py-2 px-6 rounded-sm hover:scale-104 transition-transform text-sm"
                    >
                        📋 Copy API URL
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="shadow shadow-white/20 bg-purple-800/30 py-2 px-6 rounded-sm hover:scale-104 transition-transform"
                    >
                        New Search
                    </button>
                </div>
            </div>

            <div className="bg-black/30 p-8 rounded-lg shadow-lg shadow-purple-800/20">
                <p className="text-gray-400 text-sm mb-6">Found {filteredAndSorted.length} objects</p>
                <div className="grid grid-cols-7 gap-3 mb-6 text-sm">
                    <div>
                        <label className="text-gray-400 block mb-1">Filter by Type</label>
                        <select 
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        >
                            <option value="">All Types</option>
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-400 block mb-1">RA Min</label>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={filterRaMin}
                            onChange={(e) => {
                                setFilterRaMin(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="0"
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 block mb-1">RA Max</label>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={filterRaMax}
                            onChange={(e) => {
                                setFilterRaMax(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="360"
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 block mb-1">Dec Min</label>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={filterDecMin}
                            onChange={(e) => {
                                setFilterDecMin(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="-90"
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 block mb-1">Dec Max</label>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={filterDecMax}
                            onChange={(e) => {
                                setFilterDecMax(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="90"
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 block mb-1">Mag Min</label>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={filterMagMin}
                            onChange={(e) => {
                                setFilterMagMin(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="0"
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 block mb-1">Mag Max</label>
                        <input 
                            type="text"
                            inputMode="decimal"
                            value={filterMagMax}
                            onChange={(e) => {
                                setFilterMagMax(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="50"
                            className="w-full bg-gray-800/50 border border-purple-800/30 rounded px-2 py-1 text-white text-xs"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => {
                            setFilterType('');
                            setFilterRaMin('');
                            setFilterRaMax('');
                            setFilterMagMin('');
                            setFilterMagMax('');
                            setFilterDecMin('');
                            setFilterDecMax('');
                            setSortBy('');
                            setSortOrder('asc');
                            setCurrentPage(1);
                        }}
                        className="text-sm px-4 py-1 bg-purple-800/30 border border-purple-800/30 rounded hover:border-purple-800/60 transition-colors"
                    >
                        Clear Filters
                    </button>
                    <button
                        onClick={() => setShowScatterPlot(!showScatterPlot)}
                        className="text-sm px-4 py-1 bg-purple-800/30 border border-purple-800/30 rounded hover:border-purple-800/60 transition-colors"
                    >
                        {showScatterPlot ? 'Hide Plot' : 'Show Plot'}
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-purple-800/30">
                                <th 
                                    onClick={() => handleSort('name')}
                                    className="text-left py-3 px-4 text-gray-400 cursor-pointer hover:text-gray-300"
                                >
                                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    onClick={() => handleSort('type')}
                                    className="text-left py-3 px-4 text-gray-400 cursor-pointer hover:text-gray-300"
                                >
                                    Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    onClick={() => handleSort('ra_deg')}
                                    className="text-left py-3 px-4 text-gray-400 cursor-pointer hover:text-gray-300"
                                >
                                    RA (°) {sortBy === 'ra_deg' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    onClick={() => handleSort('dec_deg')}
                                    className="text-left py-3 px-4 text-gray-400 cursor-pointer hover:text-gray-300"
                                >
                                    Dec (°) {sortBy === 'dec_deg' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    onClick={() => handleSort('mag_v')}
                                    className="text-left py-3 px-4 text-gray-400 cursor-pointer hover:text-gray-300"
                                >
                                    Magnitude {sortBy === 'mag_v' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 px-4 text-center text-gray-400">
                                        No objects found with the current filters
                                    </td>
                                </tr>
                            ) : (
                                paginatedResults.map((obj, i) => (
                                    <tr 
                                        key={obj.name} 
                                        data-object-name={obj.name}
                                        className="border-b border-purple-800/20 hover:bg-purple-800/10 transition-colors"
                                    >
                                        <td className="py-3 px-4 text-white">{obj.name}</td>
                                        <td className="py-3 px-4 text-gray-400">{mapTypeLabel(obj.type)}</td>
                                        <td className="py-3 px-4 text-gray-400">{obj.ra_deg?.toFixed(4) || '-'}</td>
                                        <td className="py-3 px-4 text-gray-400">{obj.dec_deg?.toFixed(4) || '-'}</td>
                                        <td className="py-3 px-4 text-gray-400">{obj.mag_v?.toFixed(2) || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && paginatedResults.length > 0 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-purple-800/30 border border-purple-800/30 rounded-sm hover:border-purple-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>
                        <span className="flex items-center px-4 text-gray-400">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-purple-800/30 border border-purple-800/30 rounded-sm hover:border-purple-800/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {showScatterPlot && (
                    <>
                        <ScatterPlot 
                            center={center} 
                            results={filteredAndSorted} 
                            onPointClick={(obj) => {
                                // Find row more efficiently by scrolling to first occurrence
                                const rows = document.querySelectorAll('[data-object-name]');
                                const targetRow = Array.from(rows).find(row => 
                                    row.getAttribute('data-object-name') === obj.name
                                ) as HTMLElement | undefined;
                                
                                if (targetRow) {
                                    targetRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                    targetRow.classList.add('bg-purple-800/30');
                                    setTimeout(() => targetRow.classList.remove('bg-purple-800/30'), 2000);
                                }
                            }}
                        />
                        <Stats center={center} results={filteredAndSorted} />
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResult;