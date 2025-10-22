"use client";

import { useState, useEffect } from 'react';
// Import icons
import { FiSearch, FiStar } from 'react-icons/fi';
import { GoArrowUpRight, GoArrowDownRight } from 'react-icons/go';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('Stock Profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchStockDetails = async () => {
      if (selectedStock) {
        console.log('Fetching details for:', selectedStock);
        setLoadingDetails(true);
        try {
          const symbol = selectedStock['1. symbol'];
const apiKey = 'E4W85A2W5Q6Q8Q7Q';
          const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

          console.log('Quote URL:', quoteUrl);
          console.log('Overview URL:', overviewUrl);

          const [quoteResponse, overviewResponse] = await Promise.all([
            fetch(quoteUrl),
            fetch(overviewUrl),
          ]);

          const quoteData = await quoteResponse.json();
          const overviewData = await overviewResponse.json();

          console.log('Quote API Response:', quoteData);
          console.log('Overview API Response:', overviewData);

          const combinedDetails = { ...quoteData['Global Quote'], ...overviewData };
          console.log('Combined Details:', combinedDetails);

          setStockDetails(combinedDetails);
        } catch (error) {
          console.error("Error fetching stock details:", error);
          setStockDetails(null); // Clear details on error
        }
        setLoadingDetails(false);
      }
    };

    fetchStockDetails();
  }, [selectedStock]);


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
          <StockDetails activeTab={activeTab} setActiveTab={setActiveTab} selectedStock={selectedStock} stockDetails={stockDetails} loading={loadingDetails} />
          
          {/* --- Price Chart --- */}
          <PriceChart selectedStock={selectedStock} />

          {/* --- Key Statistics --- */}
          <KeyStatistics stockDetails={stockDetails} loading={loadingDetails} />

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
          const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=E4W85A2W5Q6Q8Q7Q`);
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
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      const symbols = ['SPY', 'DIA', 'QQQ', 'IWM'];
      const names = {
        SPY: 'S&P 500',
        DIA: 'Dow Jones',
        QQQ: 'NASDAQ',
        IWM: 'Russell 2000',
      };
      const apiKey = 'E4W85A2W5Q6Q8Q7Q';
      const requests = symbols.map(symbol =>
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
          .then(res => res.json())
      );

      try {
        const results = await Promise.all(requests);
        const data = results.map((result, index) => {
          const quote = result['Global Quote'];
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
          return {
            name: names[symbols[index]],
            value: parseFloat(quote['05. price']).toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            up: change >= 0,
          };
        });
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
function StockDetails({ activeTab, setActiveTab, selectedStock, stockDetails, loading }) {
  const tabs = ['Stock Profile', 'Analysis', 'News'];

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-8">Loading stock details...</div>;
    }

    if (selectedStock && stockDetails && stockDetails.Symbol) {
      const price = parseFloat(stockDetails['05. price']);
      const change = parseFloat(stockDetails['09. change']);
      const changePercent = stockDetails['10. change percent'];
      const isPositive = change >= 0;

      return (
        <div>
          <div className="flex items-center">
            <h3 className="text-2xl font-bold text-gray-900">{stockDetails.Symbol}</h3>
            <span className="ml-3 text-lg text-gray-500">{stockDetails.Name}</span>
          </div>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {stockDetails.Description}
          </p>
          <div className="flex items-baseline mt-6">
            <span className="text-4xl font-bold text-gray-900">${price.toFixed(2)}</span>
            <div className={`flex items-center text-lg ${isPositive ? 'text-green-600' : 'text-red-600'} ml-4`}>
              {isPositive ? <GoArrowUpRight /> : <GoArrowDownRight />}
              <span className="font-semibold ml-1">{change.toFixed(2)} ({changePercent})</span>
            </div>
          </div>
        </div>
      );
    }

    // Default view when no stock is selected or details are not available
    return (
      <div>
        <div className="flex items-center">
          <h3 className="text-2xl font-bold text-gray-900">Stock Profile</h3>
        </div>
        <p className="text-gray-600 mt-4 leading-relaxed">
          Search for a stock or select one from your watchlist to see its details.
        </p>
      </div>
    );
  };

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
        {activeTab === 'Stock Profile' && renderContent()}
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
      const apiKey = 'E4W85A2W5Q6Q8Q7Q'; // User has added their API key here.

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
function KeyStatistics({ stockDetails, loading }) {
  const formatNumber = (numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return '-';
    
    if (num >= 1_000_000_000_000) {
      return `${(num / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    return num.toLocaleString();
  };

  const formatCurrency = (numStr) => {
    const num = parseFloat(numStr);
    if (isNaN(num)) return '-';
    return `${num.toFixed(2)}`;
  }

  const stats = [
    { label: 'Market Cap', value: stockDetails ? formatNumber(stockDetails.MarketCapitalization) : '-' },
    { label: 'Volume', value: stockDetails ? formatNumber(stockDetails['06. volume']) : '-' },
    { label: 'Day High', value: stockDetails ? formatCurrency(stockDetails['03. high']) : '-' },
    { label: 'Day Low', value: stockDetails ? formatCurrency(stockDetails['04. low']) : '-' },
    { label: 'Open', value: stockDetails ? formatCurrency(stockDetails['02. open']) : '-' },
    { label: 'Prev Close', value: stockDetails ? formatCurrency(stockDetails['08. previous close']) : '-' },
    { label: '52W High', value: stockDetails ? formatCurrency(stockDetails['52WeekHigh']) : '-' },
    { label: '52W Low', value: stockDetails ? formatCurrency(stockDetails['52WeekLow']) : '-' },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-pulse">
            <h4 className="text-sm font-medium text-gray-500">{stat.label}</h4>
            <div className="h-6 bg-gray-200 rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

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