import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            <div className="bg-card rounded-2xl border border-border p-8 max-w-md text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                    ไม่พบหน้านี้
                </h2>
                <p className="text-muted-foreground mb-6">
                    หน้าที่คุณกำลังค้นหาไม่มีอยู่ หรือถูกย้ายไปที่อื่น
                </p>
                <div className="flex gap-3 justify-center">
                    <Button variant="default" asChild>
                        <Link href="/admin">
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/orders">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Orders
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
