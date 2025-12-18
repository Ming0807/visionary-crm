import { Truck, Shield, Clock, HeadphonesIcon, CreditCard, RefreshCw } from "lucide-react";

const benefits = [
    {
        icon: Truck,
        title: "จัดส่งฟรี",
        titleEn: "Free Shipping",
        description: "ส่งฟรีทั่วประเทศเมื่อซื้อครบ ฿1,500",
    },
    {
        icon: Shield,
        title: "ของแท้ 100%",
        titleEn: "100% Authentic",
        description: "รับประกันความแท้จากแบรนด์โดยตรง",
    },
    {
        icon: Clock,
        title: "รับประกัน 1 ปี",
        titleEn: "1 Year Warranty",
        description: "บริการซ่อมแซมและเปลี่ยนชิ้นส่วน",
    },
    {
        icon: RefreshCw,
        title: "เปลี่ยน-คืนได้",
        titleEn: "Easy Returns",
        description: "เปลี่ยนคืนภายใน 30 วันหากไม่พอใจ",
    },
    {
        icon: HeadphonesIcon,
        title: "ทีมงานพร้อมช่วยเหลือ",
        titleEn: "Expert Support",
        description: "ให้คำปรึกษาจากช่างผู้เชี่ยวชาญ",
    },
    {
        icon: CreditCard,
        title: "ผ่อน 0%",
        titleEn: "0% Installment",
        description: "ผ่อนสบายสูงสุด 10 เดือน",
    },
];

export default function WhyChooseUs() {
    return (
        <section className="py-16 lg:py-24 bg-card">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        ทำไมต้อง <span className="text-primary">The Visionary</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        เราใส่ใจทุกรายละเอียดเพื่อให้คุณได้รับประสบการณ์ที่ดีที่สุด
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="text-center p-4 rounded-2xl hover:bg-muted/50 transition-colors group"
                        >
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                                <benefit.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1 text-sm">
                                {benefit.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
