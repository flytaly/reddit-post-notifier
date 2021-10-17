import { quadOut } from 'svelte/easing';
import type { EasingFunction, TransitionConfig } from 'svelte/types/runtime/transition';

function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}

export type SlideConfig = {
    duration?: number;
    easing?: EasingFunction;
    id?: string;
};

export function slideHorizontal(node: Element, { duration, easing = quadOut }: SlideConfig): TransitionConfig {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    return {
        duration,
        css: (t) => {
            const eased = easing(t);
            return `
                    transform: ${transform} translate(${(1 - eased) * 100}%, 0);
                    opacity: ${eased};
					`;
        },
    };
}

/* Move `node` to y coordinate  */
export const slideVertical = (
    node: Element,
    y: number,
    { duration, easing = quadOut }: SlideConfig,
): TransitionConfig => {
    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;
    const { top } = node.getBoundingClientRect();
    const distance = top - y;
    return {
        duration: duration * clamp(Math.abs(distance) / 100, 1, 2),
        css: (t) => {
            const eased = easing(t);
            return `transform: ${transform} translate(0, ${(eased - 1) * distance}px)`;
        },
    };
};
