"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useStoreConfig } from "@/context/StoreConfigContext";
import { Button } from "@/components/ui/button";
import CartDrawer from "@/components/CartDrawer";
import UserMenu from "@/components/UserMenu";

const navLinks = [
  { href: "/", label: "หน้าแรก" },
  { href: "/products", label: "สินค้า" },
  { href: "/collections", label: "คอลเลกชัน" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อ" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { config } = useStoreConfig();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo - Larger for brand visibility */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="h-16 py-1 min-w-[200px] flex items-center">
                {config.logo ? (
                  <img 
                    src={config.logo} 
                    alt={config.siteName} 
                    className="h-full w-auto max-w-[280px] object-contain"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">
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

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 animate-fade-in">
              <div className="flex flex-col space-y-2">
                {/* Mobile Navigation Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth px-4 py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Search */}
                <Link 
                  href="/search" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth px-4 py-3 rounded-lg flex items-center gap-2 sm:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  ค้นหา
                </Link>
              </div>
              
              {/* Mobile User Menu / Login - Full width centered */}
              <div className="mt-4 pt-4 border-t border-border sm:hidden">
                <div className="flex justify-center">
                  <UserMenu />
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      <CartDrawer />
    </>
  );
}
