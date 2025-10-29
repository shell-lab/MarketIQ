'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiStar } from 'react-icons/fi';

export default function TopGainers() {
  const [topGainers, setTopGainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist');
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data.map((item) => item.symbol));
      } else {
        console.error("Failed to fetch watchlist");
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  useEffect(() => {
    const fetchTopGainers = async () => {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
        const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        setTopGainers(data.top_gainers || []);
      } catch (error) {
        console.error("Error fetching top gainers:", error);
      }
      setLoading(false);
    };

    fetchTopGainers();
    fetchWatchlist();
  }, []);

  const handleAddToWatchlist = async (ticker) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: ticker }),
      });
      if (response.ok) {
        fetchWatchlist();
      } else {
        console.error("Failed to add to watchlist");
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Market-IQ</div>
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4">Home</Link>
          <Link href="/top-gainers" className="mr-4">Top Gainers</Link>
          <Link href="/top-losers" className="mr-4">Top Losers</Link>
          <Link href="/contact" className="mr-4">Contact Us</Link>
        </div>
      </nav>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">Top Gainers</h1>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 rounded-lg">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ticker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Change %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {topGainers.map((stock) => (
                  <tr key={stock.ticker}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      <FiStar
                        className={`cursor-pointer ${
                          watchlist.includes(stock.ticker) ? 'text-yellow-500' : 'text-gray-500'
                        }`}
                        onClick={() => handleAddToWatchlist(stock.ticker)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{stock.ticker}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${stock.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{stock.change_amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{stock.change_percentage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{stock.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}