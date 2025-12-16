import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Award, Heart, Truck } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Premium Quality",
    description: "Handcrafted eyewear using the finest materials",
  },
  {
    icon: Award,
    title: "Expert Craftsmanship",
    description: "Designed by world-class optical engineers",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Dedicated support and satisfaction guarantee",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Complimentary delivery on all orders",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          About <span className="text-primary">The Visionary</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          เราเชื่อว่าแว่นตาไม่ใช่แค่เครื่องช่วยมองเห็น แต่เป็นส่วนหนึ่งของบุคลิกภาพ
          ที่สะท้อนตัวตนของคุณ
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-4 gap-8 mb-16">
        {features.map((feature, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <feature.icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="bg-card rounded-3xl p-8 md:p-12 mb-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            The Visionary ก่อตั้งขึ้นจากความรักในงานออปติคอล
            เราคัดสรรแว่นตาคุณภาพสูงจากทั่วโลก
            มาให้บริการลูกค้าชาวไทยที่ใส่ใจในรายละเอียดและสไตล์
          </p>
          <p className="text-muted-foreground">
            ทุกชิ้นงานของเราผ่านการคัดเลือกอย่างพิถีพิถัน
            เพื่อให้มั่นใจว่าคุณจะได้รับประสบการณ์ที่ดีที่สุด
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          พร้อมค้นหาแว่นตาที่ใช่สำหรับคุณ?
        </h2>
        <Button asChild size="lg">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>
    </div>
  );
}
