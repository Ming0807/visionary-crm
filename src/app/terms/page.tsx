import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ข้อกำหนดการใช้งาน",
    description: "ข้อกำหนดและเงื่อนไขการใช้บริการเว็บไซต์ The Visionary",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    ข้อกำหนดการใช้งาน
                </h1>
                <p className="text-muted-foreground mb-8">
                    อัปเดตล่าสุด: มกราคม 2024
                </p>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">1. การยอมรับข้อกำหนด</h2>
                        <p className="text-muted-foreground">
                            การใช้เว็บไซต์ thevisionary.co.th แสดงว่าคุณยอมรับข้อกำหนดและเงื่อนไขเหล่านี้ หากไม่ยอมรับ กรุณาหยุดใช้งานเว็บไซต์
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">2. การสั่งซื้อสินค้า</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>ราคาสินค้าอาจเปลี่ยนแปลงได้โดยไม่ต้องแจ้งล่วงหน้า</li>
                            <li>เราขอสงวนสิทธิ์ในการยกเลิกคำสั่งซื้อในกรณีสินค้าหมด</li>
                            <li>ลูกค้าต้องให้ข้อมูลที่ถูกต้องสำหรับการจัดส่ง</li>
                            <li>การชำระเงินต้องดำเนินการภายใน 24 ชั่วโมงหลังสั่งซื้อ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">3. การรับประกันสินค้า</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>กรอบแว่นตา: รับประกัน 1 ปี</li>
                            <li>เลนส์: รับประกัน 6 เดือน</li>
                            <li>ครอบคลุมความชำรุดจากการผลิตเท่านั้น</li>
                            <li>ไม่รวมความเสียหายจากการใช้งาน, การตกหล่น, หรืออุบัติเหตุ</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">4. การเปลี่ยนและคืนสินค้า</h2>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            <li>สามารถเปลี่ยน-คืนได้ภายใน 30 วัน</li>
                            <li>สินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งาน</li>
                            <li>มีบรรจุภัณฑ์และอุปกรณ์ครบถ้วน</li>
                            <li>สินค้าที่ตัดเลนส์ตามสั่งไม่สามารถคืนได้</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">5. ทรัพย์สินทางปัญญา</h2>
                        <p className="text-muted-foreground">
                            เนื้อหาทั้งหมดบนเว็บไซต์ รวมถึงข้อความ, รูปภาพ, โลโก้ เป็นทรัพย์สินของ The Visionary หรือผู้อนุญาต ห้ามคัดลอกหรือใช้โดยไม่ได้รับอนุญาต
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">6. ข้อจำกัดความรับผิด</h2>
                        <p className="text-muted-foreground">
                            The Visionary จะไม่รับผิดชอบต่อความเสียหายทางอ้อมใดๆ ที่เกิดจากการใช้บริการ ความรับผิดสูงสุดจำกัดเพียงมูลค่าสินค้าที่สั่งซื้อ
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">7. การแก้ไขข้อกำหนด</h2>
                        <p className="text-muted-foreground">
                            เราขอสงวนสิทธิ์ในการแก้ไขข้อกำหนดเหล่านี้ได้ตลอดเวลา การเปลี่ยนแปลงจะมีผลทันทีที่เผยแพร่บนเว็บไซต์
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-3">8. กฎหมายที่ใช้บังคับ</h2>
                        <p className="text-muted-foreground">
                            ข้อกำหนดนี้อยู่ภายใต้กฎหมายแห่งราชอาณาจักรไทย
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
