'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [idToken, setIdToken] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                setUser(user);
                setIdToken(token);
                setIsAuthReady(true);
            } else {
                setUser(null);
                setIdToken(null);
                setIsAuthReady(false);
            }
        });

        (async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        })();

        return () => unsubscribe();
    }, []);

    return { user, idToken, isAuthReady };
}
