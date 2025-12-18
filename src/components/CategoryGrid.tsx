"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface CategoryItem {
  id: string;
  name: string;
  dbCategory: string;
  description: string;
  image: string;
  size: "large" | "medium" | "small";
  count?: number;
}

const defaultCategories: CategoryItem[] = [
  { id: "sunglasses", name: "แว่นกันแดด", dbCategory: "Sunglasses", description: "ปกป้องดวงตาด้วยสไตล์", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", size: "large" },
  { id: "frames", name: "แว่นสายตา", dbCategory: "Eyeglasses", description: "สวยทุกวัน", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=400&q=80", size: "small" },
  { id: "lenses", name: "เลนส์", dbCategory: "Lenses", description: "มองชัดสบายตา", image: "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?auto=format&fit=crop&w=400&q=80", size: "small" },
  { id: "accessories", name: "อุปกรณ์เสริม", dbCategory: "Accessories", description: "เติมเต็มลุค", image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=400&q=80", size: "medium" },
];

export default function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories from site_settings
        const res = await fetch("/api/settings/categories");
        const data = await res.json();
        
        let cats = defaultCategories;
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          cats = data.value;
        }

        // Fetch product counts
        const { data: products } = await supabase
          .from("products")
          .select("category")
          .eq("is_active", true);

        if (products) {
          const counts: Record<string, number> = {};
          products.forEach((p) => {
            if (p.category) {
              counts[p.category] = (counts[p.category] || 0) + 1;
            }
          });

          // Map counts to categories using dbCategory
          setCategories(cats.map((cat) => ({
            ...cat,
            count: counts[cat.dbCategory] || 0,
          })));
        } else {
          setCategories(cats);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            เลือกซื้อตามหมวดหมู่
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            คอลเลกชันแว่นตาพรีเมียมสำหรับทุกโอกาส
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[200px] lg:auto-rows-[250px]">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.dbCategory}`}
              className={`
                group relative rounded-2xl lg:rounded-3xl overflow-hidden hover-lift
                ${category.size === "large" ? "col-span-2 row-span-2" : ""}
                ${category.size === "medium" ? "col-span-2 lg:col-span-2" : ""}
              `}
            >
              {/* Background Image */}
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20" />
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Product Count Badge */}
              {category.count && category.count > 0 && (
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                  <span className="text-xs font-semibold text-gray-800">
                    {category.count} สินค้า
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-white/80 hidden sm:block">
                  {category.description}
                </p>
                <span className="inline-flex items-center text-sm font-medium text-white mt-2 opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                  Shop Now
                  <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
