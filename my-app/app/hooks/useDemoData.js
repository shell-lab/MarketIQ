'use client';

import { useState, useEffect } from 'react';

export default function useDemoData(isAuthReady, DEMO_MODE) {
    const [demoPortfolio, setDemoPortfolio] = useState(null);
    const [demoHistory, setDemoHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDemoPortfolio = async () => {
        try {
            const res = await fetch('/api/demo-trade/portfolio');
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to fetch demo portfolio.');
            }
            const data = await res.json();
            setDemoPortfolio(data);
        } catch (err) {
            console.error('Error fetching demo portfolio', err);
            setError(err.message);
        }
    };

    const fetchDemoHistory = async () => {
        try {
            const res = await fetch('/api/demo-trade/history');
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to fetch demo history.');
            }
            const data = await res.json();
            setDemoHistory(data);
        } catch (err) {
            console.error('Error fetching demo trade history', err);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (DEMO_MODE && isAuthReady) {
            setIsLoading(true);
            setError(null);
            Promise.all([
                fetchDemoPortfolio(),
                fetchDemoHistory()
            ]).finally(() => setIsLoading(false));
        } else if (!DEMO_MODE) {
            setIsLoading(false);
        }
    }, [DEMO_MODE, isAuthReady]);

    return { demoPortfolio, demoHistory, isLoading, error, fetchDemoPortfolio, fetchDemoHistory };
}
