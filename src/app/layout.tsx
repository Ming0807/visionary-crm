import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import LayoutWrapper from "@/components/LayoutWrapper";

// Optimized font loading
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap", // Better LCP - show fallback immediately
  preload: true,
});

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d97706",
};

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: "The Visionary | Premium Eyewear Thailand",
    template: "%s | The Visionary",
  },
  description: "ร้านแว่นตาพรีเมียม แว่นกันแดด แว่นสายตา คอนแทคเลนส์ คุณภาพสูง. Premium eyewear crafted for those who see the world differently.",
  keywords: ["eyewear", "sunglasses", "eyeglasses", "แว่นตา", "แว่นกันแดด", "optical", "fashion", "premium", "Thailand"],
  authors: [{ name: "The Visionary" }],
  creator: "The Visionary",
  metadataBase: new URL("https://thevisionary.co.th"),
  openGraph: {
    type: "website",
    locale: "th_TH",
    alternateLocale: "en_US",
    siteName: "The Visionary",
    title: "The Visionary | Premium Eyewear Thailand",
    description: "ร้านแว่นตาพรีเมียม แว่นกันแดด แว่นสายตา คอนแทคเลนส์ คุณภาพสูง",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Visionary | Premium Eyewear",
    description: "Premium eyewear crafted for those who see the world differently",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
