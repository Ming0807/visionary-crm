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
}

interface AuthContextType {
    isLoggedIn: boolean;
    isLoading: boolean;
    profile: LiffProfile | null;
    customer: Customer | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [liff, setLiff] = useState<typeof import("@line/liff").default | null>(null);

    // Initialize LIFF
    useEffect(() => {
        const initLiff = async () => {
            try {
                const liffModule = (await import("@line/liff")).default;
                await liffModule.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
                setLiff(liffModule);

                if (liffModule.isLoggedIn()) {
                    setIsLoggedIn(true);
                    const liffProfile = await liffModule.getProfile();
                    setProfile(liffProfile);

                    // Fetch or create customer
                    await syncCustomer(liffProfile);
                }
            } catch (error) {
                console.error("LIFF init error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initLiff();
    }, []);

    // Sync customer with database
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

    const login = async () => {
        if (liff && !liff.isLoggedIn()) {
            liff.login();
        }
    };

    const logout = async () => {
        if (liff && liff.isLoggedIn()) {
            liff.logout();
            setIsLoggedIn(false);
            setProfile(null);
            setCustomer(null);
            window.location.reload();
        }
    };

    const refreshCustomer = async () => {
        if (profile) {
            await syncCustomer(profile);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                isLoading,
                profile,
                customer,
                login,
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
