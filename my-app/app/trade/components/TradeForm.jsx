
"use client";

import React from 'react';

export default function TradeForm({
  lots,
  setLots,
  takeProfit,
  setTakeProfit,
  stopLoss,
  setStopLoss,
  placeTrade,
  currentSymbol,
}) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">{currentSymbol}</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="lots-input" className="block text-sm font-medium text-gray-600 mb-1">
            Volume (Lots)
          </label>
          <input
            type="number"
            id="lots-input"
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            step="0.01"
            min="0.01"
            className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="tp-input" className="block text-sm font-medium text-gray-600 mb-1">
            Take Profit (Price)
          </label>
          <input
            type="number"
            id="tp-input"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="Not set"
            className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="sl-input" className="block text-sm font-medium text-gray-600 mb-1">
            Stop Loss (Price)
          </label>
          <input
            type="number"
            id="sl-input"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="Not set"
            className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => placeTrade('sell')}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            SELL
          </button>
          <button
            onClick={() => placeTrade('buy')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            BUY
          </button>
        </div>
      </div>
    </div>
  );
}
