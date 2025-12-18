import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "เขียนรีวิวสินค้า | The Visionary",
    description: "แบ่งปันประสบการณ์การใช้งานสินค้าของคุณ ช่วยลูกค้าท่านอื่นตัดสินใจ",
    robots: "noindex, nofollow", // Private page
};

export default function ReviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
