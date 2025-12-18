import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { 
    Eye, Award, Heart, Truck, MapPin, Phone, Mail, Clock,
    Instagram, Facebook, MessageCircle
} from "lucide-react";

export const metadata: Metadata = {
    title: "เกี่ยวกับเรา",
    description: "The Visionary ร้านแว่นตาพรีเมียม ก่อตั้งจากความรักในงานออปติคอล บริการด้วยใจ",
};

const features = [
    {
        icon: Eye,
        title: "Premium Quality",
        titleTh: "คุณภาพพรีเมียม",
        description: "แว่นตาทุกชิ้นผ่านการคัดสรรจากแบรนด์ชั้นนำทั่วโลก",
    },
    {
        icon: Award,
        title: "Expert Craftsmanship",
        titleTh: "ช่างผู้เชี่ยวชาญ",
        description: "ทีมช่างประสบการณ์กว่า 10 ปี พร้อมให้คำปรึกษา",
    },
    {
        icon: Heart,
        title: "Customer First",
        titleTh: "ลูกค้าคือหัวใจ",
        description: "บริการหลังการขายตลอดชีพ ซ่อม ปรับ ฟรี",
    },
    {
        icon: Truck,
        title: "Free Shipping",
        titleTh: "จัดส่งฟรีทั่วไทย",
        description: "ส่งฟรี เมื่อซื้อครบ ฿1,500 ประกันสินค้าระหว่างขนส่ง",
    },
];

interface TeamMember {
    name: string;
    role: string;
    image_url: string;
}

const fallbackTeam: TeamMember[] = [
    {
        name: "คุณวิสัยทัศน์",
        role: "ผู้ก่อตั้ง & CEO",
        image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
    },
    {
        name: "คุณหมอตา",
        role: "ผู้เชี่ยวชาญด้านสายตา",
        image_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
    },
    {
        name: "คุณนักออกแบบ",
        role: "Creative Director",
        image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
    },
];

async function getTeamMembers(): Promise<TeamMember[]> {
    try {
        const { data, error } = await supabase
            .from("team_members")
            .select("name, role, image_url")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error || !data || data.length === 0) {
            return fallbackTeam;
        }

        return data;
    } catch {
        return fallbackTeam;
    }
}

export default async function AboutPage() {
    const team = await getTeamMembers();
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    About Us
                </span>
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                    เกี่ยวกับ <span className="text-primary">The Visionary</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    เราเชื่อว่าแว่นตาไม่ใช่แค่เครื่องช่วยมองเห็น แต่เป็นส่วนหนึ่งของบุคลิกภาพ
                    ที่สะท้อนตัวตนของคุณ
                </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                {features.map((feature, index) => (
                    <div key={index} className="text-center p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <feature.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-foreground mb-1">{feature.titleTh}</h3>
                        <p className="text-xs text-primary mb-2">{feature.title}</p>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* Story Section */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                <div className="relative aspect-square rounded-3xl overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=800&fit=crop"
                        alt="The Visionary Store"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-foreground mb-6">เรื่องราวของเรา</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <p>
                            The Visionary ก่อตั้งขึ้นในปี 2020 จากความหลงใหลในงานออปติคอลและความตั้งใจที่จะนำเสนอแว่นตาคุณภาพสูงให้กับคนไทย
                        </p>
                        <p>
                            เราคัดสรรแว่นตาจากแบรนด์ชั้นนำทั่วโลก ไม่ว่าจะเป็น Ray-Ban, Oakley, Gucci, Prada และอีกมากมาย พร้อมบริการตรวจวัดสายตาโดยผู้เชี่ยวชาญ
                        </p>
                        <p>
                            ทุกชิ้นงานของเราผ่านการคัดเลือกอย่างพิถีพิถัน เพื่อให้มั่นใจว่าคุณจะได้รับประสบการณ์ที่ดีที่สุด
                        </p>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <Button asChild size="lg">
                            <Link href="/products">ดูสินค้าทั้งหมด</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/contact">ติดต่อเรา</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">ทีมงานของเรา</h2>
                <p className="text-muted-foreground">ผู้เชี่ยวชาญที่พร้อมให้บริการคุณ</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-20">
                {team.map((member, index) => (
                    <div key={index} className="text-center">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                            <Image
                                src={member.image_url}
                                alt={member.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="font-bold text-foreground">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                ))}
            </div>

            {/* Contact Info */}
            <div className="bg-card rounded-3xl p-8 lg:p-12 border border-border">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">ติดต่อเรา</h2>
                    <p className="text-muted-foreground">พร้อมให้บริการทุกวัน</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground text-sm">ที่อยู่</p>
                            <p className="text-sm text-muted-foreground">123 ถนนสุขุมวิท แขวงคลองเตย กรุงเทพฯ 10110</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground text-sm">โทรศัพท์</p>
                            <p className="text-sm text-muted-foreground">02-XXX-XXXX</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground text-sm">เวลาทำการ</p>
                            <p className="text-sm text-muted-foreground">ทุกวัน 10:00 - 21:00</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground text-sm">LINE</p>
                            <p className="text-sm text-muted-foreground">@thevisionary</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
