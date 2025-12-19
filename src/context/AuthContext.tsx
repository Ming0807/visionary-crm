"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Types
interface LiffProfile {
    userId: string;
    displayName: string;
    pictureUrl?: string;
    statusMessage?: string;
}

interface Customer {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    profileImageUrl: string | null;
    tier: string;
    points: number;
    profileStatus: "incomplete" | "complete";
    birthday: string | null;
    address_json: { full?: string } | null;
}

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    profile: LiffProfile | null;
    customer: Customer | null;
    authMethod: "line" | "email" | null;
    login: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [authMethod, setAuthMethod] = useState<"line" | "email" | null>(null);
    const [liff, setLiff] = useState<typeof import("@line/liff").default | null>(null);

    // Check session on mount
    useEffect(() => {
        const checkSession = async () => {
            try {
                // First check email session
                const sessionRes = await fetch("/api/auth/session");
                const sessionData = await sessionRes.json();

                if (sessionData.customer) {
                    setCustomer(sessionData.customer);
                    setIsLoggedIn(true);
                    setAuthMethod("email");
                    setIsLoading(false);
                    return;
                }

                // Then try LINE LIFF
                const liffModule = (await import("@line/liff")).default;
                await liffModule.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
                setLiff(liffModule);

                if (liffModule.isLoggedIn()) {
                    setIsLoggedIn(true);
                    setAuthMethod("line");
                    const liffProfile = await liffModule.getProfile();
                    setProfile(liffProfile);
                    await syncCustomer(liffProfile);
                }
            } catch (error) {
                console.error("Auth init error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    // Sync customer with database (for LINE login)
    const syncCustomer = async (liffProfile: LiffProfile) => {
        try {
            const res = await fetch("/api/auth/customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lineUserId: liffProfile.userId,
                    displayName: liffProfile.displayName,
                    pictureUrl: liffProfile.pictureUrl,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setCustomer(data.customer);
            }
        } catch (error) {
            console.error("Sync customer error:", error);
        }
    };

    // LINE Login
    const login = async () => {
        if (liff && !liff.isLoggedIn()) {
            liff.login();
        }
    };

    // Email Login
    const loginWithEmail = async (email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            setCustomer(data.customer);
            setIsLoggedIn(true);
            setAuthMethod("email");
            return { success: true };
        } catch {
            return { success: false, error: "เกิดข้อผิดพลาด" };
        }
    };

    // Email Register
    const registerWithEmail = async (name: string, email: string, password: string) => {
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error };
            }

            setCustomer(data.customer);
            setIsLoggedIn(true);
            setAuthMethod("email");
            return { success: true };
        } catch {
            return { success: false, error: "เกิดข้อผิดพลาด" };
        }
    };

    // Logout (handles both LINE and email)
    const logout = async () => {
        try {
            // Clear email session
            await fetch("/api/auth/session", { method: "DELETE" });

            // Logout from LINE if logged in via LINE
            if (authMethod === "line" && liff && liff.isLoggedIn()) {
                liff.logout();
            }

            setIsLoggedIn(false);
            setProfile(null);
            setCustomer(null);
            setAuthMethod(null);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Refresh customer data
    const refreshCustomer = async () => {
        if (authMethod === "line" && profile) {
            await syncCustomer(profile);
        } else if (authMethod === "email") {
            const res = await fetch("/api/auth/session");
            const data = await res.json();
            if (data.customer) {
                setCustomer(data.customer);
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                isLoading,
                profile,
                customer,
                authMethod,
                login,
                loginWithEmail,
                registerWithEmail,
                logout,
                refreshCustomer,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
