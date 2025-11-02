"use client";
import { useEffect, useState } from "react";
import { FiStar } from 'react-icons/fi';
import { GoArrowUpRight, GoArrowDownRight } from 'react-icons/go';

export default function Watchlist({ searchQuery, selectedStock, setSelectedStock, watchlist = [], loading = false, toggleWatchlist }) {
  const [watchlistDetails, setWatchlistDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (watchlist.length > 0) {
        setLoadingDetails(true);
        try {
          const symbols = watchlist.map(w => w.symbol);
          const res = await fetch('/api/watchlist/prices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbols }),
          });

          if (!res.ok) {
            throw new Error('Failed to fetch watchlist prices');
          }

          const data = await res.json();
          // data is a map { SYMBOL: { price, change, changePercent, name, up } }
          const details = symbols.map(sym => data[sym] || null).filter(Boolean);
          setWatchlistDetails(details);
        } catch (error) {
          console.error("Error fetching watchlist details:", error);
          setWatchlistDetails([]);
        } finally {
          setLoadingDetails(false);
        }
      } else {
        setWatchlistDetails([]);
      }
    };

    fetchWatchlistDetails();
    const interval = setInterval(fetchWatchlistDetails, 30000); // Optimized to 30s
    return () => clearInterval(interval);
  }, [watchlist]);

  const handleSelectStock = (stock) => {
    setSelectedStock({ '1. symbol': stock.symbol, '2. name': stock.name });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-4">
        <FiStar className="text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900 ml-2">My Watchlist</h2>
      </div>
      <div className="space-y-2">
        {loading || loadingDetails ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : watchlistDetails.length > 0 ? (
          watchlistDetails.map((stock) => (
            <div
              key={stock.symbol}
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${selectedStock && selectedStock['1. symbol'] === stock.symbol ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleSelectStock(stock)}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWatchlist && toggleWatchlist(stock.symbol); }}
                  aria-label={"Remove from watchlist"}
                  className="transition-transform hover:scale-110 text-yellow-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.184c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.974c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.853 2.664c-.785.57-1.84-.197-1.54-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.237 9.401c-.783-.57-.38-1.81.588-1.81h4.184a1 1 0 00.95-.69l1.286-3.974z" />
                  </svg>
                </button>
                <div>
                  <p className="font-bold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-500">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${stock.price}</p>
                <div className={`flex items-center justify-end text-sm ${stock.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.up ? <GoArrowUpRight /> : <GoArrowDownRight />}
                  <span className="font-medium ml-1">{stock.change} ({stock.changePercent}%)</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Your watchlist is empty.</p>
        )}
      </div>
    </div>
  );
}
