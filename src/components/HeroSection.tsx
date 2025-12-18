"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[600px] py-12 lg:py-20">
          {/* Left: Text Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left animate-fade-in">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                คอลเลกชันใหม่ 2024
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                ค้นหาแว่นตา
                <span className="block text-primary">ที่ใช่คุณ</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
                แว่นตาพรีเมียม สำหรับคนที่มองโลกต่างออกไป 
                ค้นหาสไตล์ของคุณวันนี้
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8"
                asChild
              >
                <Link href="/products">
                  เลือกชมคอลเลกชัน
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full px-8"
                asChild
              >
                <Link href="/about">
                  เกี่ยวกับเรา
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">สไตล์พรีเมียม</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">50K+</p>
                <p className="text-sm text-muted-foreground">ลูกค้าพึงพอใจ</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-foreground">5★</p>
                <p className="text-sm text-muted-foreground">คะแนนสูงสุด</p>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-card rounded-3xl shadow-premium">
                <Image
                  src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
                  alt="Premium sunglasses showcase"
                  fill
                  className="object-cover rounded-3xl"
                  priority
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-premium animate-slide-in-right">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">👓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">ส่งฟรี</p>
                    <p className="text-xs text-muted-foreground">เมื่อซื้อครบ ฿1,500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
