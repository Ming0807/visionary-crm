"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { login: lineLogin, loginWithEmail } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast({ title: "กรุณากรอก email และ password", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const result = await loginWithEmail(form.email, form.password);

            if (!result.success) {
                toast({ title: result.error || "เกิดข้อผิดพลาด", variant: "destructive" });
                return;
            }

            toast({ title: "เข้าสู่ระบบสำเร็จ! 🎉" });
            router.push("/");
        } catch {
            toast({ title: "เกิดข้อผิดพลาด กรุณาลองใหม่", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
                    <p className="text-muted-foreground mt-1">ยินดีต้อนรับกลับ!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="pl-10"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            {/* <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                ลืมรหัสผ่าน?
                            </Link> */}
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="รหัสผ่าน"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="pl-10 pr-10"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <LogIn className="h-4 w-4 mr-2" />
                        )}
                        เข้าสู่ระบบ
                    </Button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">หรือ</span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={lineLogin}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#00B900">
                        <path d="M12 2C6.48 2 2 5.88 2 10.5c0 3.89 3.13 7.14 7.42 7.93.29.06.68.19.78.43.09.22.06.56.03.78l-.13.78c-.04.22-.18.87.75.47 4.04-1.75 6.75-5.17 6.75-9.39C22 5.88 17.52 2 12 2z"/>
                    </svg>
                    เข้าสู่ระบบด้วย LINE
                </Button>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    ยังไม่มีบัญชี?{" "}
                    <Link href="/register" className="text-primary hover:underline font-medium">
                        สมัครสมาชิก
                    </Link>
                </p>
            </Card>
        </div>
    );
}
