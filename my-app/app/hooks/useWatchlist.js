'use client';

import { useState, useEffect } from 'react';

export default function useWatchlist() {
    const [watchlist, setWatchlist] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/watchlist');
            if (response.ok) {
                const data = await response.json();
                setWatchlist(data.map((item) => item.symbol));
            } else {
                console.error("Failed to fetch watchlist");
                setWatchlist([]);
            }
        } catch (error) {
            console.error("Error fetching watchlist:", error);
            setWatchlist([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const toggleWatchlist = async (symbol) => {
        if (!symbol) return;
        try {
            const method = watchlist.includes(symbol) ? 'DELETE' : 'POST';
            const res = await fetch('/api/watchlist', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol }),
            });
            if (res.ok) {
                await fetchWatchlist();
            }
        } catch (err) {
            console.error('Error toggling watchlist:', err);
        }
    };

    return { watchlist, isLoading, toggleWatchlist, fetchWatchlist };
}
