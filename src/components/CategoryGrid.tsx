"use client";

import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: "sunglasses",
    name: "แว่นกันแดด",
    description: "ปกป้องดวงตาด้วยสไตล์",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
    href: "/products?category=Sunglasses",
    size: "large",
  },
  {
    id: "frames",
    name: "แว่นสายตา",
    description: "สวยทุกวัน",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=400&q=80",
    href: "/products?category=Eyeglasses",
    size: "small",
  },
  {
    id: "lenses",
    name: "เลนส์",
    description: "มองชัดสบายตา",
    image: "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?auto=format&fit=crop&w=400&q=80",
    href: "/products?category=Lenses",
    size: "small",
  },
  {
    id: "accessories",
    name: "อุปกรณ์เสริม",
    description: "เติมเต็มลุค",
    image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=400&q=80",
    href: "/products?category=Accessories",
    size: "medium",
  },
];

export default function CategoryGrid() {
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
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={category.href}
              className={`
                group relative rounded-2xl lg:rounded-3xl overflow-hidden hover-lift
                ${category.size === "large" ? "col-span-2 row-span-2" : ""}
                ${category.size === "medium" ? "col-span-2 lg:col-span-2" : ""}
              `}
            >
              {/* Background Image */}
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
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
