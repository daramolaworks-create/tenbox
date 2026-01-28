import 'react-native-url-polyfill/auto';
import { createClient, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
    global: {
        fetch: fetch.bind(globalThis), // Ensure proper fetch binding for React Native
    },
});

// Session state tracking for reliable session access on Android
let currentSession: Session | null = null;
let sessionInitialized = false;
let sessionResolvers: Array<() => void> = [];

// Initialize auth state listener - this fires when AsyncStorage is ready
supabase.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    if (!sessionInitialized) {
        sessionInitialized = true;
        sessionResolvers.forEach(resolve => resolve());
        sessionResolvers = [];
    }

    // Notify any registered listeners about auth state changes
    if (authStateCallback) {
        authStateCallback(event, session);
    }
});

// Callback for store to register
let authStateCallback: ((event: string, session: Session | null) => void) | null = null;

/**
 * Register a callback that fires when auth state changes.
 * Used by the store to reactively update isAuthenticated.
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
    authStateCallback = callback;
};

/**
 * Get session reliably on Android.
 * Unlike getSession(), this waits for AsyncStorage to initialize first.
 */
export const getSessionReliably = async (): Promise<Session | null> => {
    if (sessionInitialized) {
        return currentSession;
    }
    // Wait for session to be initialized from AsyncStorage
    await new Promise<void>((resolve) => {
        sessionResolvers.push(resolve);
    });
    return currentSession;
};
