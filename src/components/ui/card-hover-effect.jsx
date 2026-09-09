"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const HoverEffect = ({
    items,
    className
}) => {
    let [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div
            className={cn("grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10", className)}>
            {items.map((item, idx) => (
                <a
                    href={item?.link}
                    key={item?.id || item?.link || idx}
                    className="relative group  block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}>
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-blue-50/80 block rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }} />
                        )}
                    </AnimatePresence>
                    <Card>
                        {item.content || (
                            <>
                                <CardTitle>{item.title}</CardTitle>
                                <CardDescription>{item.description}</CardDescription>
                            </>
                        )}
                    </Card>
                </a>
            ))}
        </div>
    );
};

export const Card = ({
    className,
    children
}) => {
    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden bg-white border border-slate-200/80 group-hover:border-primary/40 shadow-xs relative z-20",
                className
            )}>
            <div className="relative z-50">
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};
export const CardTitle = ({
    className,
    children
}) => {
    return (
        <h4 className={cn("text-slate-900 font-bold tracking-wide mt-4", className)}>
            {children}
        </h4>
    );
};
export const CardDescription = ({
    className,
    children
}) => {
    return (
        <p
            className={cn("mt-8 text-slate-600 tracking-wide leading-relaxed text-sm", className)}>
            {children}
        </p>
    );
};
