"use client";

import { forwardRef } from "react";

interface OrderData {
    id: string;
    order_number: string;
    created_at: string;
    total_amount: number;
    subtotal: number;
    shipping_cost: number;
    discount_amount?: number;
    payment_status: string;
    fulfillment_status: string;
    shipping_address?: {
        street?: string;
        district?: string;
        province?: string;
        postalCode?: string;
    };
    customer?: {
        name: string;
        phone: string;
        email?: string;
    };
    items?: Array<{
        id: string;
        product_name: string;
        sku?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
}

interface PrintInvoiceProps {
    order: OrderData;
    type?: "invoice" | "packing";
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(price);
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const PrintInvoice = forwardRef<HTMLDivElement, PrintInvoiceProps>(
    ({ order, type = "invoice" }, ref) => {
        const isInvoice = type === "invoice";

        return (
            <div
                ref={ref}
                className="p-8 bg-white text-black min-h-[297mm] w-[210mm] mx-auto"
                style={{ fontFamily: "Sarabun, sans-serif" }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            The Visionary
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">Premium Eyewear</p>
                        <p className="text-sm text-gray-500 mt-2">
                            123 Sukhumvit Road, Bangkok 10110
                        </p>
                        <p className="text-sm text-gray-500">Tel: 02-XXX-XXXX</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-gray-800">
                            {isInvoice ? "ใบเสร็จรับเงิน / Invoice" : "ใบจัดส่งสินค้า / Packing Slip"}
                        </h2>
                        <p className="text-lg font-mono mt-2 text-primary">
                            #{order.order_number}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            วันที่: {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-8">
                    <h3 className="font-semibold text-gray-700 mb-2">ข้อมูลลูกค้า</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">{order.customer?.name || "N/A"}</p>
                        <p className="text-sm text-gray-600">{order.customer?.phone}</p>
                        {order.customer?.email && (
                            <p className="text-sm text-gray-600">{order.customer.email}</p>
                        )}
                        {order.shipping_address && (
                            <p className="text-sm text-gray-600 mt-2">
                                {order.shipping_address.street}
                                {order.shipping_address.district && `, ${order.shipping_address.district}`}
                                {order.shipping_address.province && `, ${order.shipping_address.province}`}
                                {order.shipping_address.postalCode && ` ${order.shipping_address.postalCode}`}
                            </p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 text-sm font-semibold text-gray-700">#</th>
                                <th className="text-left py-3 text-sm font-semibold text-gray-700">รายการ</th>
                                <th className="text-center py-3 text-sm font-semibold text-gray-700">จำนวน</th>
                                {isInvoice && (
                                    <>
                                        <th className="text-right py-3 text-sm font-semibold text-gray-700">ราคา/หน่วย</th>
                                        <th className="text-right py-3 text-sm font-semibold text-gray-700">รวม</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {order.items?.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-3 text-sm">{index + 1}</td>
                                    <td className="py-3">
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        {item.sku && (
                                            <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                                        )}
                                    </td>
                                    <td className="py-3 text-center text-sm">{item.quantity}</td>
                                    {isInvoice && (
                                        <>
                                            <td className="py-3 text-right text-sm">฿{formatPrice(item.unit_price)}</td>
                                            <td className="py-3 text-right text-sm font-medium">฿{formatPrice(item.total_price)}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals - Only for Invoice */}
                {isInvoice && (
                    <div className="flex justify-end mb-8">
                        <div className="w-64">
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-gray-600">ยอดสินค้า</span>
                                <span>฿{formatPrice(order.subtotal || 0)}</span>
                            </div>
                            {order.discount_amount && order.discount_amount > 0 && (
                                <div className="flex justify-between py-2 text-sm text-green-600">
                                    <span>ส่วนลด</span>
                                    <span>-฿{formatPrice(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 text-sm">
                                <span className="text-gray-600">ค่าจัดส่ง</span>
                                <span>฿{formatPrice(order.shipping_cost || 0)}</span>
                            </div>
                            <div className="flex justify-between py-3 text-lg font-bold border-t-2 border-gray-200 mt-2">
                                <span>รวมทั้งสิ้น</span>
                                <span className="text-primary">฿{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    <p>ขอบคุณที่ใช้บริการ The Visionary</p>
                    <p className="mt-1">Thank you for shopping with us</p>
                </div>

                {/* Print Styles */}
                <style jsx>{`
                    @media print {
                        @page {
                            size: A4;
                            margin: 10mm;
                        }
                    }
                `}</style>
            </div>
        );
    }
);

PrintInvoice.displayName = "PrintInvoice";

// Helper function to trigger print
export function printOrder(printRef: React.RefObject<HTMLDivElement | null>) {
    if (printRef.current) {
        const printContent = printRef.current.innerHTML;
        const printWindow = window.open("", "_blank");
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print</title>
                    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Sarabun', sans-serif; }
                        .text-primary { color: #d97706; }
                        .text-green-600 { color: #16a34a; }
                        @media print { @page { size: A4; margin: 10mm; } }
                    </style>
                </head>
                <body>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    }
}
