import { quadOut } from 'svelte/easing';

export function slidehorizontal(node, { duration, easing = quadOut }) {
    return {
        duration,
        css: (t) => {
            const eased = easing(t);
            return `
                    transform: translate(${(1 - eased) * 100}%, 0);
                    opacity: ${eased};
					`;
        },
    };
}
