"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/ImageUploader";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image_url: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
}

export default function TeamAdminPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        image_url: "",
        display_order: 0,
        is_active: true,
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const res = await fetch("/api/team");
            const data = await res.json();
            setTeam(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId ? `/api/team/${editingId}` : "/api/team";
            const method = editingId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to save");

            toast({
                title: editingId ? "อัปเดตแล้ว" : "เพิ่มแล้ว",
                description: "บันทึกข้อมูลทีมงานเรียบร้อย",
            });

            setShowForm(false);
            setEditingId(null);
            resetForm();
            fetchTeam();
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "ไม่สามารถบันทึกได้", variant: "destructive" });
        }
    };

    const handleEdit = (member: TeamMember) => {
        setFormData({
            name: member.name,
            role: member.role,
            image_url: member.image_url || "",
            display_order: member.display_order,
            is_active: member.is_active,
        });
        setEditingId(member.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("ต้องการลบทีมงานนี้?")) return;

        try {
            await fetch(`/api/team/${id}`, { method: "DELETE" });
            toast({ title: "ลบแล้ว", description: "ลบข้อมูลทีมงานเรียบร้อย" });
            fetchTeam();
        } catch (error) {
            toast({ title: "ผิดพลาด", description: "ไม่สามารถลบได้", variant: "destructive" });
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            role: "",
            image_url: "",
            display_order: 0,
            is_active: true,
        });
    };

    if (loading) {
        return <div className="p-8 text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">จัดการทีมงาน</h1>
                    <p className="text-muted-foreground">ทีมงานที่แสดงในหน้า About</p>
                </div>
                <Button onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มทีมงาน
                </Button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">
                        {editingId ? "แก้ไขทีมงาน" : "เพิ่มทีมงานใหม่"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">ชื่อ *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">ตำแหน่ง *</label>
                                <Input
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">รูปภาพ</label>
                            <ImageUploader
                                images={formData.image_url ? [formData.image_url] : []}
                                onChange={(urls) => setFormData({ ...formData, image_url: urls[0] || "" })}
                                maxImages={1}
                                type="profile"
                                className="mt-2"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">ลำดับการแสดง</label>
                                <Input
                                    type="number"
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                                />
                            </div>
                            <div className="flex items-end">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    />
                                    แสดงในหน้าเว็บ
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

            {/* Team Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.length === 0 ? (
                    <Card className="col-span-full p-8 text-center text-muted-foreground">
                        ยังไม่มีทีมงาน กดปุ่ม "เพิ่มทีมงาน" เพื่อเริ่มต้น
                    </Card>
                ) : (
                    team.map((member) => (
                        <Card key={member.id} className="p-4">
                            <div className="flex items-center gap-4">
                                {member.image_url ? (
                                    <img
                                        src={member.image_url}
                                        alt={member.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <User className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-muted-foreground">
                                            ลำดับ: {member.display_order}
                                        </span>
                                        {!member.is_active && (
                                            <span className="px-2 py-0.5 bg-muted text-xs rounded-full">ซ่อน</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(member)}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    แก้ไข
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)}>
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
