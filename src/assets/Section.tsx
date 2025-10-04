import React, { useEffect, useRef } from "react";

function Section({ className, children }: { className: string, children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    ref.current?.classList.add("visible");
                } else ref.current?.classList.remove("visible");
            },
            { threshold: 0.01 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className={className + " section"} ref={ref}>
            {children}
        </div>
    );
}

export default Section;