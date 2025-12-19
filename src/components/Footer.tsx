"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, MessageCircle, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { useStoreConfig } from "@/context/StoreConfigContext";

const footerLinks = {
  shop: [
    { label: "แว่นกันแดด", href: "/products?category=Sunglasses" },
    { label: "แว่นสายตา", href: "/products?category=Eyeglasses" },
    { label: "เลนส์", href: "/products?category=Lenses" },
    { label: "อุปกรณ์เสริม", href: "/products?category=Accessories" },
    { label: "สินค้าใหม่", href: "/products?sort=newest" },
  ],
  company: [
    { label: "เกี่ยวกับเรา", href: "/about" },
    { label: "ติดต่อเรา", href: "/contact" },
    { label: "สมัครงาน", href: "/careers" },
    { label: "บล็อก", href: "/blog" },
  ],
  support: [
    { label: "คำถามที่พบบ่อย", href: "/faq" },
    { label: "วิธีการสั่งซื้อ", href: "/how-to-order" },
    { label: "การจัดส่ง", href: "/shipping" },
    { label: "เคลม / คืนสินค้า", href: "/claims" },
    { label: "วิธีเลือกเลนส์", href: "/lens-guide" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/thevisionary", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/thevisionary", label: "Instagram" },
  { icon: MessageCircle, href: "https://lin.ee/Y0lv8Nr", label: "LINE" },
];

const paymentMethods = ["VISA", "Mastercard", "PromptPay", "SCB", "TrueMoney"];

export default function Footer() {
  const { config } = useStoreConfig();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              {config.logo ? (
                <Image src={config.logo} alt={config.siteName} width={120} height={40} className="h-8 w-auto object-contain" />
              ) : (
                <span className="text-2xl font-bold">
                  {config.siteName.includes(" ") ? (
                    <>
                      {config.siteName.split(" ")[0]}{" "}
                      <span className="text-primary">{config.siteName.split(" ").slice(1).join(" ")}</span>
                    </>
                  ) : (
                    <span className="text-primary">{config.siteName}</span>
                  )}
                </span>
              )}
            </Link>
            <p className="text-background/70 text-sm mb-6">
              ร้านแว่นตาพรีเมียม สำหรับผู้ที่มองโลกต่างออกไป
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>

            {/* Payment Methods */}
            <div>
              <p className="text-xs text-background/50 mb-2">ช่องทางชำระเงิน</p>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="px-2 py-1 text-xs bg-background/10 rounded text-background/70"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">สินค้า</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">เกี่ยวกับ</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">ช่วยเหลือ</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-semibold mb-4 text-background">ติดต่อเรา</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span>{config.address || "Bangkok, Thailand"}</span>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>{config.phone || "02-XXX-XXXX"}</span>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <MessageCircle className="h-5 w-5 flex-shrink-0" />
                <span>LINE: {config.lineId || "@thevisionary"}</span>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>{config.email || "contact@thevisionary.com"}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-background/60 text-sm">
            © {new Date().getFullYear()} {config.siteName || "The Visionary"}. สงวนลิขสิทธิ์
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-background/60 hover:text-background text-sm transition-colors">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="text-background/60 hover:text-background text-sm transition-colors">
              ข้อกำหนดการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

