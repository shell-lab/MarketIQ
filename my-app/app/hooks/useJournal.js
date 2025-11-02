'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function useJournal(userId) {
    const [journalEntries, setJournalEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) {
            setJournalEntries([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const journalCollectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${userId}/trade_journal`;
        const q = query(collection(db, journalCollectionPath));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const entries = [];
            snapshot.forEach((doc) => {
                entries.push({ id: doc.id, ...doc.data() });
            });
            setJournalEntries(entries);
            setIsLoading(false);
        }, (err) => {
            console.error("Journal listener error:", err);
            setError("Could not load trade journal.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const addJournalEntry = async (note) => {
        if (!note || !userId) return;
        
        const journalCollectionPath = `artifacts/${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}/users/${userId}/trade_journal`;
        
        try {
            await addDoc(collection(db, journalCollectionPath), {
                note: note,
                createdAt: new Date()
            });
        } catch (err) {
            console.error("Error adding journal entry:", err);
            setError("Failed to save journal entry.");
        }
    };

    return { journalEntries, isLoading, error, addJournalEntry };
}
