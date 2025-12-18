import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";

// Lazy load below-fold components for better LCP
const PromoBanner = dynamic(() => import("@/components/PromoBanner"));
const CategoryGrid = dynamic(() => import("@/components/CategoryGrid"));
const WhyChooseUs = dynamic(() => import("@/components/WhyChooseUs"));
const BrandLogos = dynamic(() => import("@/components/BrandLogos"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const Newsletter = dynamic(() => import("@/components/Newsletter"));

export default function Home() {
  return (
    <>
      <HeroSection />
      <PromoBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <WhyChooseUs />
      <Testimonials />
      <BrandLogos />
      <Newsletter />
    </>
  );
}
