"use client";

import React from 'react';

export default function Portfolio({ demoPortfolio, setCurrentSymbol }) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">Demo Portfolio</h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Cash</p>
          <p className="text-2xl font-semibold text-gray-800">${Number(demoPortfolio.cash).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Holdings</p>
          {(!demoPortfolio.holdings || Object.keys(demoPortfolio.holdings).length === 0) && (
            <p className="text-sm text-gray-500 mt-2">No holdings</p>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {demoPortfolio.holdings &&
              Object.entries(demoPortfolio.holdings).map(([sym, qty]) => (
                <div key={sym} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                  <button onClick={() => setCurrentSymbol(sym)} className="text-sm font-medium text-gray-800 hover:text-blue-600">{sym}</button>
                  <span className="text-sm text-gray-500">x{qty}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}