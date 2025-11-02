"use client";

import { FaBriefcase } from 'react-icons/fa';

export default function DemoTradePortfolio({ portfolio, history }) {
  if (!portfolio) {
    return <div>Loading portfolio...</div>;
  }

  const { cash, holdings } = portfolio;

  const calculateTotalValue = () => {
    if (!holdings || holdings.length === 0) {
      return cash;
    }
    const holdingsValue = holdings.reduce((acc, holding) => {
      return acc + (holding.currentPrice * holding.shares);
    }, 0);
    return cash + holdingsValue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center mb-4">
        <FaBriefcase className="text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-900 ml-2">My Demo Portfolio</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Cash</p>
          <p className="text-2xl font-semibold text-gray-900">${cash.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-semibold text-gray-900">${calculateTotalValue().toFixed(2)}</p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Holdings</h3>
        <div className="space-y-2">
          {holdings && holdings.length > 0 ? (
            holdings.map((holding) => (
              <div key={holding.symbol} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100">
                <div>
                  <p className="font-bold text-gray-900">{holding.symbol}</p>
                  <p className="text-sm text-gray-500">{holding.shares} shares</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${(holding.currentPrice * holding.shares).toFixed(2)}</p>
                  <p className={`text-sm ${holding.currentPrice >= holding.purchasePrice ? 'text-green-600' : 'text-red-600'}`}>
                    ${holding.currentPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You have no holdings.</p>
          )}
        </div>
      </div>
    </div>
  );
}
