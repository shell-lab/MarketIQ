
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { collection, query, onSnapshot, addDoc } from 'firebase/firestore';

import TradeForm from './components/TradeForm';
import PositionsTable from './components/PositionsTable';
import Journal from './components/Journal';
import Watchlist from '@/components/Watchlist';
import SearchBar from './components/SearchBar';
import Portfolio from './components/Portfolio';

export default function TradeTerminal() {
    const DEMO_MODE = true;
    
    // Authentication states
    const [userId, setUserId] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    
    // Trading states
    const [currentSymbol, setCurrentSymbol] = useState("XAU/USD");
    const [watchlist, setWatchlist] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [openPositions, setOpenPositions] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    
    const [lots, setLots] = useState(0.01);
    const [takeProfit, setTakeProfit] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false, show: false });
    const [demoPortfolio, setDemoPortfolio] = useState(null);
    const [demoHistory, setDemoHistory] = useState([]);

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
        try {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    const token = await user.getIdToken();
                    setIdToken(token);
                    setIsAuthReady(true);
                    console.log("Firebase Auth Ready. User:", user.uid);
                    
                    fetchOpenPositions(token);
                    setupJournalListener(user.uid);
                    fetchWatchlist();
                } else {
                    setIsAuthReady(false);
                    setUserId(null);
                    setIdToken(null);
                }
            });

            (async () => {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            })();

        } catch (error) {
            console.error("Firebase Init Error:", error);
            showMessage("Error connecting to services. Check console.", true);
        }
    }, []);

    useEffect(() => {
        const ctl = new AbortController();
        const fetchSearch = async () => {
            if (!searchQuery || searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }
            setSearchLoading(true);
            try {
                if (DEMO_MODE) {
                    const res = await fetch('/api/demo-trade/search', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ keywords: searchQuery })
                    });
                    const data = await res.json();
                    setSearchResults(data.matches || []);
                } else {
                    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
                    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(searchQuery)}&apikey=${apiKey}`;
                    const res = await fetch(url, { signal: ctl.signal });
                    const data = await res.json();
                    setSearchResults(data.bestMatches || []);
                }
            } catch (err) {
                if (err.name !== 'AbortError') console.error('Search error:', err);
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const id = setTimeout(fetchSearch, 400);
        return () => {
            clearTimeout(id);
            ctl.abort();
        };
    }, [searchQuery]);

    useEffect(() => {
        if (DEMO_MODE && isAuthReady) {
            fetchDemoPortfolio();
            fetchDemoHistory();
        }
    }, [DEMO_MODE, isAuthReady]);

    const placeTrade = async (side) => {
        if (!isAuthReady) {
            showMessage("User not authenticated.", true);
            return;
        }
        if (!lots || parseFloat(lots) <= 0) {
            showMessage("Please enter a valid lot size.", true);
            return;
        }

        const tradeOrder = DEMO_MODE ? {
            symbol: currentSymbol,
            side: side,
            quantity: Number(parseFloat(lots)),
            stopLoss: stopLoss ? Number(parseFloat(stopLoss)) : null,
            takeProfit: takeProfit ? Number(parseFloat(takeProfit)) : null,
        } : {
            symbol: currentSymbol,
            side: side,
            volume: parseFloat(lots),
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        };

        console.log("Placing order:", tradeOrder);
        setIsLoading(true);

        try {
            let response, result;
            if (DEMO_MODE) {
                response = await fetch('/api/demo-trade/trade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tradeOrder)
                });
                result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to place demo trade.');
                }

                showMessage(`Demo trade executed: ${result.trade.side} ${result.trade.quantity} ${result.trade.symbol}`, false);
                fetchDemoPortfolio();
                fetchDemoHistory();
            } else {
                response = await fetch('/api/v1/order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${idToken}`
                    },
                    body: JSON.stringify(tradeOrder)
                });
                result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to place trade.');
                }

                showMessage(`Trade placed successfully! Order ID: ${result.orderId}`, false);
                fetchOpenPositions(idToken);
            }
            
        } catch (error) {
            console.error("Trade Error:", error);
            showMessage(`Trade Error: ${error.message}`, true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDemoPortfolio = async () => {
        try {
            const res = await fetch('/api/demo-trade/portfolio');
            if (!res.ok) return;
            const data = await res.json();
            setDemoPortfolio(data);
        } catch (err) {
            console.error('Error fetching demo portfolio', err);
        }
    };

    const fetchDemoHistory = async () => {
        try {
            const res = await fetch('/api/demo-trade/history');
            if (!res.ok) return;
            const data = await res.json();
            setDemoHistory(data);
        } catch (err) {
            console.error('Error fetching demo trade history', err);
        }
    };

    const handleToggleWatchlist = async (symbol) => {
        if (!symbol) return;
        try {
            if (watchlist.includes(symbol)) {
                const res = await fetch('/api/watchlist', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol }),
                });
                if (res.ok) await fetchWatchlist();
            } else {
                const res = await fetch('/api/watchlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symbol }),
                });
                if (res.ok) await fetchWatchlist();
            }
        } catch (err) {
            console.error('Error toggling watchlist from terminal:', err);
        }
    };

    const fetchOpenPositions = async (token) => {
        if (!token) return;
        console.log("Fetching open positions...");
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/v1/positions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch positions.');
            }

            const positions = await response.json();
            setOpenPositions(positions);
            
        } catch (error) {
            console.error("Fetch Positions Error:", error);
            showMessage(`Fetch Positions Error: ${error.message}`, true);
            setOpenPositions([
                { id: 12345, symbol: "XAU/USD", side: "Buy", volume: 0.01, openPrice: 4113.88, sl: 4100.00, tp: 4124.00, pnl: -2.11 },
                { id: 12346, symbol: "EUR/USD", side: "Sell", volume: 0.10, openPrice: 1.1590, sl: 1.1650, tp: 1.1500, pnl: 5.40 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const setupJournalListener = (uid) => {
        if (!uid) return;
        const journalCollectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${uid}/trade_journal`;
        const q = query(collection(db, journalCollectionPath));
        
        onSnapshot(q, (snapshot) => {
            const entries = [];
            snapshot.forEach((doc) => {
                entries.push({ id: doc.id, ...doc.data() });
            });
            setJournalEntries(entries);
        }, (error) => {
            console.error("Journal listener error:", error);
            showMessage("Could not load trade journal.", true);
        });
    };

    const addJournalEntry = async (e) => {
        e.preventDefault();
        const note = e.target.elements.journalInput.value;
        if (!note || !userId) return;
        
        const journalCollectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${userId}/trade_journal`;
        
        try {
            await addDoc(collection(db, journalCollectionPath), {
                note: note,
                createdAt: new Date()
            });
            e.target.elements.journalInput.value = '';
        } catch (error) {
            console.error("Error adding journal entry:", error);
            showMessage("Failed to save journal entry.", true);
        }
    };

    const showMessage = (text, isError = false) => {
        setMessage({ text, isError, show: true });
        setTimeout(() => {
            setMessage({ text: '', isError: false, show: false });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link 
                                href="/dashboard" 
                                className="text-xl font-bold text-gray-800"
                            >
                                Market<span className="text-blue-600">IQ</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/dashboard"
                                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/profile"
                                className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto p-8 max-w-7xl text-gray-800">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Trade Terminal</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {DEMO_MODE ? 'Demo Mode Active' : (isAuthReady ? `Connected as ${userId}` : 'Connecting to services...')}
                    </p>
                </header>

                {message.show && (
                    <div className={`p-4 rounded-lg text-sm mb-6 ${message.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <SearchBar
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchLoading={searchLoading}
                            searchResults={searchResults}
                            setCurrentSymbol={setCurrentSymbol}
                            setSearchResults={setSearchResults}
                            handleToggleWatchlist={handleToggleWatchlist}
                            DEMO_MODE={DEMO_MODE}
                        />
                        <TradeForm
                            lots={lots}
                            setLots={setLots}
                            takeProfit={takeProfit}
                            setTakeProfit={setTakeProfit}
                            stopLoss={stopLoss}
                            setStopLoss={setStopLoss}
                            placeTrade={placeTrade}
                            currentSymbol={currentSymbol}
                        />
                        <Watchlist
                            searchQuery={searchQuery}
                            selectedStock={currentSymbol}
                            setSelectedStock={setCurrentSymbol}
                            watchlist={watchlist}
                            loading={isLoading}
                            toggleWatchlist={handleToggleWatchlist}
                        />
                        {DEMO_MODE && demoPortfolio && (
                            <Portfolio demoPortfolio={demoPortfolio} setCurrentSymbol={setCurrentSymbol} />
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <PositionsTable
                            openPositions={openPositions}
                            watchlist={watchlist}
                            handleToggleWatchlist={handleToggleWatchlist}
                        />
                        <Journal
                            addJournalEntry={addJournalEntry}
                            journalEntries={journalEntries}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
