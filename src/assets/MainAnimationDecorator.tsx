import {useEffect} from "react";

interface MainAnimationDecoratorProps {
    renderFunction: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export function MainAnimationDecorator(props: MainAnimationDecoratorProps) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    useEffect(() => {
        if (prefersReducedMotion) return;
        const canvas = document.getElementById("main_decorator") as HTMLCanvasElement;
        if (canvas) return animateOnCanvas(canvas, props.renderFunction);
    }, [prefersReducedMotion, props.renderFunction]);

    if (prefersReducedMotion) return <> </>;


    return (
        <canvas className="w-full h-full" id="main_decorator"></canvas>
    );
}

function animateOnCanvas(canvas: HTMLCanvasElement, renderFunction: (ctx: CanvasRenderingContext2D, width: number, height: number) => void) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    };

    const render = () => {
        if (!ctx) return;

        renderFunction(ctx, canvas.width, canvas.height);

        animationFrameId = requestAnimationFrame(render);
    };

    // Initialize canvas size and add resize listener
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", resizeCanvas);
    };
}