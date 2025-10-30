"use client";

import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import Link from 'next/link';

// Firebase Client SDK (for frontend auth & journal)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, collection, onSnapshot, query, addDoc } from 'firebase/firestore';

// --- Firebase Config ---
// Your __firebase_config should be set in _app.js or via environment variables
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let db, auth;

export default function TradeTerminal() {
    // --- App State ---
    const [userId, setUserId] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [openPositions, setOpenPositions] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [currentSymbol, setCurrentSymbol] = useState("XAU/USD");
    const [watchlist, setWatchlist] = useState([]);
    
    // --- Form State ---
    const [lots, setLots] = useState(0.01);
    const [takeProfit, setTakeProfit] = useState('');
    const [stopLoss, setStopLoss] = useState('');
    
    // --- UI State ---
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', isError: false, show: false });

    // --- Core Functions ---

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

    /**
     * Initialize Firebase and set up Auth listener
     */
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            db = getFirestore(app);
            auth = getAuth(app);

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    const token = await user.getIdToken();
                    setIdToken(token);
                    setIsAuthReady(true);
                    console.log("Firebase Auth Ready. User:", user.uid);
                    
                    // User is signed in, now we can fetch their data
                    fetchOpenPositions(token);
                    setupJournalListener(user.uid);
                    fetchWatchlist();
                } else {
                    // User is signed out
                    setIsAuthReady(false);
                    setUserId(null);
                    setIdToken(null);
                }
            });

            // Sign in (or use existing session)
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
    }, []); // Empty dependency array ensures this runs once on mount

    /**
     * Places a trade by calling OUR NEXT.JS API ROUTE, not the broker.
     */
    const placeTrade = async (side) => {
        if (!isAuthReady) {
            showMessage("User not authenticated.", true);
            return;
        }
        if (!lots || parseFloat(lots) <= 0) {
            showMessage("Please enter a valid lot size.", true);
            return;
        }

        const tradeOrder = {
            symbol: currentSymbol,
            side: side, // "buy" or "sell"
            volume: parseFloat(lots),
            stopLoss: stopLoss ? parseFloat(stopLoss) : null,
            takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        };

        console.log("Placing order:", tradeOrder);
        setIsLoading(true);

        try {
            // We call OUR OWN backend, which will then call the broker.
            // This keeps our broker API key SECURE on the server.
            const response = await fetch('/api/v1/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}` // Send auth token
                },
                body: JSON.stringify(tradeOrder)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to place trade.');
            }

            showMessage(`Trade placed successfully! Order ID: ${result.orderId}`, false);
            fetchOpenPositions(idToken); // Refresh positions
            
        } catch (error) {
            console.error("Trade Error:", error);
            showMessage(`Trade Error: ${error.message}`, true);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetches open positions from OUR NEXT.JS API ROUTE.
     */
    const fetchOpenPositions = async (token) => {
        if (!token) return;
        console.log("Fetching open positions...");
        setIsLoading(true);
        
        try {
            // Call our backend to get the positions
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
            // On error, use mock data to show UI
            setOpenPositions([
                { id: 12345, symbol: "XAU/USD", side: "Buy", volume: 0.01, openPrice: 4113.88, sl: 4100.00, tp: 4124.00, pnl: -2.11 },
                { id: 12346, symbol: "EUR/USD", side: "Sell", volume: 0.10, openPrice: 1.1590, sl: 1.1650, tp: 1.1500, pnl: 5.40 }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToWatchlist = async (symbol) => {
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
      };

    /**
     * Renders the open positions to the table.
     */
    const renderPositions = () => {
        if (openPositions.length === 0) {
            return <tr><td colSpan="9" className="text-center py-4 text-gray-500">No open positions.</td></tr>;
        }

        return openPositions.map(pos => {
            const pnlClass = pos.pnl >= 0 ? 'text-green-400' : 'text-red-400';
            return (
                <tr key={pos.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-2 px-3">
                        <FiStar
                            className={`cursor-pointer ${
                                watchlist.includes(pos.symbol) ? 'text-yellow-500' : 'text-gray-500'
                            }`}
                            onClick={() => handleAddToWatchlist(pos.symbol)}
                        />
                    </td>
                    <td className="py-2 px-3">{pos.id}</td>
                    <td className="py-2 px-3 font-medium">{pos.symbol}</td>
                    <td className={`py-2 px-3 ${pos.side === 'Buy' ? 'text-blue-400' : 'text-orange-400'}`}>{pos.side}</td>
                    <td className="py-2 px-3">{pos.volume}</td>
                    <td className="py-2 px-3">{pos.openPrice}</td>
                    <td className="py-2 px-3">{pos.sl || 'N/A'}</td>
                    <td className="py-2 px-3">{pos.tp || 'N/A'}</td>
                    <td className={`py-2 px-3 font-medium ${pnlClass}`}>{pos.pnl.toFixed(2)}</td>
                </tr>
            );
        });
    };

    /**
     * Sets up a real-time listener for journal entries
     */
    const setupJournalListener = (uid) => {
        if (!uid) return;
        const journalCollectionPath = `artifacts/${appId}/users/${uid}/trade_journal`;
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

    /**
     * Renders journal entries to the list
     */
    const renderJournal = () => {
        if (journalEntries.length === 0) {
            return <li className="text-gray-500 text-sm">No journal entries.</li>;
        }
        return journalEntries.map(entry => (
            <li key={entry.id} className="bg-gray-700 p-3 rounded-lg text-sm">
                <p>{entry.note}</p>
                <span className="text-xs text-gray-400">{new Date(entry.createdAt.toDate()).toLocaleString()}</span>
            </li>
        ));
    };

    /**
     * Adds a new journal entry to Firestore
     */
    const addJournalEntry = async (e) => {
        e.preventDefault();
        const note = e.target.elements.journalInput.value;
        if (!note || !userId) return;
        
        const journalCollectionPath = `artifacts/${appId}/users/${userId}/trade_journal`;
        
        try {
            await addDoc(collection(db, journalCollectionPath), {
                note: note,
                createdAt: new Date()
            });
            e.target.elements.journalInput.value = ''; // Clear input
        } catch (error) {
            console.error("Error adding journal entry:", error);
            showMessage("Failed to save journal entry.", true);
        }
    };

    // --- UI Helpers ---
    const showMessage = (text, isError = false) => {
        setMessage({ text, isError, show: true });
        setTimeout(() => {
            setMessage({ text: '', isError: false, show: false });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Left side - Brand */}
                        <div className="flex items-center">
                            <Link 
                                href="/dashboard" 
                                className="text-xl font-bold text-gray-800"
                            >
                                Market<span className="text-blue-600">IQ</span>
                            </Link>
                        </div>

                        {/* Right side - Navigation */}
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

            <div className="container mx-auto p-4 max-w-7xl text-gray-800">
                {/* User Status */}
                <div className="text-sm text-gray-500 mb-4">
                    {isAuthReady ? `User: ${userId}` : 'Connecting...'}
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel: Trade Execution */}
                    <div className="lg:w-1/3 w-full bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
                        <h2 className="text-xl font-semibold mb-4 border-b border-gray-200 pb-2">{currentSymbol}</h2>

                        {/* Message Box */}
                        {message.show && (
                            <div className={`p-3 rounded-lg text-sm mb-4 ${
                                message.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Volume */}
                            <div>
                                <label htmlFor="lots-input" className="block text-sm font-medium text-gray-600 mb-1">
                                    Volume (Lots)
                                </label>
                                <input
                                    type="number"
                                    id="lots-input"
                                    value={lots}
                                    onChange={(e) => setLots(e.target.value)}
                                    step="0.01"
                                    min="0.01"
                                    className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Take Profit */}
                            <div>
                                <label htmlFor="tp-input" className="block text-sm font-medium text-gray-600 mb-1">
                                    Take Profit (Price)
                                </label>
                                <input
                                    type="number"
                                    id="tp-input"
                                    value={takeProfit}
                                    onChange={(e) => setTakeProfit(e.target.value)}
                                    placeholder="Not set"
                                    className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Stop Loss */}
                            <div>
                                <label htmlFor="sl-input" className="block text-sm font-medium text-gray-600 mb-1">
                                    Stop Loss (Price)
                                </label>
                                <input
                                    type="number"
                                    id="sl-input"
                                    value={stopLoss}
                                    onChange={(e) => setStopLoss(e.target.value)}
                                    placeholder="Not set"
                                    className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Buy/Sell Buttons */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => placeTrade('sell')}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                                >
                                    SELL
                                </button>
                                <button
                                    onClick={() => placeTrade('buy')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                                >
                                    BUY
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Positions & Journal */}
                    <div className="lg:w-2/3 w-full space-y-6">
                        {/* Positions Table */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold">Open Positions</h2>
                                {isLoading && (
                                    <div className="loader w-5 h-5 rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                )}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 uppercase">
                                        <tr>
                                            <th className="py-3 px-3"></th>
                                            <th className="py-3 px-3">ID</th>
                                            <th className="py-3 px-3">Symbol</th>
                                            <th className="py-3 px-3">Side</th>
                                            <th className="py-3 px-3">Volume</th>
                                            <th className="py-3 px-3">Open Price</th>
                                            <th className="py-3 px-3">SL</th>
                                            <th className="py-3 px-3">TP</th>
                                            <th className="py-3 px-3">P&L</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {renderPositions()}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Trade Journal */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                            <h2 className="text-xl font-semibold mb-3">Trade Journal</h2>
                            <form className="mb-4" onSubmit={addJournalEntry}>
                                <textarea
                                    id="journalInput"
                                    rows="3"
                                    className="w-full bg-white text-gray-800 p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add a note about your trades..."
                                ></textarea>
                                <button
                                    type="submit"
                                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Save Note
                                </button>
                            </form>
                            <ul className="space-y-3 max-h-60 overflow-y-auto">
                                {renderJournal()}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

