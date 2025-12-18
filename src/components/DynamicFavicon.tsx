"use client";

import { useEffect } from "react";
import { useStoreConfig } from "@/context/StoreConfigContext";

// Component to dynamically set favicon from store config
export default function DynamicFavicon() {
    const { config } = useStoreConfig();

    useEffect(() => {
        if (config.favicon) {
            // Find existing favicon link or create new
            let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
            
            if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
            }
            
            link.href = config.favicon;
            link.type = "image/x-icon";
            
            // Also set apple-touch-icon if it exists
            let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
            if (!appleLink) {
                appleLink = document.createElement("link");
                appleLink.rel = "apple-touch-icon";
                document.head.appendChild(appleLink);
            }
            appleLink.href = config.favicon;
        }
    }, [config.favicon]);

    return null;
}
