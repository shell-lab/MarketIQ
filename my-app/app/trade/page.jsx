"use client";

import { useState, useEffect, useRef } from 'react';
import { FiStar } from 'react-icons/fi';

/*
  Full-page Demo Trade Terminal
  - Fullscreen terminal layout
  - Dark mode toggle persisted to localStorage (adds/removes "dark" class on <html>)
  - Header with Profile, Sign Out, Settings, Help
  - Mock price feed, place/close orders, journal persisted to localStorage
*/

const DEFAULT_SYMBOL = "AAPL";

function formatPrice(p) {
  return Number(p).toFixed(2);
}

export default function TradeDemoTerminal() {
  // Theme
  const [dark, setDark] = useState(() => {
    try {
      const s = localStorage.getItem("demo_theme");
      if (s) return s === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return true;
    }
  });

  // Trading state
  const [symbol, setSymbol] = useState(DEFAULT_SYMBOL);
  const [price, setPrice] = useState(150.0);
  const [lots, setLots] = useState(1);
  const [side, setSide] = useState("Buy");
  const [openPositions, setOpenPositions] = useState([]);
  const [journal, setJournal] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const priceRef = useRef(price);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('/api/watchlist');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setWatchlist(data.map((item) => item.symbol));
        }
      } else {
        console.error("Failed to fetch watchlist");
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  // Persist & load demo state
  useEffect(() => {
    try {
      const s = localStorage.getItem("demo_openPositions");
      const j = localStorage.getItem("demo_journal");
      if (s) setOpenPositions(JSON.parse(s));
      if (j) setJournal(JSON.parse(j));
      fetchWatchlist();
    } catch (error) {
      console.error("Error loading demo state:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("demo_openPositions", JSON.stringify(openPositions));
    } catch {}
  }, [openPositions]);

  useEffect(() => {
    try {
      localStorage.setItem("demo_journal", JSON.stringify(journal));
    } catch {}
  }, [journal]);

  // theme effect: add 'dark' class to <html> for Tailwind/class-based dark mode
  useEffect(() => {
    try {
      localStorage.setItem("demo_theme", dark ? "dark" : "light");
      if (dark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch {}
  }, [dark]);

  // Mock price feed
  useEffect(() => {
    priceRef.current = price;
    const id = setInterval(() => {
      const drift = (Math.random() - 0.5) * 0.8;
      const newPrice = Math.max(0.01, Number((priceRef.current + drift).toFixed(2)));
      priceRef.current = newPrice;
      setPrice(newPrice);
    }, 700);
    return () => clearInterval(id);
  }, []);

  // Actions
  function placeOrder() {
    if (!symbol.trim() || lots <= 0) return;
    const executedPrice = priceRef.current;
    const position = {
      id: `pos_${Date.now()}`,
      symbol: symbol.toUpperCase(),
      side,
      lots: Number(lots),
      entryPrice: executedPrice,
      createdAt: new Date().toISOString(),
    };
    setOpenPositions((p) => [position, ...p]);
  }

  function closePosition(posId) {
    const pos = openPositions.find((p) => p.id === posId);
    if (!pos) return;
    const exitPrice = priceRef.current;
    const multiplier = pos.side === "Buy" ? 1 : -1;
    const pnl = (exitPrice - pos.entryPrice) * pos.lots * multiplier;
    const closed = {
      ...pos,
      exitPrice,
      closedAt: new Date().toISOString(),
      pnl: Number(pnl.toFixed(2)),
    };
    setOpenPositions((list) => list.filter((p) => p.id !== posId));
    setJournal((j) => [closed, ...j]);
  }

  function closeAll() {
    const now = new Date().toISOString();
    const closed = openPositions.map((pos) => {
      const exitPrice = priceRef.current;
      const multiplier = pos.side === "Buy" ? 1 : -1;
      const pnl = (exitPrice - pos.entryPrice) * pos.lots * multiplier;
      return { ...pos, exitPrice, closedAt: now, pnl: Number(pnl.toFixed(2)) };
    });
    setOpenPositions([]);
    setJournal((j) => [...closed, ...j]);
  }

  function resetDemo() {
    setOpenPositions([]);
    setJournal([]);
    try {
      localStorage.removeItem("demo_openPositions");
      localStorage.removeItem("demo_journal");
    } catch {}
  }

  const handleToggleWatchlist = async (ticker) => {
    const isInWatchlist = watchlist.includes(ticker);
    const originalWatchlist = [...watchlist];

    // Optimistically update the UI
    if (isInWatchlist) {
      setWatchlist(watchlist.filter((s) => s !== ticker));
    } else {
      setWatchlist([...watchlist, ticker]);
    }

    const method = isInWatchlist ? 'DELETE' : 'POST';

    try {
      const response = await fetch('/api/watchlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: ticker }),
      });

      if (!response.ok) {
        // Revert the UI change if the API call fails
        setWatchlist(originalWatchlist);
        console.error(`Failed to ${isInWatchlist ? 'remove from' : 'add to'} watchlist`);
      }
    } catch (error) {
      // Revert the UI change if the API call fails
      setWatchlist(originalWatchlist);
      console.error(`Error toggling watchlist:`, error);
    }
  };

  // Header actions
  async function handleSignOut() {
    try {
      const mod = await import("next-auth/react");
      if (mod && mod.signOut) {
        mod.signOut({ callbackUrl: "/" });
        return;
      }
    } catch {
      // next-auth not present -> fallback
    }
    // fallback: clear demo and redirect
    try {
      localStorage.removeItem("demo_openPositions");
      localStorage.removeItem("demo_journal");
    } catch {}
    window.location.href = "/login";
  }

  function handleProfile() {
    window.location.href = "/profile";
  }
  function handleSettings() {
    window.location.href = "/settings";
  }
  function handleHelp() {
    window.open("https://example.com/docs", "_blank");
  }

  const totalUnrealized = openPositions.reduce((sum, p) => {
    const mult = p.side === "Buy" ? 1 : -1;
    return sum + (price - p.entryPrice) * p.lots * mult;
  }, 0);

  const totalRealized = journal.reduce((sum, j) => sum + (j.pnl || 0), 0);

  // Layout: full screen terminal-like
  return (
    <div className={`h-screen w-full flex flex-col ${dark ? "bg-neutral-900 text-neutral-100" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2 border-b ${dark ? "border-neutral-800" : "border-gray-200"} bg-opacity-40`}>
        <div className="flex items-center gap-3">
          <div className="font-mono font-semibold text-lg">Trade Terminal</div>
          <div className="text-xs text-gray-400 hidden sm:block">Demo • {symbol.toUpperCase()}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark((d) => !d)}
            title="Toggle dark mode"
            className="px-3 py-1 rounded bg-gray-800 text-white dark:bg-white dark:text-black/90"
            aria-pressed={dark}
          >
            {dark ? "Light" : "Dark"}
          </button>

          <button onClick={handleProfile} className="px-3 py-1 rounded border">{/* Profile */}Profile</button>
          <button onClick={handleSettings} className="px-3 py-1 rounded border">Settings</button>
          <button onClick={handleHelp} className="px-3 py-1 rounded border">Help</button>
          <button onClick={handleSignOut} className="px-3 py-1 rounded bg-red-600 text-white">Sign Out</button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Left: Terminal / Market feed */}
          <section className="flex-1 p-4 flex flex-col gap-4">
            <div className={`flex items-center justify-between p-4 rounded-md ${dark ? "bg-neutral-800" : "bg-white shadow-sm"}`}>
              <div className="flex items-center">
                <div>
                  <div className="text-xs text-gray-400">Symbol</div>
                  <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="text-2xl font-mono bg-transparent outline-none"
                  />
                </div>
                <FiStar
                  className={`cursor-pointer transition-colors ml-2 ${
                    watchlist.includes(symbol) ? 'text-yellow-500' : 'text-gray-500'
                  }`}
                  onClick={() => handleToggleWatchlist(symbol)}
                />
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Last</div>
                <div className={`text-3xl font-mono ${price >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPrice(price)}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            <div className={`flex-1 p-4 rounded-md overflow-auto ${dark ? "bg-neutral-900/40" : "bg-white"}`}>
              <div className="font-mono text-sm leading-6">
                {/* Terminal-like live feed */}
                <div className="text-sm text-gray-400 mb-2">Market Feed</div>
                <div className="space-y-1">
                  {/* generate small feed lines */}
                  {Array.from({ length: 18 }).map((_, i) => {
                    const delta = ((Math.random() - 0.5) * 1.2).toFixed(2);
                    const priceSample = (price + Number(delta)).toFixed(2);
                    return (
                      <div key={i} className="flex justify-between">
                        <div className="text-xs text-gray-400">[{new Date().toLocaleTimeString()}]</div>
                        <div className="flex-1 px-3">
                          <span className="text-xs">{symbol}</span>
                        </div>
                        <div className={`w-24 text-right ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>{priceSample}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order entry area */}
            <div className={`p-4 rounded-md ${dark ? "bg-neutral-800" : "bg-white shadow-sm"}`}>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400">Side</label>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setSide("Buy")} className={`flex-1 py-2 rounded ${side === "Buy" ? "bg-green-500 text-white" : "bg-gray-100 text-black"}`}>
                      Buy
                    </button>
                    <button onClick={() => setSide("Sell")} className={`flex-1 py-2 rounded ${side === "Sell" ? "bg-red-500 text-white" : "bg-gray-100 text-black"}`}>
                      Sell
                    </button>
                  </div>
                </div>

                <div className="w-32">
                  <label className="text-xs text-gray-400">Lots</label>
                  <input type="number" min="0.01" step="0.01" value={lots} onChange={(e) => setLots(Number(e.target.value))}
                    className="w-full border px-2 py-1 rounded bg-transparent" />
                </div>

                <div className="w-36">
                  <div className="text-xs text-gray-400">Exec Price</div>
                  <div className="font-mono text-lg">{formatPrice(price)}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={placeOrder} className="px-4 py-2 rounded bg-blue-600 text-white">Market {side}</button>
                  <button onClick={closeAll} className="px-4 py-2 rounded bg-orange-500 text-white">Close All</button>
                  <button onClick={resetDemo} className="px-4 py-2 rounded bg-gray-200">Reset</button>
                </div>
              </div>
            </div>
          </section>

          {/* Right: positions & journal */}
          <aside className={`w-96 flex flex-col gap-4 p-4 border-l ${dark ? "border-neutral-800" : "border-gray-200"} bg-opacity-30`}>
            <div className={`p-3 rounded ${dark ? "bg-neutral-800" : "bg-white shadow-sm"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-400">Unrealized</div>
                  <div className={`text-lg font-semibold ${totalUnrealized >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPrice(totalUnrealized)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Realized</div>
                  <div className={`text-lg font-semibold ${totalRealized >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPrice(totalRealized)}</div>
                </div>
              </div>
            </div>

            <div className={`flex-1 overflow-auto p-2 rounded ${dark ? "bg-neutral-900/40" : "bg-white"}`}>
              <h4 className="text-sm font-medium mb-2">Open Positions</h4>
              <div className="space-y-2">
                {openPositions.length === 0 && <div className="text-xs text-gray-400">No open positions</div>}
                {openPositions.map((p) => {
                  const unreal = ((price - p.entryPrice) * p.lots * (p.side === "Buy" ? 1 : -1)).toFixed(2);
                  return (
                    <div key={p.id} className="p-2 rounded border flex justify-between items-start">
                      <div>
                        <div className="font-medium">{p.symbol} • {p.side}</div>
                        <div className="text-xs text-gray-400">Entry {formatPrice(p.entryPrice)} • {p.lots} lots</div>
                      </div>
                      <div className="text-right">
                        <div className={`${unreal >= 0 ? "text-green-400" : "text-red-400"} font-mono`}>{Number(unreal).toFixed(2)}</div>
                        <button onClick={() => closePosition(p.id)} className="mt-2 text-xs px-2 py-1 rounded bg-gray-100">Close</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`h-60 overflow-auto p-2 rounded ${dark ? "bg-neutral-900/30" : "bg-white"}`}>
              <h4 className="text-sm font-medium mb-2">Journal (Closed)</h4>
              <div className="space-y-2">
                {journal.length === 0 && <div className="text-xs text-gray-400">No closed trades</div>}
                {journal.map((j) => (
                  <div key={j.id || j.closedAt} className="p-2 border rounded">
                    <div className="flex justify-between">
                      <div className="font-medium">{j.symbol} • {j.side}</div>
                      <div className={`${j.pnl >= 0 ? "text-green-400" : "text-red-400"} font-mono`}>{formatPrice(j.pnl)}</div>
                    </div>
                    <div className="text-xs text-gray-400">Entry {formatPrice(j.entryPrice)} → Exit {formatPrice(j.exitPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}