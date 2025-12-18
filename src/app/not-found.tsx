import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
            <div className="text-center max-w-md">
                <h1 className="text-9xl font-bold text-primary/20 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    ไม่พบหน้านี้
                </h2>
                <p className="text-muted-foreground mb-8">
                    หน้าที่คุณกำลังค้นหาไม่มีอยู่ หรือถูกย้ายไปที่อื่น
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <Button variant="default" size="lg" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4 mr-2" />
                            หน้าแรก
                        </Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/products">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            สินค้าทั้งหมด
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
