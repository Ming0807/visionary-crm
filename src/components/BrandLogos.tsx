"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BrandItem {
  id: string;
  name: string;
  logo: string;
}

const defaultBrands: BrandItem[] = [
  { id: "1", name: "Ray-Ban", logo: "" },
  { id: "2", name: "Oakley", logo: "" },
  { id: "3", name: "Gucci", logo: "" },
  { id: "4", name: "Prada", logo: "" },
  { id: "5", name: "Tom Ford", logo: "" },
  { id: "6", name: "Dior", logo: "" },
];

export default function BrandLogos() {
  const [brands, setBrands] = useState<BrandItem[]>(defaultBrands);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/settings/brand_logos");
        const data = await res.json();
        
        if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
          // Handle both old format (array of strings) and new format (array of objects)
          // Always generate unique IDs to prevent key conflicts
          const brandData = data.value.map((item: string | BrandItem, index: number) => {
            if (typeof item === "string") {
              return { id: `brand-${Date.now()}-${index}`, name: item, logo: "" };
            }
            return { 
              ...item, 
              id: item.id || `brand-${Date.now()}-${index}` 
            };
          });
          setBrands(brandData);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-wider text-muted-foreground font-medium">
            ตัวแทนจำหน่ายแบรนด์ชั้นนำ
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {brands.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex items-center justify-center transition-all hover:scale-105"
            >
              {brand.logo ? (
                <div className="relative h-10 w-24 lg:h-12 lg:w-32">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain filter grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ) : (
                <span className="text-lg lg:text-xl font-semibold text-muted-foreground/70 hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
