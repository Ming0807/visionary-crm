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
            <div className="bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg px-1.5 sm:px-3 py-1 sm:py-2 min-w-[36px] sm:min-w-[60px]">
                <span className="text-base sm:text-2xl lg:text-3xl font-bold text-white tabular-nums">
                    {mounted ? value.toString().padStart(2, "0") : "--"}
                </span>
            </div>
            <span className="text-[9px] sm:text-xs text-white/80 mt-0.5 block leading-tight">{label}</span>
        </div>
    );

    return (
        <section className="py-4 sm:py-6 lg:py-8">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-orange-500 to-amber-500 p-4 sm:p-6 lg:p-10">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                    </div>

                    <div className="relative flex flex-col items-center gap-3 sm:gap-6 lg:flex-row lg:justify-between">
                        {/* Left: Text */}
                        <div className="text-center lg:text-left flex-shrink-0">
                            <span className="inline-block px-2 sm:px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-sm font-medium mb-1.5 sm:mb-3 animate-pulse">
                                {promo.title}
                            </span>
                            <h2 className="text-lg sm:text-2xl lg:text-4xl font-bold text-white mb-0.5 sm:mb-2">
                                {promo.subtitle}
                            </h2>
                            <p className="text-white/90 text-[11px] sm:text-sm lg:text-base max-w-[280px] sm:max-w-none mx-auto lg:mx-0 leading-snug">
                                แว่นตาแบรนด์ดังลดราคาเฉพาะช่วงนี้เท่านั้น!
                            </p>
                        </div>

                        {/* Center: Countdown - Compact on mobile */}
                        <div className="flex items-center gap-0.5 sm:gap-2">
                            <Clock className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-white/80 hidden xs:block" />
                            <div className="flex gap-0.5 sm:gap-2 items-start">
                                <TimeBlock value={timeLeft.days} label="วัน" />
                                <span className="text-sm sm:text-2xl text-white/80 mt-1 sm:mt-2 font-light">:</span>
                                <TimeBlock value={timeLeft.hours} label="ชม." />
                                <span className="text-sm sm:text-2xl text-white/80 mt-1 sm:mt-2 font-light">:</span>
                                <TimeBlock value={timeLeft.minutes} label="นาที" />
                                <span className="text-sm sm:text-2xl text-white/80 mt-1 sm:mt-2 font-light">:</span>
                                <TimeBlock value={timeLeft.seconds} label="วิ" />
                            </div>
                        </div>

                        {/* Right: CTA */}
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-5 sm:px-8 py-2.5 sm:py-3 font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                            asChild
                        >
                            <Link href="/products?sale=true">
                                ช้อปสินค้าลดราคา
                                <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
