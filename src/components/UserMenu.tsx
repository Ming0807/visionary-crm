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

    // Wrapper for consistent sizing - responsive for mobile
    const Wrapper = ({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) => (
        <div className={fullWidth ? "w-full" : "min-w-[120px] sm:min-w-[140px] flex justify-end"}>
            {children}
        </div>
    );

    if (isLoading) {
        return (
            <Wrapper>
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            </Wrapper>
        );
    }

    if (!isLoggedIn) {
        return (
            <Wrapper fullWidth>
                <Button 
                    onClick={login} 
                    className="w-full sm:w-auto gap-3 font-medium py-6 sm:py-2 text-base sm:text-sm"
                    size="sm"
                >
                    {/* LINE Icon */}
                    <svg 
                        viewBox="0 0 24 24" 
                        className="h-6 w-6 sm:h-5 sm:w-5 fill-current"
                        aria-hidden="true"
                    >
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    <span>เข้าสู่ระบบด้วย LINE</span>
                </Button>
            </Wrapper>
        );
    }


    return (
        <Wrapper>
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
                        <span className="hidden sm:inline text-sm font-medium max-w-[80px] truncate">
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
        </Wrapper>
    );
}

