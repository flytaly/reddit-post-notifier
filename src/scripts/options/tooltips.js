import tippy from 'tippy.js';
import { translateElement } from '../l10n';

export const setTooltips = () => {
    tippy('.tooltip-button', {
        allowHTML: true,
        content: (toolTipAnchor) => {
            const { tooltipTmp } = toolTipAnchor.dataset;
            if (!tooltipTmp) return '';
            const template = document.getElementById(tooltipTmp);
            translateElement(template.content);
            return template.innerHTML;
        },
    });
};
