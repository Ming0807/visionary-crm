import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "คำสั่งซื้อของฉัน | The Visionary",
    description: "ดูประวัติคำสั่งซื้อ ติดตามสถานะจัดส่ง และเขียนรีวิวสินค้าที่ซื้อแล้ว",
    robots: "noindex, nofollow", // Private page
};

export default function OrdersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
