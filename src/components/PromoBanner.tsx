"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface PromoSettings {
    enabled: boolean;
    title: string;
    subtitle: string;
    endDate: string | null;
    daysFromNow?: number;
}

const defaultPromo: PromoSettings = {
    enabled: true,
    title: "🔥 Flash Sale",
    subtitle: "ลดสูงสุด 50%",
    endDate: null,
    daysFromNow: 7,
};

export default function PromoBanner() {
    const [promo, setPromo] = useState<PromoSettings>(defaultPromo);
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [mounted, setMounted] = useState(false);

    // Fetch promo settings from DB
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings/promo_banner");
                const data = await res.json();
                if (data?.value) {
                    setPromo({ ...defaultPromo, ...data.value });
                }
            } catch (error) {
                console.error("Failed to fetch promo settings:", error);
            }
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!promo.enabled) return;

        setMounted(true);

        const getEndDate = () => {
            if (promo.endDate) {
                return new Date(promo.endDate);
            }
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (promo.daysFromNow || 7));
            endDate.setHours(23, 59, 59, 999);
            return endDate;
        };

        const endDate = getEndDate();

        const calculateTimeLeft = (): TimeLeft => {
            const difference = +endDate - +new Date();
            
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [promo]);

    // Don't render if disabled
    if (!promo.enabled) return null;

    const TimeBlock = ({ value, label }: { value: number; label: string }) => (
        <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-2xl lg:text-3xl font-bold text-white">
                    {mounted ? value.toString().padStart(2, "0") : "--"}
                </span>
            </div>
            <span className="text-xs text-white/80 mt-1 block">{label}</span>
        </div>
    );

    return (
        <section className="py-6 lg:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 p-6 lg:p-10">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Left: Text */}
                        <div className="text-center lg:text-left">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-3">
                                {promo.title}
                            </span>
                            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-2">
                                {promo.subtitle}
                            </h2>
                            <p className="text-white/90 text-sm lg:text-base">
                                แว่นตาแบรนด์ดังลดราคาเฉพาะช่วงนี้เท่านั้น!
                            </p>
                        </div>

                        {/* Center: Countdown */}
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-white/80 hidden sm:block" />
                            <div className="flex gap-2">
                                <TimeBlock value={timeLeft.days} label="วัน" />
                                <span className="text-2xl text-white self-start mt-2">:</span>
                                <TimeBlock value={timeLeft.hours} label="ชม." />
                                <span className="text-2xl text-white self-start mt-2">:</span>
                                <TimeBlock value={timeLeft.minutes} label="นาที" />
                                <span className="text-2xl text-white self-start mt-2">:</span>
                                <TimeBlock value={timeLeft.seconds} label="วินาที" />
                            </div>
                        </div>

                        {/* Right: CTA */}
                        <Button
                            size="lg"
                            className="bg-white text-primary hover:bg-white/90 rounded-full px-8 font-semibold"
                            asChild
                        >
                            <Link href="/products?sale=true">
                                ช้อปเลย
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
