"use client";

import { useState } from "react";
import { Settings, Store, Bell, Mail, Shield, Database, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState({
        storeName: "The Visionary",
        storeEmail: "contact@thevisionary.com",
        storePhone: "02-XXX-XXXX",
        storeAddress: "Bangkok, Thailand",
        currency: "THB",
        taxRate: "7",
        lowStockThreshold: "5",
        autoConfirmOrders: false,
        emailNotifications: true,
        lineNotifications: true,
    });

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Configure your store settings</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>Saving...</>
                    ) : saved ? (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Saved!
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

            <div className="space-y-6">
                {/* Store Information */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Store className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Store Information</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Store Name</label>
                            <Input
                                value={settings.storeName}
                                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <Input
                                type="email"
                                value={settings.storeEmail}
                                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <Input
                                value={settings.storePhone}
                                onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Currency</label>
                            <Input
                                value={settings.currency}
                                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Address</label>
                            <Textarea
                                value={settings.storeAddress}
                                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                                rows={2}
                            />
                        </div>
                    </div>
                </Card>

                {/* Business Rules */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Database className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Business Rules</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                            <Input
                                type="number"
                                value={settings.taxRate}
                                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Low Stock Threshold</label>
                            <Input
                                type="number"
                                value={settings.lowStockThreshold}
                                onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Alert when stock falls below this number
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Notifications */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                            <Bell className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold">Notifications</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Email Notifications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Receive order updates via email
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                className="h-5 w-5"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 rounded-lg bg-muted/50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">LINE Notifications</p>
                                    <p className="text-sm text-muted-foreground">
                                        Get LINE alerts for new orders and messages
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.lineNotifications}
                                onChange={(e) => setSettings({ ...settings, lineNotifications: e.target.checked })}
                                className="h-5 w-5"
                            />
                        </label>
                    </div>
                </Card>

                {/* Danger Zone */}
                <Card className="p-6 border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-red-100 text-red-600">
                            <Shield className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        These actions are irreversible. Please be careful.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Clear All Cache
                        </Button>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                            Reset Analytics
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
