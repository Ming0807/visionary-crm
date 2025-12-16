import { NextRequest, NextResponse } from "next/server";
import cloudinary, { productUploadOptions, profileUploadOptions, slipUploadOptions } from "@/lib/cloudinary";

// POST - Upload image to Cloudinary
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string || "product"; // product | profile | slip

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Select upload options based on type
        let options;
        switch (type) {
            case "profile":
                options = profileUploadOptions;
                break;
            case "slip":
                options = slipUploadOptions;
                break;
            default:
                options = productUploadOptions;
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(base64, options);

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

// DELETE - Remove image from Cloudinary
export async function DELETE(request: NextRequest) {
    try {
        const { publicId } = await request.json();

        if (!publicId) {
            return NextResponse.json({ error: "No publicId provided" }, { status: 400 });
        }

        await cloudinary.uploader.destroy(publicId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: "Delete failed" }, { status: 500 });
    }
}
