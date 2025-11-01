"use client";

import React from 'react';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  searchLoading,
  searchResults,
  setCurrentSymbol,
  setSearchResults,
  handleToggleWatchlist,
  DEMO_MODE,
}) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Search Symbol</h3>
        <div className="relative">
            <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search (e.g. AAPL, TSLA)..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {searchLoading && <div className="absolute right-3 top-3 text-xs text-gray-500">...</div>}
        </div>
        {searchResults.length > 0 && (
            <div className="mt-2 max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            {searchResults.map((s) => {
                const sym = DEMO_MODE ? s.symbol : s['1. symbol'];
                const name = DEMO_MODE ? s.name : s['2. name'];
                return (
                <div
                    key={sym}
                    className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b border-gray-100"
                    onClick={() => {
                    setCurrentSymbol(sym);
                    setSearchResults([]);
                    setSearchQuery('');
                    }}
                >
                    <div>
                    <div className="font-medium text-gray-800">{sym}</div>
                    <div className="text-xs text-gray-500">{name}</div>
                    </div>
                    <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleToggleWatchlist(sym);
                    }}
                    className="ml-4 text-blue-500 hover:text-blue-700 text-sm"
                    >
                    + Watchlist
                    </button>
                </div>
                );
            })}
            </div>
        )}
    </div>
  );
}