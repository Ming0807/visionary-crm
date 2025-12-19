"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Search, Home, Package, Layers, Info, Phone, User } from "lucide-react";
import { useState, useCallback } from "react";
import { useCart } from "@/context/CartContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { Button } from "@/components/ui/button";
import CartDrawer from "@/components/CartDrawer";
import UserMenu from "@/components/UserMenu";

const navLinks = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/products", label: "สินค้า", icon: Package },
  { href: "/collections", label: "คอลเลกชัน", icon: Layers },
  { href: "/about", label: "เกี่ยวกับเรา", icon: Info },
  { href: "/contact", label: "ติดต่อ", icon: Phone },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { config } = useStoreConfig();

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Responsive sizing */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="h-12 md:h-16 py-1 min-w-[120px] md:min-w-[200px] flex items-center">
                {config.logo ? (
                  <img 
                    src={config.logo} 
                    alt={config.siteName} 
                    className="h-full w-auto max-w-[160px] md:max-w-[280px] object-contain"
                  />
                ) : (
                  <span className="text-lg md:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
                    {config.siteName.includes(" ") ? (
                      <>
                        {config.siteName.split(" ")[0]}{" "}
                        <span className="text-primary">{config.siteName.split(" ").slice(1).join(" ")}</span>
                      </>
                    ) : (
                      <span className="text-primary">{config.siteName}</span>
                    )}
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Link href="/search">
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">ค้นหา</span>
                </Button>
              </Link>

              {/* User Menu (Login/Profile) */}
              <div className="hidden sm:block">
                <UserMenu />
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Menu</span>
              </Button>
            </div>
          </div>

          {/* Mobile Menu - Enhanced with icons and better UX */}
          <div 
            className={`md:hidden border-t border-border overflow-hidden transition-all duration-300 ease-out ${
              isMobileMenuOpen 
                ? 'max-h-[500px] opacity-100 py-3' 
                : 'max-h-0 opacity-0 py-0'
            }`}
          >
            <div className="flex flex-col gap-1">
              {/* Mobile Navigation Links with Icons */}
              {navLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted transition-colors px-4 py-3.5 rounded-xl"
                    onClick={closeMobileMenu}
                  >
                    <IconComponent className="h-4 w-4 text-primary/70" />
                    {link.label}
                  </Link>
                );
              })}
              
              {/* Mobile Search */}
              <Link 
                href="/search" 
                className="flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted transition-colors px-4 py-3.5 rounded-xl sm:hidden"
                onClick={closeMobileMenu}
              >
                <Search className="h-4 w-4 text-primary/70" />
                ค้นหา
              </Link>
            </div>
            
            {/* Mobile User Menu / Login */}
            <div className="mt-3 pt-3 border-t border-border/50 sm:hidden">
              <div className="flex items-center justify-center gap-3 px-4 py-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <UserMenu />
              </div>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer />
    </>
  );
}
