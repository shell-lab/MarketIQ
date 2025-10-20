// File: app/dashboard/page.jsx
// This is a React component. Per your instructions, it's in a C++ block.

"use client";

import { useState, useEffect } from 'react';
// Import icons
import { FiSearch, FiStar } from 'react-icons/fi';
import { GoArrowUpRight, GoArrowDownRight } from 'react-icons/go';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Main Dashboard Component
export default function DashboardPage() {
  // State to manage the active tab (Stock Profile, Analysis, News)
  const [activeTab, setActiveTab] = useState('Stock Profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto grid grid-cols-3 gap-8">
        
        {/* ============================================== */}
        {/* ============ LEFT COLUMN (Main) ============ */}
        {/* ============================================== */}
        <div className="col-span-3 lg:col-span-2 space-y-8">
          
          {/* --- Header --- */}
          <Header />

          {/* --- Search Bar --- */}
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSelectedStock={setSelectedStock} />

          {/* --- Market Overview --- */}
          <MarketOverview />

          {/* --- Stock Details Section --- */}
          <StockDetails activeTab={activeTab} setActiveTab={setActiveTab} selectedStock={selectedStock} />
          
          {/* --- Price Chart --- */}
          <PriceChart selectedStock={selectedStock} />

          {/* --- Key Statistics --- */}
          <KeyStatistics />

        </div>

        {/* ============================================== */}
        {/* ============ RIGHT COLUMN (Sidebar) ============ */}
        {/* ============================================== */}
        <div className="col-span-3 lg:col-span-1">
          {/* Sticky container to keep sidebar content in view on scroll */}
          <div className="sticky top-8 space-y-8">
            
            {/* --- My Watchlist --- */}
            <Watchlist 
              searchQuery={searchQuery} 
              selectedStock={selectedStock} 
              setSelectedStock={setSelectedStock} 
            />

            {/* --- Trending Stocks --- */}
            <TrendingStocks 
              searchQuery={searchQuery} 
              selectedStock={selectedStock} 
              setSelectedStock={setSelectedStock} 
            />

          </div>
        </div>
      </div>
    </div>
  );
}

// --- Header Component ---
function Header() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Stock Market Analyzer</h1>
      <p className="text-gray-500 mt-1">
        Real-time stock market data and analysis
      </p>
    </div>
  );
}

// --- Search Bar Component ---
function SearchBar({ searchQuery, setSearchQuery, setSelectedStock }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      if (searchQuery.length > 1) {
        setLoading(true);
        try {
          const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=L71XF51ICTA84CEG`);
          const data = await response.json();
          setSearchResults(data.bestMatches || []);
        } catch (error) {
          console.error("Error fetching stock data:", error);
          setSearchResults([]);
        }
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchStocks();
    }, 300);

    return () => clearTimeout(debounceFetch);
  }, [searchQuery]);

  const handleSelectStock = (stock) => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedStock(stock);
  };

  return (
    <div className="relative">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search stocks by ticker or company name (e.g., AAPL, Apple)..."
        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {(searchResults.length > 0 || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            searchResults.map((stock) => (
              <div
                key={stock['1. symbol']}
                className="p-4 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectStock(stock)}
              >
                <p className="font-bold text-gray-900">{stock['1. symbol']}</p>
                <p className="text-sm text-gray-500">{stock['2. name']}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// --- Market Overview Component ---
function MarketOverview() {
  // Data would come from an API
  const marketData = [
    { name: 'S&P 500', value: '5,815.03', change: '+23.45', changePercent: '+0.40', up: true },
    { name: 'Dow Jones', value: '42,863.86', change: '+134.21', changePercent: '+0.31', up: true },
    { name: 'NASDAQ', value: '18,342.94', change: '-45.89', changePercent: '-0.25', up: false },
    { name: 'Russell 2000', value: '2,238.45', change: '+8.34', changePercent: '+0.37', up: true },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketData.map((market) => (
          <div key={market.name} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">{market.name}</h3>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{market.value}</p>
            <div className={`flex items-center text-sm mt-1 ${market.up ? 'text-green-600' : 'text-red-600'}`}>
              {market.up ? <GoArrowUpRight /> : <GoArrowDownRight />}
              <span className="font-medium ml-1">{market.change} ({market.changePercent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Stock Details Component (Tabs + Profile) ---
function StockDetails({ activeTab, setActiveTab, selectedStock }) {
  const tabs = ['Stock Profile', 'Analysis', 'News'];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      {/* --- Tabs --- */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 font-medium text-sm
              ${activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- Tab Content --- */}
      <div className="p-6">
        {activeTab === 'Stock Profile' && (
          <div>
            {selectedStock ? (
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedStock['1. symbol']}</h3>
                  <span className="ml-3 text-lg text-gray-500">{selectedStock['2. name']}</span>
                </div>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  {selectedStock['8. currency']}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-gray-900">TSLA</h3>
                  <span className="ml-3 text-lg text-gray-500">Tesla Inc.</span>
                </div>
                <p className="text-gray-600 mt-4 leading-relaxed">
                  Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.
                </p>
                <div className="flex items-baseline mt-6">
                  <span className="text-4xl font-bold text-gray-900">$242.84</span>
                  <div className="flex items-center text-lg text-red-600 ml-4">
                    <GoArrowDownRight />
                    <span className="font-semibold ml-1">-4.56 (-1.84%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'Analysis' && (
          <div className="text-gray-600">Analysis content would go here...</div>
        )}
        {activeTab === 'News' && (
          <div className="text-gray-600">News articles would go here...</div>
        )}
      </div>
    </div>
  );
}

// --- Price Chart Component ---
function PriceChart({ selectedStock }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      const symbol = selectedStock ? selectedStock['1. symbol'] : 'TSLA';
      const apiKey = 'L71XF51ICTA84CEG'; // User has added their API key here.

      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`;
      console.log("Fetching chart data from:", url);

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Alpha Vantage API Response:", data);

        const timeSeries = data['Time Series (Daily)'];

        if (timeSeries) {
          const labels = Object.keys(timeSeries).slice(0, 30).reverse();
          const prices = labels.map(label => parseFloat(timeSeries[label]['4. close']));
          console.log("Processed Labels:", labels);
          console.log("Processed Prices:", prices);

          setChartData({
            labels,
            datasets: [
              {
                label: 'Price',
                data: prices,
                borderColor: '#3A86FF',
                borderWidth: 2,
                fill: true,
                backgroundColor: (context) => {
                  const chart = context.chart;
                  const {ctx, chartArea} = chart;
                  if (!chartArea) {
                    return null;
                  }
                  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                  gradient.addColorStop(0, 'rgba(58, 134, 255, 0)');
                  gradient.addColorStop(1, 'rgba(58, 134, 255, 0.3)');
                  return gradient;
                },
                pointBackgroundColor: '#3A86FF',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3A86FF',
              },
            ],
          });
        } else {
          const errorMessage = data['Information'] || data['Error Message'] || 'Could not fetch time series data.';
          console.error('API Error:', errorMessage);
          setError(errorMessage);
          setChartData({ labels: [], datasets: [] });
        }
      } catch (error) {
        console.error("Error fetching or parsing chart data:", error);
        setError('Failed to fetch chart data. See console for details.');
        setChartData({ labels: [], datasets: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedStock]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Stock Price Performance for ${selectedStock ? selectedStock['2. name'] : 'Tesla Inc.'}`,
        font: { size: 18, weight: 'bold' },
        color: '#333',
        padding: { top: 10, bottom: 30 }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#999',
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7 // Show fewer labels on the x-axis
        }
      },
      y: {
        grid: {
          color: '#f0f0f0',
          drawBorder: false,
        },
        ticks: {
          color: '#999',
          beginAtZero: false,
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 5,
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-[400px]">
      {loading ? (
        <div className="h-full flex items-center justify-center text-gray-500">Loading Chart...</div>
      ) : error ? (
        <div className="h-full flex items-center justify-center text-red-500 text-center p-4">{error}</div>
      ) : (
        chartData.labels && chartData.labels.length > 0 ? (
          <Line options={options} data={chartData} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">No data available for this stock.</div>
        )
      )}
    </div>
  );
}


// --- Key Statistics Component ---
function KeyStatistics() {
  // Data would come from an API
  const stats = [
    { label: 'Market Cap', value: '$771.28B' },
    { label: 'Volume', value: '102.4M' },
    { label: 'Day High', value: '$245.90' },
    { label: 'Day Low', value: '$240.25' },
    { label: 'Open', value: '$244.50' },
    { label: 'Prev Close', value: '$247.40' },
    { label: '52W High', value: '$279.27' },
    { label: '52W Low', value: '$206.41' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-500">{stat.label}</h4>
          <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// --- Watchlist Component ---
function Watchlist({ searchQuery, selectedStock, setSelectedStock }) {
  // Data would come from an API or user's database
  const stocks = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '$178.45', change: '+1.33%', up: true },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$142.87', change: '-0.85%', up: false },
    { ticker: 'MSFT', name: 'Microsoft', price: '$412.34', change: '+1.39%', up: true },
  ];

  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStock = (stock) => {
    setSelectedStock({ '1. symbol': stock.ticker, '2. name': stock.name });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-4">
        <FiStar className="text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900 ml-2">My Watchlist</h2>
      </div>
      <div className="space-y-2">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <div 
              key={stock.ticker} 
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${selectedStock && selectedStock['1. symbol'] === stock.ticker ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleSelectStock(stock)}
            >
              <div>
                <p className="font-bold text-gray-900">{stock.ticker}</p>
                <p className="text-sm text-gray-500">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{stock.price}</p>
                <div className={`flex items-center justify-end text-sm ${stock.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.up ? <GoArrowUpRight /> : <GoArrowDownRight />}
                  <span className="font-medium ml-1">{stock.change}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}

// --- Trending Stocks Component ---
function TrendingStocks({ searchQuery, selectedStock, setSelectedStock }) {
  // Data would come from an API
  const stocks = [
    { ticker: 'NVDA', name: 'NVIDIA Corp', price: '$875.28', change: '+1.44%', up: true },
    { ticker: 'META', name: 'Meta Platforms', price: '$512.45', change: '+1.63%', up: true },
    { ticker: 'MSFT', name: 'Microsoft', price: '$412.34', change: '+1.39%', up: true },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: '$242.84', change: '-1.84%', up: false },
    { ticker: 'AMZN', name: 'Amazon.com', price: '$178.25', change: '+1.78%', up: true },
  ];

  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectStock = (stock) => {
    setSelectedStock({ '1. symbol': stock.ticker, '2. name': stock.name });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Stocks</h2>
      <div className="space-y-2">
        {filteredStocks.length > 0 ? (
          filteredStocks.map((stock) => (
            <div 
              key={stock.ticker} 
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${selectedStock && selectedStock['1. symbol'] === stock.ticker ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => handleSelectStock(stock)}
            >
              <div>
                <p className="font-bold text-gray-900">{stock.ticker}</p>
                <p className="text-sm text-gray-500">{stock.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{stock.price}</p>
                <div className={`flex items-center justify-end text-sm ${stock.up ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.up ? <GoArrowUpRight /> : <GoArrowDownRight />}
                  <span className="font-medium ml-1">{stock.change}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}