
import React, { PropsWithChildren, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BeamsBackgroundProps {
    intensity?: "subtle" | "medium" | "strong";
    className?: string;
}

function Beam({ opacity }: { opacity: number }) {
    return (
        <div className="absolute inset-0">
            <motion.div
                className="w-full h-full bg-gradient-to-br from-orange-500 via-purple-500 to-blue-500"
                style={{ opacity }}
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
        </div>
    );
}

function Beams({ opacity }: { opacity: number }) {
    return (
        <>
            <Beam opacity={opacity} />
            <Beam opacity={opacity} />
            <Beam opacity={opacity} />
        </>
    );
}

export function BeamsBackground({ 
    children, 
    className, 
    intensity = "medium",
    ...props 
}: PropsWithChildren<BeamsBackgroundProps>) {
    const beamsOpacity = useMemo(() => {
        switch (intensity) {
            case "subtle":
                return 0.3;
            case "medium":
                return 0.4;
            case "strong":
                return 0.5;
            default:
                return 0.4;
        }
    }, [intensity]);

    return (
        <div
            className={cn(
                "fixed inset-0 w-full h-full overflow-hidden bg-black",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 opacity-60 mix-blend-soft-light z-0">
                <Beams opacity={beamsOpacity} />
            </div>

            <motion.div
                className="absolute inset-0 bg-black/80"
                animate={{
                    opacity: [0.8, 0.85, 0.8],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />

            {children}
        </div>
    );
}
