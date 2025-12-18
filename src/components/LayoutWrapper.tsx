"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicFavicon from "@/components/DynamicFavicon";
import { StoreConfigProvider } from "@/context/StoreConfigContext";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't show frontend Navbar/Footer on admin routes
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <StoreConfigProvider>
      <DynamicFavicon />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </StoreConfigProvider>
  );
}

