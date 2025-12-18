"use client";

import { useState } from "react";
import { Mail, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSubmitted(true);
        setIsLoading(false);
    };

    return (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>

                    {/* Header */}
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        รับข่าวสารและโปรโมชั่น
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        สมัครรับข่าวสารจากเรา รับส่วนลด 10% สำหรับออเดอร์แรก และรับสิทธิพิเศษก่อนใคร
                    </p>

                    {/* Form */}
                    {isSubmitted ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-foreground">สมัครสำเร็จ!</p>
                                <p className="text-sm text-muted-foreground">
                                    รหัสส่วนลด WELCOME10 ส่งไปทางอีเมลแล้วคะ
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Input
                                    type="email"
                                    placeholder="กรอกอีเมลของคุณ"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 pl-4 pr-4 rounded-full border-border focus:border-primary"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className="h-12 px-8 rounded-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        กำลังสมัคร...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        สมัครเลย
                                        <Send className="h-4 w-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}

                    {/* Trust badges */}
                    <p className="text-xs text-muted-foreground mt-4">
                        🔒 ไม่มีสแปม ยกเลิกได้ตลอดเวลา
                    </p>
                </div>
            </div>
        </section>
    );
}
