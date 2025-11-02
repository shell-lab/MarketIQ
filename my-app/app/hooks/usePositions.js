'use client';

import { useState, useEffect } from 'react';

export default function usePositions(idToken) {
    const [openPositions, setOpenPositions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOpenPositions = async () => {
        if (!idToken) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/v1/positions', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
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
            setError(error.message);
            // Keep stale data if fetch fails?
            // setOpenPositions([]); 
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenPositions();
    }, [idToken]);

    return { openPositions, isLoading, error, fetchOpenPositions };
}
