import { Metadata } from "next";
import { ChevronDown } from "lucide-react";

export const metadata: Metadata = {
    title: "คำถามที่พบบ่อย",
    description: "คำถามที่พบบ่อยเกี่ยวกับการสั่งซื้อ การจัดส่ง และบริการต่างๆ ของ The Visionary",
};

const faqs = [
    {
        category: "การสั่งซื้อ",
        questions: [
            {
                q: "สั่งซื้อสินค้าอย่างไร?",
                a: "คุณสามารถเลือกสินค้าที่ต้องการ กดเพิ่มลงตะกร้า และดำเนินการชำระเงินได้เลย หากมีบัญชี LINE สามารถ Login ด้วย LINE เพื่อความสะดวกในการติดตามออเดอร์",
            },
            {
                q: "รับชำระเงินช่องทางใดบ้าง?",
                a: "เรารับชำระผ่าน PromptPay, โอนเงินผ่านธนาคาร (SCB, KBANK, BBL), บัตรเครดิต/เดบิต (VISA, Mastercard), และ TrueMoney Wallet",
            },
            {
                q: "สามารถผ่อนชำระได้หรือไม่?",
                a: "ได้ครับ สำหรับยอดสั่งซื้อตั้งแต่ ฿3,000 ขึ้นไป สามารถผ่อน 0% นานสูงสุด 10 เดือน ผ่านบัตรเครดิตที่ร่วมรายการ",
            },
        ],
    },
    {
        category: "การจัดส่ง",
        questions: [
            {
                q: "ค่าจัดส่งเท่าไหร่?",
                a: "ส่งฟรีทั่วประเทศเมื่อซื้อครบ ฿1,500 หากต่ำกว่านั้นคิดค่าจัดส่ง ฿50-100 ตามพื้นที่",
            },
            {
                q: "ใช้เวลาจัดส่งกี่วัน?",
                a: "กรุงเทพฯ และปริมณฑล 1-2 วันทำการ, ต่างจังหวัด 2-4 วันทำการ หลังจากยืนยันชำระเงิน",
            },
            {
                q: "ตรวจสอบสถานะการจัดส่งได้อย่างไร?",
                a: "เมื่อจัดส่งแล้ว เราจะส่งเลข Tracking ทาง LINE หรืออีเมล สามารถติดตามได้ผ่านเว็บไซต์ขนส่ง",
            },
        ],
    },
    {
        category: "สินค้าและบริการ",
        questions: [
            {
                q: "สินค้าเป็นของแท้หรือไม่?",
                a: "ของแท้ 100% ทุกชิ้น เรานำเข้าจากตัวแทนจำหน่ายอย่างเป็นทางการ มีใบรับประกันแบรนด์ทุกชิ้น",
            },
            {
                q: "มีบริการตัดแว่นสายตาหรือไม่?",
                a: "มีครับ เรามีบริการตัดเลนส์สายตาโดยช่างผู้เชี่ยวชาญ ใช้เวลา 3-7 วันทำการขึ้นอยู่กับประเภทเลนส์",
            },
            {
                q: "รับประกันสินค้านานเท่าไหร่?",
                a: "รับประกันกรอบ 1 ปี และเลนส์ 6 เดือน สำหรับความชำรุดจากการผลิต ไม่รวมความเสียหายจากการใช้งาน",
            },
        ],
    },
    {
        category: "การเปลี่ยน-คืนสินค้า",
        questions: [
            {
                q: "เปลี่ยน-คืนสินค้าได้หรือไม่?",
                a: "ได้ครับ ภายใน 30 วัน หากสินค้าอยู่ในสภาพเดิม ไม่ได้ใช้งาน พร้อมบรรจุภัณฑ์ครบถ้วน",
            },
            {
                q: "ขั้นตอนการเคลมสินค้าทำอย่างไร?",
                a: "ติดต่อผ่าน LINE @thevisionary พร้อมแจ้งเลขออเดอร์และรูปถ่ายสินค้า เราจะดำเนินการภายใน 24 ชั่วโมง",
            },
        ],
    },
];

export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    คำถามที่พบบ่อย
                </h1>
                <p className="text-muted-foreground">
                    รวบรวมคำถามที่ลูกค้าสอบถามบ่อย หากไม่พบคำตอบ สามารถติดต่อเราได้ตลอด
                </p>
            </div>

            {/* FAQ Categories */}
            <div className="max-w-3xl mx-auto space-y-8">
                {faqs.map((category, catIndex) => (
                    <div key={catIndex}>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                                {catIndex + 1}
                            </span>
                            {category.category}
                        </h2>
                        <div className="space-y-3">
                            {category.questions.map((faq, qIndex) => (
                                <details
                                    key={qIndex}
                                    className="group bg-card rounded-xl border border-border overflow-hidden"
                                >
                                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                        <span className="font-medium text-foreground pr-4">
                                            {faq.q}
                                        </span>
                                        <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" />
                                    </summary>
                                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Still have questions */}
            <div className="text-center mt-12 p-8 bg-card rounded-2xl border border-border max-w-xl mx-auto">
                <h3 className="font-bold text-foreground mb-2">ยังมีคำถาม?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    ติดต่อทีมงานของเราได้ตลอด 24 ชั่วโมง
                </p>
                <a
                    href="https://lin.ee/Y0lv8Nr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                >
                    <img 
                        src="https://scdn.line-apps.com/n/line_add_friends/btn/th.png" 
                        alt="เพิ่มเพื่อน" 
                        height="36" 
                        className="h-9 hover:opacity-90 transition-opacity"
                    />
                </a>
            </div>
        </div>
    );
}
