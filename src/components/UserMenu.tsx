"use client";

import Image from "next/image";
import { LogIn, LogOut, ChevronDown, User, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function UserMenu() {
    const { isLoggedIn, isLoading, profile, customer, login, logout } = useAuth();

    if (isLoading) {
        return (
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
        );
    }

    if (!isLoggedIn) {
        return (
            <Button onClick={login} variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login with LINE</span>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 p-1 pr-2">
                    {profile?.pictureUrl ? (
                        <Image
                            src={profile.pictureUrl}
                            alt={profile.displayName}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                    )}
                    <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                        {profile?.displayName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile?.displayName}</p>
                    {customer && (
                        <p className="text-xs text-muted-foreground">
                            {customer.tier.toUpperCase()} • {customer.points} points
                        </p>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/account" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        My Account
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/orders" className="cursor-pointer">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/account/settings" className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
