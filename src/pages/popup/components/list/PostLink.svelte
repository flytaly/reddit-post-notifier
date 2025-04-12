<script lang='ts'>
    import type { HTMLAttributes } from 'svelte/elements';
    import browser from 'webextension-polyfill';

    interface Props extends HTMLAttributes<HTMLAnchorElement> {
        postId: string;
        href: string;
        onOpen?: () => Promise<void>;
        children?: import('svelte').Snippet;
    }

    let { onOpen, postId, href, children, ...restProps }: Props = $props();

    const getCurrentTabIndex = async () => {
        const [currentTab] = await browser.tabs.query({ active: true, currentWindow: true });
        return currentTab?.index;
    };

    const clickHandler = async (ev: MouseEvent) => {
        ev.preventDefault();
        await browser.tabs.create({ url: href, active: false });
        if (onOpen) await onOpen();
    };

    // open links next to current tab
    const middleClickHandler = async (ev: MouseEvent) => {
        if (ev.button !== 1) return; // not a middle click
        ev.preventDefault();
        const index = await getCurrentTabIndex() + 1;
        browser.tabs.create({ url: href, active: false, index });
        if (onOpen) await onOpen();
    };
</script>

<a
    onclick={clickHandler}
    onauxclick={middleClickHandler}
    data-keys-target='post-link'
    data-post-id={postId}
    href={href}
    target="_blank"
    {...restProps}
>
    {@render children?.()}
</a>
