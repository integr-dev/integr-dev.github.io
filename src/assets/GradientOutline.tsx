import React, {useEffect, useRef} from "react";

interface GradientOutlineProps {
    circleWidth: string;
    className?: string;
    children?: React.ReactNode;
}

export default function GradientOutline({ circleWidth, className = "", children }: GradientOutlineProps) {
    const elRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            const rect = elRef.current?.getBoundingClientRect();
            if (rect) {
                const localX = e.clientX - rect.left;
                const localY = e.clientY - rect.top;
                elRef.current?.style.setProperty("--x", `${localX}px`);
                elRef.current?.style.setProperty("--y", `${localY}px`);
            }
        };
        window.addEventListener("mousemove", handle);
        return () => window.removeEventListener("mousemove", handle);
    }, []);

    return (
        <div
            className={`${className} entry relative p-[0.2rem] bg-transparent h-full`}
            style={{
                "--border-radius": "calc(var(--radius-box)*1.08)",
                "--circle-width": circleWidth,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}