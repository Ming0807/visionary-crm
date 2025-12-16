"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings,
  ChevronRight,
  MessageSquare,
  FileText,
  Tag,
  Megaphone,
  Boxes,
  LogOut,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/claims", label: "Claims", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("");
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    // Skip fetch for login page
    if (isLoginPage) return;
    
    // Check session
    fetch("/api/auth/admin")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setAdminName(data.admin.name);
        }
      })
      .catch(() => {});
  }, [isLoginPage]);

  const handleLogout = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  // Render only children for login page (no sidebar)
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:flex lg:flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Admin Panel</h2>
          <p className="text-sm text-muted-foreground">Manage your store</p>
        </div>
        
        <nav className="px-3 flex-1">
          <ul className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                    <ChevronRight className="h-4 w-4 ml-auto opacity-50" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminName || "Admin"}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        {children}
      </main>
    </div>
  );
}


