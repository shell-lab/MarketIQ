"use client";

import React from 'react';

export default function Watchlist({ watchlist, setCurrentSymbol, handleToggleWatchlist }) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Watchlist</h3>
      <div className="flex flex-wrap gap-2">
        {watchlist.length === 0 && <div className="text-sm text-gray-500">No symbols in watchlist</div>}
        {watchlist.map((sym) => (
          <div key={sym} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <button onClick={() => setCurrentSymbol(sym)} className="text-sm font-medium text-gray-800 hover:text-blue-600">{sym}</button>
            <button onClick={() => handleToggleWatchlist(sym)} className="text-xs text-red-500 hover:text-red-700">x</button>
          </div>
        ))}
      </div>
    </div>
  );
}