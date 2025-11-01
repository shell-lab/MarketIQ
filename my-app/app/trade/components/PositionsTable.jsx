"use client";

import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function PositionsTable({ openPositions, watchlist, handleToggleWatchlist }) {
  const renderPositions = () => {
    if (openPositions.length === 0) {
        return <tr><td colSpan="9" className="text-center py-4 text-gray-500">No open positions.</td></tr>;
    }

    return openPositions.map(pos => {
        const pnlClass = pos.pnl >= 0 ? 'text-green-400' : 'text-red-400';
        return (
            <tr key={pos.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-2 px-3">
                    <FiStar
                        className={`cursor-pointer ${watchlist.includes(pos.symbol) ? 'text-yellow-500' : 'text-gray-500'}`}
                        onClick={() => handleToggleWatchlist(pos.symbol)}
                    />
                </td>
                <td className="py-2 px-3">{pos.id}</td>
                <td className="py-2 px-3 font-medium">{pos.symbol}</td>
                <td className={`py-2 px-3 ${pos.side === 'Buy' ? 'text-blue-400' : 'text-orange-400'}`}>{pos.side}</td>
                <td className="py-2 px-3">{pos.volume}</td>
                <td className="py-2 px-3">{pos.openPrice}</td>
                <td className="py-2 px-3">{pos.sl || 'N/A'}</td>
                <td className="py-2 px-3">{pos.tp || 'N/A'}</td>
                <td className={`py-2 px-3 font-medium ${pnlClass}`}>{pos.pnl.toFixed(2)}</td>
            </tr>
        );
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Open Positions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-3"></th>
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3">Symbol</th>
              <th className="py-3 px-3">Side</th>
              <th className="py-3 px-3">Volume</th>
              <th className="py-3 px-3">Open Price</th>
              <th className="py-3 px-3">SL</th>
              <th className="py-3 px-3">TP</th>
              <th className="py-3 px-3">P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {renderPositions()}
          </tbody>
        </table>
      </div>
    </div>
  );
}