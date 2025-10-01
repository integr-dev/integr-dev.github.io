import React, {useEffect, useRef, useState} from "react";

interface GradientOutlineProps {
    circleWidth: string;
    borderRadius: string;
    className?: string;
    children?: React.ReactNode;
}
type MouseListener = (pos: { x: number; y: number }) => void;

let mousePos = { x: 0, y: 0 };
const listeners: MouseListener[] = [];
let handlerRegistered = false;


function notifyListeners() {
    listeners.forEach(listener => listener(mousePos));
}

function registerHandler() {
    if (!handlerRegistered) {
        document.addEventListener("pointermove", (e: PointerEvent) => {
            mousePos = { x: e.clientX, y: e.clientY };
            notifyListeners();
        });
        handlerRegistered = true;
    }
}

function useMouse() {
    const [pos, setPos] = useState(mousePos);

    useEffect(() => {
        registerHandler();
        listeners.push(setPos);
        return () => {
            const idx = listeners.indexOf(setPos);
            if (idx !== -1) listeners.splice(idx, 1);
        };
    }, []);

    return pos;
}

export default function GradientOutline({ circleWidth, borderRadius, className = "", children }: GradientOutlineProps) {
    const ref = useRef<HTMLDivElement>(null);
    const {x, y} = useMouse();

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const xN = x - rect.left;
            const yN = y - rect.top;

            ref.current.style.setProperty('--x', `${xN}px`);
            ref.current.style.setProperty('--y', `${yN}px`);
        }
    }, [x, y]);

    return (
        <div
            ref={ref}
            className={`${className} entry relative p-[0.25rem]`}
            style={{
                "--border-radius": `calc(${borderRadius} + 0.25rem)`,
                "--circle-width": circleWidth,
            } as React.CSSProperties}
        >
            {children}
        </div>
    );
}