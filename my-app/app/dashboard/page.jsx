// File: app/dashboard/page.jsx
// This is a React component. Per your instructions, it's in a C++ block.

"use client";

import { useState } from 'react';
// Import icons
import { FiSearch, FiStar } from 'react-icons/fi';
import { GoArrowUpRight, GoArrowDownRight } from 'react-icons/go';

// Main Dashboard Component
export default function DashboardPage() {
  // State to manage the active tab (Stock Profile, Analysis, News)
  const [activeTab, setActiveTab] = useState('Stock Profile');

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
          <SearchBar />

          {/* --- Market Overview --- */}
          <MarketOverview />

          {/* --- Stock Details Section --- */}
          <StockDetails activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* --- Price Chart --- */}
          <PriceChart />

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
            <Watchlist />

            {/* --- Trending Stocks --- */}
            <TrendingStocks />

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
function SearchBar() {
  return (
    <div className="relative">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search stocks by ticker or company name (e.g., AAPL, Apple)..."
        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
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
function StockDetails({ activeTab, setActiveTab }) {
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
function PriceChart() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Chart</h2>
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-gray-500">
          A line chart (e.g., using Chart.js or Recharts) would be embedded here.
        </p>
      </div>
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
function Watchlist() {
  // Data would come from an API or user's database
  const stocks = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '$178.45', change: '+1.33%', up: true },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', price: '$142.87', change: '-0.85%', up: false },
    { ticker: 'MSFT', name: 'Microsoft', price: '$412.34', change: '+1.39%', up: true },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-4">
        <FiStar className="text-yellow-500" />
        <h2 className="text-xl font-semibold text-gray-900 ml-2">My Watchlist</h2>
      </div>
      <div className="space-y-4">
        {stocks.map((stock) => (
          <div key={stock.ticker} className="flex justify-between items-center">
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
        ))}
      </div>
    </div>
  );
}

// --- Trending Stocks Component ---
function TrendingStocks() {
  // Data would come from an API
  const stocks = [
    { ticker: 'NVDA', name: 'NVIDIA Corp', price: '$875.28', change: '+1.44%', up: true },
    { ticker: 'META', name: 'Meta Platforms', price: '$512.45', change: '+1.63%', up: true },
    { ticker: 'MSFT', name: 'Microsoft', price: '$412.34', change: '+1.39%', up: true },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: '$242.84', change: '-1.84%', up: false },
    { ticker: 'AMZN', name: 'Amazon.com', price: '$178.25', change: '+1.78%', up: true },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Stocks</h2>
      <div className="space-y-4">
        {stocks.map((stock) => (
          <div key={stock.ticker} className="flex justify-between items-center">
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
        ))}
      </div>
    </div>
  );
}