"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Bell, Shield, Loader2, Cake, Camera, X } from "lucide-react";
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
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        birthday: "",
    });

    // Get profile image URL - customer.profileImageUrl or LINE profile
    const profileImageUrl = customer?.profileImageUrl || profile?.pictureUrl;

    // Sync form with customer data when loaded
    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name || profile?.displayName || "",
                phone: customer.phone || "",
                email: customer.email || "",
                address: customer.address_json?.full || "",
                birthday: customer.birthday || "",
            });
        }
    }, [customer, profile]);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !customer?.id) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            toast({ title: "กรุณาเลือกไฟล์รูปภาพ", variant: "destructive" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: "ไฟล์ต้องมีขนาดไม่เกิน 5MB", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            // Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "profile");

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const { url } = await uploadRes.json();

            // Update customer profile_image_url
            const { error } = await supabase
                .from("customers")
                .update({ profile_image_url: url })
                .eq("id", customer.id);

            if (error) throw error;

            toast({ title: "อัพโหลดรูปสำเร็จ!" });
            refreshCustomer();
        } catch {
            toast({ title: "อัพโหลดไม่สำเร็จ", variant: "destructive" });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = async () => {
        if (!customer?.id) return;
        
        try {
            const { error } = await supabase
                .from("customers")
                .update({ profile_image_url: null })
                .eq("id", customer.id);

            if (error) throw error;

            toast({ title: "ลบรูปสำเร็จ" });
            refreshCustomer();
        } catch {
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
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

            {/* Profile Picture */}
            <Card className="p-6 mb-6">
                <h2 className="font-semibold flex items-center gap-2 mb-4">
                    <Camera className="h-5 w-5" />
                    รูปโปรไฟล์
                </h2>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {profileImageUrl ? (
                            <Image
                                src={profileImageUrl}
                                alt="Profile"
                                width={80}
                                height={80}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                        )}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                                เปลี่ยนรูป
                            </Button>
                            {customer?.profileImageUrl && (
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={handleRemoveImage}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    ลบ
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            รองรับ JPG, PNG ขนาดไม่เกิน 5MB
                        </p>
                    </div>
                </div>
            </Card>

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
