"use client";

import { useState, useEffect } from "react";
import { 
  Save, Megaphone, Building2, Loader2, Home, Grid3X3, 
  Plus, Trash2, Store, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import ImageUploader from "@/components/ImageUploader";

// =============== INTERFACES ===============
interface HeroSettings {
  badge: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

interface PromoSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  endDate: string | null;
  daysFromNow: number;
}

interface CategoryItem {
  id: string;
  name: string;
  dbCategory: string; // For auto-link
  description: string;
  image: string;
  size: "large" | "medium" | "small";
}

interface BrandItem {
  id: string;
  name: string;
  logo: string;
}

interface StoreConfig {
  siteName: string;
  logo: string;
  favicon: string;
  email: string;
  phone: string;
  address: string;
  lineId: string;
  freeShippingThreshold: number;
}

// =============== DEFAULT VALUES ===============
const defaultHero: HeroSettings = {
  badge: "คอลเลกชันใหม่ 2024",
  headline: "ค้นหาแว่นตาที่ใช่คุณ",
  subheadline: "แว่นตาพรีเมียม สำหรับคนที่มองโลกต่างออกไป ค้นหาสไตล์ของคุณวันนี้",
  ctaText: "เลือกชมคอลเลกชัน",
  ctaLink: "/products",
  image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
};

const defaultCategories: CategoryItem[] = [
  { id: "sunglasses", name: "แว่นกันแดด", dbCategory: "Sunglasses", description: "ปกป้องดวงตาด้วยสไตล์", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", size: "large" },
  { id: "frames", name: "แว่นสายตา", dbCategory: "Eyeglasses", description: "สวยทุกวัน", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=400&q=80", size: "small" },
  { id: "lenses", name: "เลนส์", dbCategory: "Lenses", description: "มองชัดสบายตา", image: "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?auto=format&fit=crop&w=400&q=80", size: "small" },
  { id: "accessories", name: "อุปกรณ์เสริม", dbCategory: "Accessories", description: "เติมเต็มลุค", image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=400&q=80", size: "medium" },
];

const defaultBrands: BrandItem[] = [
  { id: "1", name: "Ray-Ban", logo: "" },
  { id: "2", name: "Oakley", logo: "" },
  { id: "3", name: "Gucci", logo: "" },
  { id: "4", name: "Prada", logo: "" },
];

const defaultStore: StoreConfig = {
  siteName: "The Visionary",
  logo: "",
  favicon: "",
  email: "contact@thevisionary.com",
  phone: "02-XXX-XXXX",
  address: "Bangkok, Thailand",
  lineId: "@thevisionary",
  freeShippingThreshold: 1500,
};

// Available DB categories for dropdown
const dbCategories = ["Sunglasses", "Eyeglasses", "Lenses", "Accessories", "Contact Lenses", "Sports"];

// =============== MAIN COMPONENT ===============
export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"store" | "hero" | "promo" | "categories" | "brands">("store");

  // State
  const [store, setStore] = useState<StoreConfig>(defaultStore);
  const [hero, setHero] = useState<HeroSettings>(defaultHero);
  const [promo, setPromo] = useState<PromoSettings>({
    enabled: true, title: "🔥 Flash Sale", subtitle: "ลดสูงสุด 50%", endDate: null, daysFromNow: 7,
  });
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);
  const [brands, setBrands] = useState<BrandItem[]>(defaultBrands);

  // Fetch all settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const keys = ["store_config", "hero_section", "promo_banner", "categories", "brand_logos"];
        const results = await Promise.all(
          keys.map(key => fetch(`/api/settings/${key}`).then(r => r.json()).catch(() => null))
        );
        
        if (results[0]?.value) setStore({ ...defaultStore, ...results[0].value });
        if (results[1]?.value) setHero({ ...defaultHero, ...results[1].value });
        if (results[2]?.value) setPromo(prev => ({ ...prev, ...results[2].value }));
        
        // Ensure categories have unique IDs
        if (results[3]?.value && Array.isArray(results[3].value)) {
          const catsWithUniqueIds = results[3].value.map((cat: CategoryItem, index: number) => ({
            ...cat,
            id: cat.id || `cat-${Date.now()}-${index}`,
          }));
          setCategories(catsWithUniqueIds);
        }
        
        // Ensure brands have unique IDs
        if (results[4]?.value && Array.isArray(results[4].value)) {
          const brandsWithUniqueIds = results[4].value.map((brand: BrandItem, index: number) => ({
            ...brand,
            id: brand.id || `brand-${Date.now()}-${index}`,
          }));
          setBrands(brandsWithUniqueIds);
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Generic save function
  const saveSettings = async (key: string, value: unknown, displayName: string) => {
    setSaving(key);
    try {
      await fetch(`/api/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      toast({ title: "บันทึกแล้ว ✓", description: `อัปเดต ${displayName} สำเร็จ` });
    } catch {
      toast({ title: "ผิดพลาด", description: "ไม่สามารถบันทึกได้", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  // Category helpers
  const updateCategory = (id: string, field: keyof CategoryItem, value: string) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
  };

  const addCategory = () => {
    setCategories(prev => [...prev, {
      id: `cat-${Date.now()}`,
      name: "หมวดหมู่ใหม่",
      dbCategory: "Sunglasses",
      description: "คำอธิบาย",
      image: "",
      size: "small",
    }]);
  };

  // Brand helpers
  const updateBrand = (id: string, field: keyof BrandItem, value: string) => {
    setBrands(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const addBrand = () => {
    setBrands(prev => [...prev, { id: `brand-${Date.now()}`, name: "", logo: "" }]);
  };

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const tabs = [
    { id: "store", label: "Store Config", icon: Store },
    { id: "hero", label: "Hero Section", icon: Home },
    { id: "promo", label: "Promo Banner", icon: Megaphone },
    { id: "categories", label: "Categories", icon: Grid3X3 },
    { id: "brands", label: "Brands", icon: Building2 },
  ] as const;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6" /> จัดการหน้าเว็บ
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          แก้ไข content, รูปภาพ และการตั้งค่าร้านค้า
        </p>
      </div>

      {/* Tabs - Scrollable on mobile, sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6 border-b border-border/50">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =============== STORE CONFIG TAB =============== */}
      {activeTab === "store" && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Store className="h-4 w-4 sm:h-5 sm:w-5" /> Store Configuration
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">Site Name</Label>
                  <Input value={store.siteName} onChange={(e) => setStore({ ...store, siteName: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">LINE ID</Label>
                  <Input value={store.lineId} onChange={(e) => setStore({ ...store, lineId: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs sm:text-sm">Email</Label>
                  <Input value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Phone</Label>
                  <Input value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Free Shipping Threshold (฿)</Label>
                <Input type="number" value={store.freeShippingThreshold} onChange={(e) => setStore({ ...store, freeShippingThreshold: Number(e.target.value) })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Address</Label>
                <Textarea value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })} rows={2} className="mt-1" />
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-6">
              <div className="p-4 bg-muted/30 rounded-xl">
                <Label className="text-xs sm:text-sm font-medium">Site Logo</Label>
                <div className="mt-2">
                  <ImageUploader images={store.logo ? [store.logo] : []} onChange={(imgs) => setStore({ ...store, logo: imgs[0] || "" })} maxImages={1} type="logo" />
                </div>
                {store.logo && (
                  <div className="mt-3 p-3 bg-background rounded-lg border">
                    <img src={store.logo} alt="Logo" className="h-12 sm:h-16 object-contain" />
                  </div>
                )}
              </div>
              <div className="p-4 bg-muted/30 rounded-xl">
                <Label className="text-xs sm:text-sm font-medium">Favicon</Label>
                <div className="mt-2">
                  <ImageUploader images={store.favicon ? [store.favicon] : []} onChange={(imgs) => setStore({ ...store, favicon: imgs[0] || "" })} maxImages={1} type="favicon" />
                </div>
                {store.favicon && (
                  <div className="mt-3 p-3 bg-background rounded-lg border inline-flex">
                    <img src={store.favicon} alt="Favicon" className="h-8 w-8 object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button onClick={() => saveSettings("store_config", store, "Store Config")} disabled={saving === "store_config"} className="mt-6 w-full sm:w-auto">
            {saving === "store_config" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            บันทึก Store Config
          </Button>
        </Card>
      )}

      {/* =============== HERO SECTION TAB =============== */}
      {activeTab === "hero" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Home className="h-5 w-5" /> Hero Section</h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><Label>Badge Text</Label><Input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} /></div>
              <div><Label>Headline</Label><Input value={hero.headline} onChange={(e) => setHero({ ...hero, headline: e.target.value })} /></div>
              <div><Label>Subheadline</Label><Textarea value={hero.subheadline} onChange={(e) => setHero({ ...hero, subheadline: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>CTA Button Text</Label><Input value={hero.ctaText} onChange={(e) => setHero({ ...hero, ctaText: e.target.value })} /></div>
                <div><Label>CTA Link</Label><Input value={hero.ctaLink} onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })} /></div>
              </div>
            </div>
            <div>
              <Label>Hero Image</Label>
              <ImageUploader images={hero.image ? [hero.image] : []} onChange={(imgs) => setHero({ ...hero, image: imgs[0] || "" })} maxImages={1} type="hero" />
              {hero.image && <div className="mt-3 aspect-video rounded-lg overflow-hidden bg-muted"><img src={hero.image} alt="Hero" className="w-full h-full object-cover" /></div>}
            </div>
          </div>

          <Button onClick={() => saveSettings("hero_section", hero, "Hero Section")} disabled={saving === "hero_section"} className="mt-6">
            {saving === "hero_section" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            บันทึก Hero Section
          </Button>
        </Card>
      )}

      {/* =============== PROMO BANNER TAB =============== */}
      {activeTab === "promo" && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Megaphone className="h-5 w-5" /> Promo Banner</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={promo.enabled} onChange={(e) => setPromo({ ...promo, enabled: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="font-medium">เปิดใช้งาน Promo Banner</span>
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Title (Badge)</Label><Input value={promo.title} onChange={(e) => setPromo({ ...promo, title: e.target.value })} /></div>
              <div><Label>Subtitle</Label><Input value={promo.subtitle} onChange={(e) => setPromo({ ...promo, subtitle: e.target.value })} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>วันหมดเขต</Label><Input type="datetime-local" value={promo.endDate || ""} onChange={(e) => setPromo({ ...promo, endDate: e.target.value || null })} /></div>
              <div><Label>จำนวนวัน (ถ้าไม่ระบุวัน)</Label><Input type="number" value={promo.daysFromNow} onChange={(e) => setPromo({ ...promo, daysFromNow: Number(e.target.value) })} min={1} /></div>
            </div>
            <Button onClick={() => saveSettings("promo_banner", promo, "Promo Banner")} disabled={saving === "promo_banner"}>
              {saving === "promo_banner" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              บันทึก Promo
            </Button>
          </div>
        </Card>
      )}

      {/* =============== CATEGORIES TAB =============== */}
      {activeTab === "categories" && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Grid3X3 className="h-4 w-4 sm:h-5 sm:w-5" /> Categories
            </h2>
            <Button variant="outline" size="sm" onClick={addCategory} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" /> เพิ่มหมวดหมู่
            </Button>
          </div>

          <div className="space-y-3">
            {categories.map((cat, index) => (
              <div key={`cat-${cat.id || index}`} className="p-3 sm:p-4 border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Name & Description */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">ชื่อที่แสดง</Label>
                      <Input value={cat.name || ""} onChange={(e) => updateCategory(cat.id, "name", e.target.value)} className="mt-1 h-9" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">คำอธิบาย</Label>
                      <Input value={cat.description || ""} onChange={(e) => updateCategory(cat.id, "description", e.target.value)} className="mt-1 h-9" />
                    </div>
                  </div>
                  
                  {/* Category & Size */}
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">หมวดหมู่ในระบบ</Label>
                      <select
                        value={cat.dbCategory || "Sunglasses"}
                        onChange={(e) => updateCategory(cat.id, "dbCategory", e.target.value)}
                        className="w-full mt-1 px-3 py-2 h-9 border rounded-md text-sm bg-background"
                      >
                        {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Size</Label>
                      <select value={cat.size || "small"} onChange={(e) => updateCategory(cat.id, "size", e.target.value)} className="w-full mt-1 px-3 py-2 h-9 border rounded-md text-sm bg-background">
                        <option key="large" value="large">Large (2x2)</option>
                        <option key="medium" value="medium">Medium (2x1)</option>
                        <option key="small" value="small">Small (1x1)</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Image Upload */}
                  <div className="sm:col-span-2 lg:col-span-2">
                    <Label className="text-xs text-muted-foreground">รูปภาพ</Label>
                    <div className="mt-1 flex gap-3">
                      <div className="flex-1">
                        <ImageUploader images={cat.image ? [cat.image] : []} onChange={(imgs) => updateCategory(cat.id, "image", imgs[0] || "")} maxImages={1} type="category" />
                      </div>
                      {cat.image && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Delete Button */}
                <div className="mt-3 pt-3 border-t border-border/50 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => categories.length > 1 && setCategories(prev => prev.filter(c => c.id !== cat.id))} 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-3"
                    disabled={categories.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> ลบหมวดหมู่
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => saveSettings("categories", categories, "Categories")} disabled={saving === "categories"} className="mt-6 w-full sm:w-auto">
            {saving === "categories" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            บันทึก Categories
          </Button>
        </Card>
      )}

      {/* =============== BRANDS TAB =============== */}
      {activeTab === "brands" && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" /> Brand Logos
            </h2>
            <Button variant="outline" size="sm" onClick={addBrand} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-1" /> เพิ่มแบรนด์
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {brands.map((brand, index) => (
              <div key={`brand-${brand.id || index}`} className="p-3 border rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors group">
                {/* Logo Preview */}
                <div className="aspect-[3/2] mb-3 bg-background rounded-lg border flex items-center justify-center overflow-hidden">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-muted-foreground/40 text-xs text-center px-2">No Logo</div>
                  )}
                </div>
                
                {/* Brand Name Input */}
                <div className="mb-2">
                  <Input 
                    value={brand.name || ""} 
                    onChange={(e) => updateBrand(brand.id, "name", e.target.value)} 
                    placeholder="Brand Name" 
                    className="h-8 text-sm"
                  />
                </div>
                
                {/* Upload & Delete */}
                <div className="space-y-2">
                  <ImageUploader 
                    images={brand.logo ? [brand.logo] : []} 
                    onChange={(imgs) => updateBrand(brand.id, "logo", imgs[0] || "")} 
                    maxImages={1} 
                    type="brand" 
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => brands.length > 1 && setBrands(prev => prev.filter(b => b.id !== brand.id))} 
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                    disabled={brands.length <= 1}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> ลบ
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => saveSettings("brand_logos", brands, "Brand Logos")} disabled={saving === "brand_logos"} className="mt-6 w-full sm:w-auto">
            {saving === "brand_logos" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            บันทึก Brands
          </Button>
        </Card>
      )}
    </div>
  );
}
