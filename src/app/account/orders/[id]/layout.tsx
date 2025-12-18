import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "รายละเอียดคำสั่งซื้อ | The Visionary",
    description: "ดูรายละเอียดคำสั่งซื้อ สถานะจัดส่ง และรายการสินค้าที่สั่งซื้อ",
    robots: "noindex, nofollow", // Private page
};

export default function OrderDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
