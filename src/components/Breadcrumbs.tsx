"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

const pathLabels: Record<string, string> = {
    products: "สินค้า",
    collections: "คอลเลกชัน",
    about: "เกี่ยวกับเรา",
    contact: "ติดต่อเรา",
    faq: "คำถามที่พบบ่อย",
    shipping: "การจัดส่ง",
    privacy: "นโยบายความเป็นส่วนตัว",
    terms: "ข้อกำหนดการใช้งาน",
    search: "ค้นหา",
    tracking: "ติดตามพัสดุ",
    "lens-guide": "คู่มือเลือกเลนส์",
    "how-to-order": "วิธีสั่งซื้อ",
    checkout: "ชำระเงิน",
    account: "บัญชีของฉัน",
    claims: "เคลมสินค้า",
};

export default function Breadcrumbs({ productName }: { productName?: string }) {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    // Don't show on homepage
    if (segments.length === 0) return null;

    const items: BreadcrumbItem[] = [
        { label: "หน้าแรก", href: "/" },
    ];

    let currentPath = "";
    segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        
        // Skip dynamic segments like [id]
        if (segment.match(/^[0-9a-f-]{36}$/i)) {
            // This is a product ID
            if (productName) {
                items.push({ label: productName });
            }
        } else {
            const isLast = index === segments.length - 1;
            items.push({
                label: pathLabels[segment] || segment,
                href: isLast ? undefined : currentPath,
            });
        }
    });

    return (
        <nav className="container mx-auto px-4 py-3" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center gap-1 whitespace-nowrap">
                        {index > 0 && (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-foreground transition-colors flex items-center gap-1"
                            >
                                {index === 0 && <Home className="h-3.5 w-3.5" />}
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
