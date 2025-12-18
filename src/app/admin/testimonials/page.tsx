"use client";

import { useState, useEffect } from "react";
import { Plus, Star, Edit, Trash2, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Testimonial {
    id: string;
    customer_id: string | null;
    customer_name: string;
    avatar_url: string;
    rating: number;
    comment: string;
    product_name: string;
    is_featured: boolean;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    profile_image_url: string;
    tier: string;
    order_count: number;
}

interface Product {
    name: string;
    brand: string;
}

export default function TestimonialsAdminPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [customerProducts, setCustomerProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [customerSearch, setCustomerSearch] = useState("");
    const [formData, setFormData] = useState({
        customer_id: "",
        customer_name: "",
        avatar_url: "",
        rating: 5,
        comment: "",
        product_name: "",
        is_featured: true,
        is_active: true,
        display_order: 0,
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchTestimonials();
        fetchCustomers("");
    }, []);

    const fetchTestimonials = async () => {
        try {
            // Fetch ALL testimonials including inactive for admin
            const res = await fetch("/api/testimonials?all=true");
            const data = await res.json();
            setTestimonials(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async (search: string) => {
        try {
            const res = await fetch(`/api/customers/with-orders?search=${encodeURIComponent(search)}`);
            const data = await res.json();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setCustomers([]);
        }
    };

    const fetchCustomerProducts = async (customerId: string) => {
        if (!customerId) {
            setCustomerProducts([]);
            return;
        }
        try {
            const res = await fetch(`/api/customers/${customerId}/products`);
            const data = await res.json();
            setCustomerProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setCustomerProducts([]);
        }
    };

    const handleCustomerSelect = (customer: Customer) => {
        setFormData({
            ...formData,
            customer_id: customer.id,
            customer_name: customer.name,
            avatar_url: customer.profile_image_url || "",
        });
        fetchCustomerProducts(customer.id);
        setCustomerSearch("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate - must have customer selected or be editing
        if (!formData.customer_id && !editingId) {
            toast({
                title: "ต้องเลือกลูกค้า",
                description: "กรุณาเลือกลูกค้าที่มีการสั่งซื้อแล้ว",
                variant: "destructive",
            });
            return;
        }

        try {
            const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials";
            const method = editingId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast({
                title: editingId ? "อัปเดตแล้ว" : "เพิ่มแล้ว",
                description: "บันทึกรีวิวเรียบร้อย",
            });

            setShowForm(false);
            setEditingId(null);
            resetForm();
            fetchTestimonials();
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "ไม่สามารถบันทึกได้", variant: "destructive" });
        }
    };

    const handleEdit = (testimonial: Testimonial) => {
        setFormData({
            customer_id: testimonial.customer_id || "",
            customer_name: testimonial.customer_name,
            avatar_url: testimonial.avatar_url || "",
            rating: testimonial.rating,
            comment: testimonial.comment,
            product_name: testimonial.product_name || "",
            is_featured: testimonial.is_featured,
            is_active: testimonial.is_active,
            display_order: testimonial.display_order,
        });
        setEditingId(testimonial.id);
        setShowForm(true);
        if (testimonial.customer_id) {
            fetchCustomerProducts(testimonial.customer_id);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ต้องการลบรีวิวนี้?")) return;

        try {
            await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
            toast({ title: "ลบแล้ว", description: "ลบรีวิวเรียบร้อย" });
            fetchTestimonials();
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "ไม่สามารถลบได้", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            customer_id: "",
            customer_name: "",
            avatar_url: "",
            rating: 5,
            comment: "",
            product_name: "",
            is_featured: true,
            is_active: true,
            display_order: 0,
        });
        setCustomerProducts([]);
    };

    if (loading) {
        return <div className="p-8 text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">จัดการรีวิวลูกค้า</h1>
                    <p className="text-muted-foreground">รีวิวจากลูกค้าที่มีการสั่งซื้อแล้ว</p>
                </div>
                <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มรีวิว
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingId ? "แก้ไขรีวิว" : "เพิ่มรีวิวใหม่"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Customer Selection */}
                        {!editingId && (
                            <div>
                                <label className="text-sm font-medium">ค้นหาลูกค้า (ที่มีการสั่งซื้อแล้ว) *</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            fetchCustomers(e.target.value);
                                        }}
                                        placeholder="พิมพ์ชื่อหรือเบอร์โทร..."
                                        className="pl-10"
                                    />
                                </div>
                                {customerSearch && customers.length > 0 && (
                                    <div className="mt-2 border rounded-md max-h-48 overflow-y-auto">
                                        {customers.map((c) => (
                                            <div
                                                key={c.id}
                                                onClick={() => handleCustomerSelect(c)}
                                                className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3 border-b last:border-0"
                                            >
                                                {c.profile_image_url ? (
                                                    <img src={c.profile_image_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium">{c.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {c.phone} • {c.order_count} orders
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {formData.customer_name && (
                                    <p className="mt-2 text-sm text-green-600">
                                        ✓ เลือกแล้ว: {formData.customer_name}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Read-only customer name when editing */}
                        {editingId && (
                            <div>
                                <label className="text-sm font-medium">ลูกค้า</label>
                                <Input
                                    value={formData.customer_name}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        )}

                        {/* Product Selection */}
                        <div>
                            <label className="text-sm font-medium">สินค้าที่ซื้อ</label>
                            {customerProducts.length > 0 ? (
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.product_name}
                                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                >
                                    <option value="">เลือกสินค้า</option>
                                    {customerProducts.map((p, i) => (
                                        <option key={i} value={p.name}>
                                            {p.name} {p.brand && `(${p.brand})`}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <Input
                                    value={formData.product_name}
                                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                    placeholder="ชื่อสินค้า (กรอกเอง)"
                                />
                            )}
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="text-sm font-medium">ข้อความรีวิว *</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                required
                            />
                        </div>

                        {/* Rating & Order */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">คะแนน</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                >
                                    {[5, 4, 3, 2, 1].map((n) => (
                                        <option key={n} value={n}>{n} ดาว</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">ลำดับ</label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-end gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                    />
                                    แนะนำ
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    แสดง
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit">บันทึก</Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                ยกเลิก
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="grid gap-4">
                {testimonials.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        <p>ยังไม่มีรีวิว</p>
                        <p className="text-sm mt-1">กดปุ่ม "เพิ่มรีวิว" เพื่อเพิ่มรีวิวจากลูกค้าที่สั่งซื้อแล้ว</p>
                    </Card>
                ) : (
                    testimonials.map((t) => (
                        <Card key={t.id} className="p-4 flex items-start gap-4">
                            {t.avatar_url ? (
                                <img
                                    src={t.avatar_url}
                                    alt={t.customer_name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium">{t.customer_name}</span>
                                    <div className="flex">
                                        {[...Array(t.rating)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    {t.is_featured && (
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                            แนะนำ
                                        </span>
                                    )}
                                    {!t.is_active && (
                                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                                            ซ่อน
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{t.comment}</p>
                                {t.product_name && (
                                    <p className="text-xs text-primary">ซื้อ: {t.product_name}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(t)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleDelete(t.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
