import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const ensureFirebaseAuth = async () => {
    if (auth.currentUser) {
        return auth.currentUser;
    }

    const credential = await signInAnonymously(auth);

    console.log("🔥 Firebase Anonymous Authentication successful");

    return credential.user;
};

export default app;
export const apiFetch = async (
    endpoint: string,
    options: RequestInit = {}
) => {
    const user = await ensureFirebaseAuth();

    const token = await user.getIdToken();

    const headers = new Headers(options.headers);

    headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");

    const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL || "";

    return fetch(`${apiBaseUrl}${endpoint}`, {
        ...options,
        headers,
    });
};