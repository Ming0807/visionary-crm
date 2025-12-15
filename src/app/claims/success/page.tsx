import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClaimSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-3">
        ส่งเรื่องสำเร็จแล้ว!
      </h1>

      <p className="text-muted-foreground mb-8">
        เราได้รับเรื่องร้องเรียนของคุณแล้ว ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="rounded-full">
          <Link href="/products">
            ช้อปต่อ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-full">
          <Link href="/">
            กลับหน้าแรก
          </Link>
        </Button>
      </div>
    </div>
  );
}
