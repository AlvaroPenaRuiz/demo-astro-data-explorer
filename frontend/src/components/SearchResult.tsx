import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import type { SearchCenter, AstronomicalObject } from '../types/search';

interface LocationState {
    center: SearchCenter;
    count: number;
    results: AstronomicalObject[];
}

const ITEMS_PER_PAGE = 10;

const SearchResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;
    const [center] = useState<SearchCenter | null>(() => state?.center || null);
    const [currentPage, setCurrentPage] = useState(1);

    const { count = 0, results = [] } = state || {};
    const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResults = results.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return (
        <div className="w-full lg:w-3/4 mx-auto mt-12 mb-12">
            <div className="bg-black/30 p-8 rounded-lg shadow-lg shadow-purple-800/20 mb-12">
                <h2 className="text-2xl text-center mb-6">Search Parameters</h2>
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
                        onClick={() => navigate('/')}
                        className="shadow shadow-white/20 bg-purple-800/30 py-2 px-6 rounded-sm hover:scale-104 transition-transform"
                    >
                        New Search
                    </button>
                </div>
            </div>

            <div className="bg-black/30 p-8 rounded-lg shadow-lg shadow-purple-800/20">
                <p className="text-gray-400 text-sm mb-6">Found {count} objects</p>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-purple-800/30">
                                <th className="text-left py-3 px-4 text-gray-400">Name</th>
                                <th className="text-left py-3 px-4 text-gray-400">Type</th>
                                <th className="text-left py-3 px-4 text-gray-400">RA (°)</th>
                                <th className="text-left py-3 px-4 text-gray-400">Dec (°)</th>
                                <th className="text-left py-3 px-4 text-gray-400">Magnitude</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((obj, i) => (
                                <tr key={i} className="border-b border-purple-800/20 hover:bg-purple-800/10 transition-colors">
                                    <td className="py-3 px-4 text-white">{obj.name}</td>
                                    <td className="py-3 px-4 text-gray-400">{obj.type || '-'}</td>
                                    <td className="py-3 px-4 text-gray-400">{obj.ra_deg?.toFixed(4) || '-'}</td>
                                    <td className="py-3 px-4 text-gray-400">{obj.dec_deg?.toFixed(4) || '-'}</td>
                                    <td className="py-3 px-4 text-gray-400">{obj.mag_v?.toFixed(2) || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
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
            </div>
        </div>
    );
};

export default SearchResult;