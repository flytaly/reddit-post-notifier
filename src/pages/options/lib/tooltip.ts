import tippy, { type Props } from 'tippy.js';

export function tooltip(node: Element, params: Partial<Props>) {
    const tip = tippy(node, {
        theme: 'material',
        delay: [200, 0],
        duration: [300, 0],
        ...params,
    });
    if (!params.content)
        tip.disable();

    return {
        update: (newParams: Partial<Props>) => {
            tip.setProps(newParams);
            if (!params.content)
                return tip.disable();
            tip.enable();
        },
        destroy: () => {
            tip.destroy();
        },
    };
}
