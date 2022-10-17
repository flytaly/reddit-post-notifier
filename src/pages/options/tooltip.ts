import tippy, { type Props } from 'tippy.js';

export function tooltip(node: Element, params: Partial<Props>) {
    const tip = tippy(node, params);
    return {
        update: (newParams: Partial<Props>) => {
            tip.setProps(newParams);
        },
        destroy: () => {
            tip.destroy();
        },
    };
}
