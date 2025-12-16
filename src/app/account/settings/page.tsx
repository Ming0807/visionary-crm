"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Bell, Shield, Loader2, Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading, customer, profile, refreshCustomer, logout } = useAuth();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [form, setForm] = useState({
        name: customer?.name || profile?.displayName || "",
        phone: customer?.phone || "",
        email: customer?.email || "",
        address: "",
        birthday: customer?.birthday || "",
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isLoggedIn) {
        router.push("/");
        return null;
    }

    const handleSave = async () => {
        if (!customer?.id) return;
        setIsSaving(true);
        
        try {
            const { error } = await supabase
                .from("customers")
                .update({
                    name: form.name,
                    phone: form.phone,
                    email: form.email || null,
                    address_json: form.address ? { full: form.address } : null,
                    birthday: form.birthday || null,
                })
                .eq("id", customer.id);

            if (error) throw error;

            toast({ title: "บันทึกสำเร็จ!" });
            refreshCustomer();
        } catch {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.push("/account")}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">ตั้งค่าบัญชี</h1>
            </div>

            {/* Profile Settings */}
            <Card className="p-6 mb-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <User className="h-5 w-5" />
                    ข้อมูลส่วนตัว
                </h2>
                <div className="space-y-4">
                    <div>
                        <Label>ชื่อ-นามสกุล</Label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>เบอร์โทรศัพท์</Label>
                        <Input
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label>ที่อยู่จัดส่ง</Label>
                        <Textarea
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label className="flex items-center gap-2">
                            <Cake className="h-4 w-4" />
                            วันเกิด
                        </Label>
                        <Input
                            type="date"
                            value={form.birthday}
                            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">รับส่วนลดพิเศษวันเกิด!</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        บันทึก
                    </Button>
                </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6 mb-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <Bell className="h-5 w-5" />
                    การแจ้งเตือน
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">แจ้งเตือนสถานะ Order</p>
                            <p className="text-sm text-muted-foreground">รับแจ้งเตือนเมื่อ order เปลี่ยนสถานะ</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">โปรโมชั่นและข่าวสาร</p>
                            <p className="text-sm text-muted-foreground">รับข้อเสนอพิเศษและส่วนลด</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </Card>

            {/* Account */}
            <Card className="p-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5" />
                    บัญชี
                </h2>
                <Button variant="destructive" onClick={logout}>
                    ออกจากระบบ
                </Button>
            </Card>
        </div>
    );
}
