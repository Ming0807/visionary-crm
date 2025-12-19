"use client";

import { useState, FormEvent } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const contactInfo = [
    {
        icon: MapPin,
        title: "ที่อยู่ร้าน",
        content: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        link: "https://maps.google.com",
        linkText: "ดูแผนที่",
    },
    {
        icon: Phone,
        title: "โทรศัพท์",
        content: "02-XXX-XXXX",
        link: "tel:02XXXXXXX",
        linkText: "โทรเลย",
    },
    {
        icon: Mail,
        title: "อีเมล",
        content: "hello@thevisionary.co.th",
        link: "mailto:hello@thevisionary.co.th",
        linkText: "ส่งอีเมล",
    },
    {
        icon: MessageCircle,
        title: "LINE Official",
        content: "@thevisionary",
        link: "https://lin.ee/Y0lv8Nr",
        linkText: "แชทเลย",
    },
];

const subjectOptions = [
    { value: "", label: "เลือกหัวข้อ" },
    { value: "product", label: "สอบถามสินค้า" },
    { value: "order", label: "สอบถามคำสั่งซื้อ" },
    { value: "warranty", label: "เคลมประกัน / ซ่อม" },
    { value: "other", label: "อื่นๆ" },
];

interface FormData {
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    subject?: string;
    message?: string;
}

export default function ContactPage() {
    const { toast } = useToast();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "กรุณากรอกชื่อ-นามสกุล";
        }

        if (!formData.phone.trim()) {
            newErrors.phone = "กรุณากรอกเบอร์โทรศัพท์";
        } else if (!/^0[0-9]{8,9}$/.test(formData.phone.replace(/-/g, ""))) {
            newErrors.phone = "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง";
        }

        if (!formData.subject) {
            newErrors.subject = "กรุณาเลือกหัวข้อ";
        }

        if (!formData.message.trim()) {
            newErrors.message = "กรุณากรอกข้อความ";
        } else if (formData.message.trim().length < 10) {
            newErrors.message = "ข้อความต้องมีอย่างน้อย 10 ตัวอักษร";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "กรุณาตรวจสอบข้อมูล",
                description: "กรอกข้อมูลให้ครบถ้วนก่อนส่ง",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    subject: "",
                    message: "",
                });
                toast({
                    title: "✅ ส่งข้อความสำเร็จ!",
                    description: "เราจะติดต่อกลับภายใน 24 ชั่วโมง",
                });

                // Reset success state after 5 seconds
                setTimeout(() => setIsSuccess(false), 5000);
            } else {
                throw new Error(data.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 sm:py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Contact Us
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">ติดต่อเรา</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                    มีคำถาม? ต้องการคำแนะนำ? ทีมงานพร้อมให้บริการคุณทุกวัน
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Contact Info */}
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-2xl p-5 sm:p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
                            >
                                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                                    <info.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 break-words">{info.content}</p>
                                <a
                                    href={info.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs sm:text-sm text-primary hover:underline font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                                >
                                    {info.linkText} →
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Hours */}
                    <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">เวลาทำการ</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">จันทร์ - ศุกร์</span>
                                <span className="text-foreground font-medium">10:00 - 21:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">เสาร์ - อาทิตย์</span>
                                <span className="text-foreground font-medium">10:00 - 22:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">วันหยุดนักขัตฤกษ์</span>
                                <span className="text-foreground font-medium">11:00 - 20:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">ส่งข้อความสำเร็จ!</h2>
                            <p className="text-muted-foreground mb-6">
                                ขอบคุณที่ติดต่อเรา เราจะตอบกลับภายใน 24 ชั่วโมง
                            </p>
                            <Button variant="outline" onClick={() => setIsSuccess(false)}>
                                ส่งข้อความอีกครั้ง
                            </Button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">ส่งข้อความถึงเรา</h2>
                            <p className="text-muted-foreground text-xs sm:text-sm mb-6">
                                กรอกแบบฟอร์มด้านล่าง เราจะติดต่อกลับภายใน 24 ชั่วโมง
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            ชื่อ-นามสกุล <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            placeholder="กรอกชื่อของคุณ"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
                                            disabled={isSubmitting}
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                                            เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            type="tel"
                                            placeholder="0XX-XXX-XXXX"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            className={cn(errors.phone && "border-red-500 focus-visible:ring-red-500")}
                                            disabled={isSubmitting}
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        อีเมล <span className="text-muted-foreground text-xs">(ไม่จำเป็น)</span>
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        หัวข้อ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange("subject", e.target.value)}
                                        className={cn(
                                            "w-full h-10 px-3 rounded-md border bg-background text-sm transition-colors",
                                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors.subject ? "border-red-500" : "border-border"
                                        )}
                                        disabled={isSubmitting}
                                    >
                                        {subjectOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.subject}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                                        ข้อความ <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className={cn(
                                            "w-full min-h-[120px] px-3 py-2 rounded-md border bg-background text-sm resize-none transition-colors",
                                            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                                            errors.message ? "border-red-500" : "border-border"
                                        )}
                                        placeholder="รายละเอียดที่ต้องการสอบถาม..."
                                        value={formData.message}
                                        onChange={(e) => handleInputChange("message", e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.message && (
                                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {errors.message}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1 text-right">
                                        {formData.message.length} ตัวอักษร
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                                    size="lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            กำลังส่ง...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            ส่งข้อความ
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Chat CTA */}
            <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-gradient-to-r from-[#00B900]/10 to-[#00B900]/5 rounded-2xl border border-[#00B900]/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <MessageCircle className="h-6 w-6 text-[#00B900]" />
                    <h3 className="text-lg font-bold text-foreground">แชทกับเราเลย!</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    ต้องการคำตอบเร็วขึ้น? พูดคุยกับเราทาง LINE ได้ตลอด 24 ชั่วโมง
                </p>
                <a
                    href="https://lin.ee/Y0lv8Nr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                >
                    <img 
                        src="https://scdn.line-apps.com/n/line_add_friends/btn/th.png" 
                        alt="เพิ่มเพื่อน" 
                        height="36" 
                        className="h-9 hover:opacity-90 transition-opacity"
                    />
                </a>
            </div>

            {/* Google Maps Embed */}
            <div className="mt-8 sm:mt-12 rounded-2xl overflow-hidden border border-border">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.7853235319876!2d101.28708787499323!3d6.548767593444241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31b37430f62893dd%3A0x1cb7c512b6083c5f!2z4Lih4Lir4Liy4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4Lij4Liy4LiK4Lig4Lix4LiP4Lii4Liw4Lil4Liy!5e0!3m2!1sth!2sth!4v1766135832992!5m2!1sth!2sth"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-[300px] sm:h-[400px]"
                    title="The Visionary Store Location"
                />
            </div>
        </div>
    );
}
