'use client';

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
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);

  const fetchWatchlist = async () => {
    setLoadingWatchlist(true);
    try {
      const response = await fetch('/api/watchlist');
      if (response.ok) {
        const data = await response.json();
        setWatchlist(data);
      } else {
        console.error("Failed to fetch watchlist");
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
    setLoadingWatchlist(false);
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchStockDetails = async () => {
      if (selectedStock) {
        setLoadingDetails(true);
        try {
          const symbol = selectedStock['1. symbol'];
          const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
          const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
          const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

          const [quoteResponse, overviewResponse] = await Promise.all([
            fetch(quoteUrl),
            fetch(overviewUrl),
          ]);

          const quoteData = await quoteResponse.json();
          const overviewData = await overviewResponse.json();

          const combinedDetails = { ...quoteData['Global Quote'], ...overviewData };
          setStockDetails(combinedDetails);
        } catch (error) {
          console.error("Error fetching stock details:", error);
          setStockDetails(null);
        }
        setLoadingDetails(false);
      }
    };

    fetchStockDetails();
  }, [selectedStock]);


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto grid grid-cols-3 gap-8">
        
        <div className="col-span-3 lg:col-span-2 space-y-8">
          
          <Header />

          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSelectedStock={setSelectedStock} />

          <MarketOverview />

          <StockDetails 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            selectedStock={selectedStock} 
            stockDetails={stockDetails} 
            loading={loadingDetails}
            watchlist={watchlist}
            fetchWatchlist={fetchWatchlist}
          />
          
          <PriceChart selectedStock={selectedStock} />

          <KeyStatistics stockDetails={stockDetails} loading={loadingDetails} />

        </div>

        <div className="col-span-3 lg:col-span-1">
          <div className="sticky top-8 space-y-8">
            
            <Watchlist 
              searchQuery={searchQuery} 
              selectedStock={selectedStock} 
              setSelectedStock={setSelectedStock}
              watchlist={watchlist}
              loading={loadingWatchlist}
            />

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

function SearchBar({ searchQuery, setSearchQuery, setSelectedStock }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      if (searchQuery.length > 1) {
        setLoading(true);
        try {
          const response = await fetch(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`);
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
      const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
      const requests = symbols.map(symbol =>
        fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`)
          .then(res => res.json())
      );

      try {
        const results = await Promise.all(requests);
        const data = results.map((result, index) => {
          const quote = result['Global Quote'];
          if (quote) {
            const change = parseFloat(quote['09. change']);
            const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
            return {
              name: names[symbols[index]],
              value: parseFloat(quote['05. price']).toFixed(2),
              change: change.toFixed(2),
              changePercent: changePercent.toFixed(2),
              up: change >= 0,
            };
          } else {
            console.warn(`Could not fetch quote for symbol: ${symbols[index]}`);
            return null;
          }
        }).filter(Boolean);
        setMarketData(data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 15000);
    return () => clearInterval(interval);
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

function StockDetails({ activeTab, setActiveTab, selectedStock, stockDetails, loading, watchlist, fetchWatchlist }) {
  const tabs = ['Stock Profile', 'Analysis', 'News'];
  const [news, setNews] = useState([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const isinWatchlist = selectedStock && watchlist.some(item => item.symbol === selectedStock['1. symbol']);

  const handleToggleWatchlist = async () => {
    if (!selectedStock) return;

    const symbol = selectedStock['1. symbol'];

    if (isinWatchlist) {
      try {
        const response = await fetch('/api/watchlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });
        if (response.ok) {
          fetchWatchlist();
        } else {
          console.error("Failed to remove from watchlist");
        }
      } catch (error) {
        console.error("Error removing from watchlist:", error);
      }
    } else {
      try {
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol }),
        });
        if (response.ok) {
          fetchWatchlist();
        } else {
          console.error("Failed to add to watchlist");
        }
      } catch (error) {
        console.error("Error adding to watchlist:", error);
      }
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      if (activeTab === 'News' && selectedStock) {
        setLoadingNews(true);
        try {
          const symbol = selectedStock['1. symbol'];
          const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
          const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${apiKey}`;
          const response = await fetch(url);
          const data = await response.json();
          setNews(data.feed || []);
        } catch (error) {
          console.error("Error fetching news:", error);
        }
        setLoadingNews(false);
      }
    };

    const fetchAnalysis = async () => {
        if (activeTab === 'Analysis' && selectedStock) {
            setLoadingAnalysis(true);
            try {
                const symbol = selectedStock['1. symbol'];
                const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
                const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${apiKey}`;
                const response = await fetch(url);
                const data = await response.json();
                setAnalysisData(data);
            } catch (error) {
                console.error("Error fetching analysis:", error);
            }
            setLoadingAnalysis(false);
        }
    };

    fetchNews();
    fetchAnalysis();
  }, [activeTab, selectedStock]);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className="text-2xl font-bold text-gray-900">{stockDetails.Symbol}</h3>
              <span className="ml-3 text-lg text-gray-500">{stockDetails.Name}</span>
            </div>
            <button
              onClick={handleToggleWatchlist}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isinWatchlist
                  ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isinWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
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

  const renderNews = () => {
    if (loadingNews) {
      return <div className="text-center p-8">Loading news...</div>;
    }

    if (news.length > 0) {
      return (
        <div className="space-y-4">
          {news.map((article, index) => (
            <a href={article.url} key={index} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
              <h4 className="font-bold text-gray-900">{article.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{article.source} - {new Date(article.time_published).toLocaleDateString()}</p>
              <p className="text-gray-600 mt-2">{article.summary}</p>
            </a>
          ))}
        </div>
      );
    }

    return <div className="text-gray-600">No news available for this stock.</div>;
  };

  const renderAnalysis = () => {
    if (loadingAnalysis) {
        return <div className="text-center p-8">Loading analysis...</div>;
    }

    if (analysisData) {
        return (
            <div>
                <pre>{JSON.stringify(analysisData, null, 2)}</pre>
            </div>
        );
    }

    return <div className="text-gray-600">No analysis data available for this stock.</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-6 font-medium text-sm
              ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'Stock Profile' && renderContent()}
        {activeTab === 'Analysis' && renderAnalysis()}
        {activeTab === 'News' && renderNews()}
      </div>
    </div>
  );
}


function PriceChart({ selectedStock }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      const symbol = selectedStock ? selectedStock['1. symbol'] : 'TSLA';
      const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        const timeSeries = data['Time Series (Daily)'];

        if (timeSeries) {
          const labels = Object.keys(timeSeries).slice(0, 30).reverse();
          const prices = labels.map(label => parseFloat(timeSeries[label]['4. close']));

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
          maxTicksLimit: 7
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

function Watchlist({ searchQuery, selectedStock, setSelectedStock, watchlist, loading }) {
  const [watchlistDetails, setWatchlistDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchWatchlistDetails = async () => {
      if (watchlist.length > 0) {
        setLoadingDetails(true);
        try {
          const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
          const requests = watchlist.map(stock =>
            fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.symbol}&apikey=${apiKey}`)
              .then(res => res.json())
          );
          const results = await Promise.all(requests);
          const data = results.map((result, index) => {
            const quote = result['Global Quote'];
            if (quote && quote['05. price']) {
              const change = parseFloat(quote['09. change']);
              const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
              return {
                symbol: watchlist[index].symbol,
                name: quote['02. name'] || watchlist[index].symbol,
                price: parseFloat(quote['05. price']).toFixed(2),
                change: change.toFixed(2),
                changePercent: changePercent.toFixed(2),
                up: change >= 0,
              };
            }
            return null;
          }).filter(Boolean);
          setWatchlistDetails(data);
        } catch (error) {
          console.error("Error fetching watchlist details:", error);
        } finally {
          setLoadingDetails(false);
        }
      } else {
        setWatchlistDetails([]);
      }
    };

    fetchWatchlistDetails();
    const interval = setInterval(fetchWatchlistDetails, 15000);
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
              <div>
                <p className="font-bold text-gray-900">{stock.symbol}</p>
                <p className="text-sm text-gray-500">{stock.name}</p>
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


function TrendingStocks({ searchQuery, selectedStock, setSelectedStock }) {
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
              className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors ${
                selectedStock && selectedStock['1. symbol'] === stock.ticker ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
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
