"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
    type?: "product" | "profile" | "slip" | "hero" | "logo" | "favicon" | "category" | "brand";
    className?: string;
}

export default function ImageUploader({
    images,
    onChange,
    maxImages = 5,
    type = "product",
    className,
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (images.length >= maxImages) {
            alert(`Maximum ${maxImages} images allowed`);
            return;
        }

        setIsUploading(true);
        try {
            const filesToUpload = Array.from(files).slice(0, maxImages - images.length);
            const uploadPromises = filesToUpload.map(uploadFile);
            const newUrls = await Promise.all(uploadPromises);
            onChange([...images, ...newUrls]);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleUpload(e.dataTransfer.files);
    }, [images]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {images.map((url, index) => (
                        <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
                        >
                            <Image
                                src={url}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                    Main
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Zone */}
            {images.length < maxImages && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-3 rounded-full bg-muted">
                                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Drag & drop images here
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    or click to browse ({images.length}/{maxImages})
                                </p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleUpload(e.target.files)}
                                className="hidden"
                                id="image-upload"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("image-upload")?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Browse
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
