"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StoreConfig {
    siteName: string;
    logo: string;
    favicon: string;
    email: string;
    phone: string;
    address: string;
    lineId: string;
    freeShippingThreshold: number;
}

const defaultConfig: StoreConfig = {
    siteName: "The Visionary",
    logo: "",
    favicon: "",
    email: "contact@thevisionary.com",
    phone: "02-XXX-XXXX",
    address: "Bangkok, Thailand",
    lineId: "@thevisionary",
    freeShippingThreshold: 1500,
};

interface StoreConfigContextType {
    config: StoreConfig;
    loading: boolean;
    refetch: () => void;
}

const StoreConfigContext = createContext<StoreConfigContextType>({
    config: defaultConfig,
    loading: true,
    refetch: () => {},
});

export function StoreConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<StoreConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/settings/store_config");
            const data = await res.json();
            if (data?.value) {
                setConfig({ ...defaultConfig, ...data.value });
            }
        } catch (error) {
            console.error("Failed to fetch store config:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <StoreConfigContext.Provider value={{ config, loading, refetch: fetchConfig }}>
            {children}
        </StoreConfigContext.Provider>
    );
}

export function useStoreConfig() {
    return useContext(StoreConfigContext);
}
