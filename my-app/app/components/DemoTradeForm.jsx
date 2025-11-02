
"use client";

import React, { useState } from 'react';

export default function DemoTradeForm({ onTrade }) {
  const [symbol, setSymbol] = useState('TSLA');
  const [quantity, setQuantity] = useState(1);
  const [side, setSide] = useState('buy');

  const handleSubmit = (e) => {
    e.preventDefault();
    onTrade({ symbol, quantity, side });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Place a Demo Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symbol-input" className="block text-sm font-medium text-gray-600 mb-1">
            Symbol
          </label>
          <input
            type="text"
            id="symbol-input"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-600 mb-1">
            Quantity
          </label>
          <input
            type="number"
            id="quantity-input"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            min="1"
            className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="side-select" className="block text-sm font-medium text-gray-600 mb-1">
            Side
          </label>
          <select
            id="side-select"
            value={side}
            onChange={(e) => setSide(e.target.value)}
            className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          Place Trade
        </button>
      </form>
    </div>
  );
}
