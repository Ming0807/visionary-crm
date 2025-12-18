import { Metadata } from "next";

export const metadata: Metadata = {
    title: "นโยบายความเป็นส่วนตัว",
    description: "นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคลของ The Visionary",
};

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    นโยบายความเป็นส่วนตัว
                </h1>
                <p className="text-muted-foreground mb-8">
                    อัปเดตล่าสุด: มกราคม 2024
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">1. ข้อมูลที่เราเก็บรวบรวม</h2>
                        <p className="text-muted-foreground">
                            เราเก็บรวบรวมข้อมูลต่อไปนี้เมื่อคุณใช้บริการ:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>ชื่อ-นามสกุล, อีเมล, เบอร์โทรศัพท์</li>
                            <li>ที่อยู่จัดส่งสินค้า</li>
                            <li>ข้อมูลการสั่งซื้อและประวัติการซื้อ</li>
                            <li>ข้อมูล LINE Profile (เมื่อ Login ด้วย LINE)</li>
                            <li>ข้อมูลการใช้งานเว็บไซต์ (Cookies)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
                        <p className="text-muted-foreground">
                            เราใช้ข้อมูลของคุณเพื่อ:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>ดำเนินการสั่งซื้อและจัดส่งสินค้า</li>
                            <li>ติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อ</li>
                            <li>ส่งข่าวสารและโปรโมชั่น (ถ้าคุณยินยอม)</li>
                            <li>ปรับปรุงบริการและประสบการณ์การใช้งาน</li>
                            <li>ป้องกันการฉ้อโกงและรักษาความปลอดภัย</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">3. การแชร์ข้อมูล</h2>
                        <p className="text-muted-foreground">
                            เราจะไม่ขายหรือแชร์ข้อมูลส่วนบุคคลของคุณกับบุคคลที่สาม ยกเว้น:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>บริษัทขนส่งเพื่อจัดส่งสินค้า</li>
                            <li>ผู้ให้บริการชำระเงิน</li>
                            <li>เมื่อกฎหมายกำหนด</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">4. ความปลอดภัยของข้อมูล</h2>
                        <p className="text-muted-foreground">
                            เราใช้มาตรการความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ รวมถึง SSL encryption และการจำกัดการเข้าถึงข้อมูล
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">5. สิทธิ์ของคุณ</h2>
                        <p className="text-muted-foreground">
                            คุณมีสิทธิ์:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                            <li>เข้าถึงและขอสำเนาข้อมูลของคุณ</li>
                            <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                            <li>ขอลบข้อมูล (ภายใต้เงื่อนไขบางประการ)</li>
                            <li>ยกเลิกการรับข่าวสารโปรโมชั่น</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">6. ติดต่อเรา</h2>
                        <p className="text-muted-foreground">
                            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว ติดต่อได้ที่:
                        </p>
                        <p className="text-muted-foreground mt-2">
                            อีเมล: privacy@thevisionary.co.th<br />
                            LINE: @thevisionary
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
