import Link from "next/link";
import { Button } from "@/components/ui/button";

const collections = [
  {
    id: 1,
    name: "Sunglasses",
    description: "Premium sunglasses for every occasion",
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
    href: "/products?category=Sunglasses",
  },
  {
    id: 2,
    name: "Eyeglasses",
    description: "Stylish frames for clear vision",
    image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600",
    href: "/products?category=Eyeglasses",
  },
  {
    id: 3,
    name: "Accessories",
    description: "Cases, cleaners, and more",
    image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=600",
    href: "/products?category=Accessories",
  },
];

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Collections</h1>
        <p className="text-muted-foreground mt-2">
          Browse our curated collections
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={collection.href}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${collection.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold">{collection.name}</h2>
              <p className="text-white/80 text-sm mt-1">{collection.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button asChild size="lg">
          <Link href="/products">Shop All Products</Link>
        </Button>
      </div>
    </div>
  );
}
