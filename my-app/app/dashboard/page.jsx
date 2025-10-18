"use client";
import { useState, useEffect } from 'react';
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
];

const StockPrice = ({ symbol, price }) => (
  <div className="bg-gray-800 p-4 rounded-lg">
    <h3 className="text-lg font-bold">{symbol}</h3>
    <p className="text-2xl">${price}</p>
  </div>
);

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState('AAPL');
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  const fetchStockData = async (symbol) => {
    setLoading(true);
    // Replace with your actual API key
    const apiKey = 'YOUR_API_KEY';
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const historyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

    try {
      const [quoteResponse, historyResponse] = await Promise.all([
        fetch(quoteUrl),
        fetch(historyUrl),
      ]);

      const quoteData = await quoteResponse.json();
      const historyData = await historyResponse.json();

      if (quoteData['Global Quote']) {
        setStockData({
          symbol: quoteData['Global Quote']['01. symbol'],
          price: quoteData['Global Quote']['05. price'],
        });
      }

      if (historyData['Time Series (Daily)']) {
        const formattedData = Object.entries(historyData['Time Series (Daily)']).map(([date, data]) => ({
          date,
          price: parseFloat(data['4. close']),
        })).reverse();
        setHistoricalData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (search) {
      fetchStockData(search);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search) {
      fetchStockData(search);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Market-IQ</div>
        <div className="flex items-center">
          <a href="/dashboard" className="mr-4">Home</a>
          <a href="/top-gainers" className="mr-4">Top Gainers</a>
          <a href="/contact" className="mr-4">Contact Us</a>
          <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Sign Out
          </button>
        </div>
      </nav>
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-8">Welcome, {session.user.name || session.user.email}</h1>
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a stock (e.g., AAPL)"
              className="w-full p-2 rounded-l-lg bg-gray-800 text-white"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
        {loading && <p>Loading...</p>}
        {stockData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StockPrice symbol={stockData.symbol} price={stockData.price} />
          </div>
        )}
        {historicalData && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Historical Data for {search}</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Popular Stocks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="bg-gray-800 p-4 rounded-lg cursor-pointer" onClick={() => setSearch(stock.symbol)}>
                <h3 className="text-lg font-bold">{stock.name}</h3>
                <p className="text-gray-400">{stock.symbol}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}