"use client";

import { useState } from "react";
import Image from "next/image";
import { X, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface ProfileCompletionProps {
    customer: {
        id: string;
        name: string | null;
        phone: string | null;
        email: string | null;
        profileImageUrl: string | null;
    };
    onClose: () => void;
    onSave: () => void;
}

export default function ProfileCompletion({ customer, onClose, onSave }: ProfileCompletionProps) {
    const { profile } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: customer.name || profile?.displayName || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: "",
        birthday: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.phone) {
            toast({
                title: "กรุณากรอกเบอร์โทรศัพท์",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("customers")
                .update({
                    name: form.name,
                    phone: form.phone,
                    email: form.email || null,
                    address_json: form.address ? { full: form.address } : null,
                    birthday: form.birthday || null,
                    profile_status: "complete",
                })
                .eq("id", customer.id);

            if (error) throw error;

            toast({
                title: "บันทึกข้อมูลสำเร็จ",
                description: "ข้อมูลของคุณถูกอัพเดทแล้ว",
            });
            onSave();
        } catch (error) {
            console.error("Save error:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถบันทึกข้อมูลได้",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-background rounded-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-6">
                    {profile?.pictureUrl ? (
                        <Image
                            src={profile.pictureUrl}
                            alt={profile.displayName}
                            width={80}
                            height={80}
                            className="rounded-full mx-auto mb-3"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                            <User className="h-10 w-10 text-primary" />
                        </div>
                    )}
                    <h2 className="text-xl font-bold">กรอกข้อมูลของคุณ</h2>
                    <p className="text-sm text-muted-foreground">
                        เพื่อสั่งซื้อสินค้าและรับสิทธิพิเศษ
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="สมชาย ใจดี"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="0812345678"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (ถ้ามี)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="email@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">ที่อยู่จัดส่ง</Label>
                        <Textarea
                            id="address"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="123 ถ.สุขุมวิท แขวงคลองตัน เขตวัฒนา กทม. 10110"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthday">วันเกิด 🎂</Label>
                        <Input
                            id="birthday"
                            type="date"
                            value={form.birthday}
                            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">รับส่วนลดพิเศษวันเกิดของคุณ!</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            ภายหลัง
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                "บันทึกข้อมูล"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
