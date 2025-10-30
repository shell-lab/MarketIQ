"use client";

import { useState, useEffect } from "react";
import DemoTradePortfolio from "../components/DemoTradePortfolio";
import DemoTradeForm from "../components/DemoTradeForm";

export default function DemoTradePage() {
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio and history on mount
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const resPortfolio = await fetch("/api/demo-trade/portfolio");
        const resHistory = await fetch("/api/demo-trade/history");
        const portfolioData = await resPortfolio.json();
        const historyData = await resHistory.json();
        setPortfolio(portfolioData);
        setHistory(historyData);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle trade placement
  const handleTrade = async (trade) => {
    try {
      const res = await fetch("/api/demo-trade/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trade),
      });
      if (res.ok) {
        // Refresh portfolio and history
        const resPortfolio = await fetch("/api/demo-trade/portfolio");
        const resHistory = await fetch("/api/demo-trade/history");
        setPortfolio(await resPortfolio.json());
        setHistory(await resHistory.json());
      }
    } catch (err) {
      // handle error
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Demo Trading</h1>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <>
            <DemoTradePortfolio portfolio={portfolio} history={history} />
            <DemoTradeForm onTrade={handleTrade} />
          </>
        )}
      </div>
    </div>
  );
}
