"use client";

import Image from "next/image";

export default function PremiumImage({
    src,
    alt,
    width = 700,
    height = 800,
    className = "",
}) {
    return (
        <div className="relative group">
            {/* Glow background */}
            <div className="absolute inset-0 -m-4 rounded-3xl bg-white/[0.03] blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />

            {/* Floating animation */}
            <div className="relative z-10 animate-float">
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    className={`w-full h-auto object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.08)] transition duration-500 group-hover:scale-[1.03] ${className}`}
                />
            </div>
        </div>
    );
}