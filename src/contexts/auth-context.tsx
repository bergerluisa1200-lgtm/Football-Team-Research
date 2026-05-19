"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { type Plan } from "@/lib/plans";

interface UserData {
  plan: Plan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

interface AuthContextValue {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (uid: string) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      setUserData(snap.data() as UserData);
    }
  }, []);

  const setSessionCookie = useCallback(async (firebaseUser: User) => {
    const idToken = await firebaseUser.getIdToken();
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Refresh the proxy's session cookie BEFORE flipping `loading` to
        // false. Pages that key off `loading` (e.g. /login's redirect-if-
        // signed-in effect) will only fire once the cookie is actually
        // written — otherwise we race the cookie write and the proxy
        // bounces us back to /login.
        try {
          await setSessionCookie(firebaseUser);
        } catch (err) {
          console.warn("Failed to refresh session cookie:", err);
        }
        setUser(firebaseUser);
        await fetchUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchUserData, setSessionCookie]);

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await setSessionCookie(cred.user);
  }, [setSessionCookie]);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        displayName: name,
        plan: "free" as Plan,
        createdAt: new Date().toISOString(),
      });
      setUserData({ plan: "free" });
      await setSessionCookie(cred.user);
    },
    [setSessionCookie]
  );

  const signOutFn = useCallback(async () => {
    await firebaseSignOut(auth);
    await fetch("/api/session", { method: "DELETE" });
    setUser(null);
    setUserData(null);
  }, []);

  const refreshUserData = useCallback(async () => {
    if (user) {
      await fetchUserData(user.uid);
    }
  }, [user, fetchUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut: signOutFn,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
