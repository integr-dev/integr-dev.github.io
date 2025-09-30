import React, {useEffect, useRef} from "react";

interface GradientOutlineProps {
    circleWidth: string;
    borderRadius: string;
    className?: string;
    children?: React.ReactNode;
}

export default function GradientOutline({ circleWidth, borderRadius, className = "", children }: GradientOutlineProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handle = (e: PointerEvent) => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                ref.current.style.setProperty('--x', `${x}px`);
                ref.current.style.setProperty('--y', `${y}px`);
            }
        };

        document.addEventListener("pointermove", handle);
        return () => document.removeEventListener("pointermove", handle);
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} entry relative p-[0.25rem]`}
            style={{
                "--border-radius": borderRadius,
                "--circle-width": circleWidth,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}