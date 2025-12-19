"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Phone, MapPin, Cake, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

type Step = "register" | "complete-profile" | "success";

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { login: lineLogin, registerWithEmail, customer, refreshCustomer } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<Step>("register");
    
    // Registration form
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    // Profile completion form
    const [profileForm, setProfileForm] = useState({
        phone: "",
        address: "",
        birthday: "",
    });

    // Step 1: Register
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.password) {
            toast({ title: "กรุณากรอกข้อมูลให้ครบ", variant: "destructive" });
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast({ title: "รหัสผ่านไม่ตรงกัน", variant: "destructive" });
            return;
        }

        if (form.password.length < 6) {
            toast({ title: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const result = await registerWithEmail(form.name, form.email, form.password);

            if (!result.success) {
                toast({ title: result.error || "เกิดข้อผิดพลาด", variant: "destructive" });
                return;
            }

            toast({ title: "สมัครสมาชิกสำเร็จ! 🎉" });
            setStep("complete-profile");
        } catch {
            toast({ title: "เกิดข้อผิดพลาด กรุณาลองใหม่", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Complete Profile
    const handleCompleteProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!profileForm.phone) {
            toast({ title: "กรุณากรอกเบอร์โทรศัพท์", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("customers")
                .update({
                    phone: profileForm.phone,
                    address_json: profileForm.address ? { full: profileForm.address } : null,
                    birthday: profileForm.birthday || null,
                    profile_status: "complete",
                })
                .eq("id", customer?.id);

            if (error) throw error;

            await refreshCustomer();
            setStep("success");
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    // Skip profile completion
    const handleSkip = () => {
        router.push("/");
    };

    // Step 1: Registration Form
    if (step === "register") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
                <Card className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
                        <p className="text-muted-foreground mt-1">สร้างบัญชีเพื่อเริ่มช้อปปิ้ง</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="สมชาย ใจดี"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

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
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="อย่างน้อย 6 ตัวอักษร"
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <ArrowRight className="h-4 w-4 mr-2" />
                            )}
                            สมัครสมาชิก
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
                        สมัครด้วย LINE
                    </Button>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        มีบัญชีอยู่แล้ว?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            เข้าสู่ระบบ
                        </Link>
                    </p>
                </Card>
            </div>
        );
    }

    // Step 2: Complete Profile
    if (step === "complete-profile") {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
                <Card className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold">ยินดีต้อนรับ! 🎉</h1>
                        <p className="text-muted-foreground mt-1">
                            กรอกข้อมูลเพิ่มเติมเพื่อรับสิทธิพิเศษ
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">✓</div>
                        <div className="w-12 h-1 bg-primary rounded" />
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                    </div>

                    <form onSubmit={handleCompleteProfile} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-1">
                                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="0812345678"
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    className="pl-10"
                                    disabled={isLoading}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">สำหรับติดต่อเรื่องการสั่งซื้อ</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Textarea
                                    id="address"
                                    placeholder="123 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กทม. 10110"
                                    value={profileForm.address}
                                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                    className="pl-10 min-h-[80px]"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthday" className="flex items-center gap-2">
                                <Cake className="h-4 w-4" />
                                วันเกิด
                            </Label>
                            <Input
                                id="birthday"
                                type="date"
                                value={profileForm.birthday}
                                onChange={(e) => setProfileForm({ ...profileForm, birthday: e.target.value })}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">🎁 รับส่วนลดพิเศษวันเกิด!</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={handleSkip}
                                disabled={isLoading}
                            >
                                ข้ามไปก่อน
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                บันทึก
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    }

    // Step 3: Success
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-muted/30">
            <Card className="w-full max-w-md p-8 text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">พร้อมช้อปแล้ว!</h1>
                <p className="text-muted-foreground mb-6">
                    บัญชีของคุณพร้อมใช้งานแล้ว กำลังพาไปหน้าแรก...
                </p>
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </Card>
        </div>
    );
}
