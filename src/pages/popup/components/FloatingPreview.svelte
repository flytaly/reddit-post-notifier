<script lang="ts">
    import { onMount } from 'svelte';
    import type { RedditItem, RedditMessage } from '@/reddit-api/reddit-types';
    import { RedditObjectKind } from '@/reddit-api/reddit-types';

    export let posts: RedditItem[] | RedditMessage[];
    export let containerElement: HTMLElement;

    let previewElement: HTMLElement;
    let imageInfo: { url: string; width: number; height: number; loaded: boolean } | null = null;
    let postText: string | null = null;

    $: {
        if (posts) {
            // Clear if post list was updated. Usefull in case
            // when a post is removed from the list but mouseleave event wasn't triggered
            imageInfo = null;
            postText = null;
        }
    }

    function setData(post: RedditItem | RedditMessage) {
        imageInfo = null;
        const sliceText = (str: string, max = 400) => (str.length > max ? `${str.slice(0, max)}...` : str);
        switch (post.kind) {
            case RedditObjectKind.link: {
                if (post.data.selftext) {
                    postText = sliceText(post.data.selftext);
                    return;
                }
                const image = post?.data?.preview?.images[0];
                if (image?.resolutions?.length) {
                    const { url, width = 300, height = 200 } = image.resolutions[1] || image.resolutions[0];
                    if (url) {
                        imageInfo = { url, width, height, loaded: false };
                        const imgElem = new Image();
                        imgElem.onload = () => {
                            if (imageInfo?.url === url) {
                                imageInfo.loaded = true;
                            }
                        };
                        imgElem.src = url;
                    }
                }
                postText = !imageInfo ? post.data.url : null;
                return;
            }
            case RedditObjectKind.comment:
            case RedditObjectKind.message:
                postText = sliceText(post.data.body || '');
                return;
            default:
                break;
        }
    }

    const positionPreview = (e: MouseEvent) => {
        if (!previewElement) return;
        const { pageX, pageY, clientY } = e;
        previewElement.style.left = `${pageX + 10}px`;
        const { height } = previewElement.getBoundingClientRect();
        const offset = document.documentElement.clientHeight - clientY - height - 10;
        if (offset < 0) {
            previewElement.style.top = `${pageY + offset}px`;
        } else {
            previewElement.style.top = `${pageY + 10}px`;
        }
    };

    onMount(() => {
        let prevId: string | null;
        const mousemove = (e: MouseEvent) =>
            window.requestAnimationFrame(() => {
                positionPreview(e);
            });
        const mouseover = (e: MouseEvent) => {
            const { postId } = (e.target as HTMLElement).dataset;
            if (postId && postId !== prevId) {
                // array union bug: https://github.com/microsoft/TypeScript/issues/44373
                const post = (posts as { data: { id: string } }[]).find((p) => p.data.id === postId) as
                    | RedditMessage
                    | RedditItem;
                if (!post) return;
                setData(post);
                prevId = postId;
                window.requestAnimationFrame(() => {
                    positionPreview(e);
                });
            }
        };
        const mouseleave = () => {
            prevId = null;
            imageInfo = null;
            postText = null;
        };

        const elem = containerElement.querySelector('[data-floatpreview-target]');

        elem?.addEventListener('mousemove', mousemove);
        elem?.addEventListener('mouseover', mouseover);
        elem?.addEventListener('mouseleave', mouseleave);
        return () => {
            elem?.removeEventListener('mousemove', mousemove);
            elem?.removeEventListener('mouseover', mouseover);
            elem?.removeEventListener('mouseleave', mouseleave);
        };
    });
</script>

<div
    class={`preview ${!imageInfo && !postText ? 'hidden' : 'block'}`}
    bind:this={previewElement}
    class:hide={!imageInfo && !postText}
>
    {#if imageInfo}
        {#if imageInfo.loaded}
            <img
                src={imageInfo.url}
                width={imageInfo.width}
                height={imageInfo.height}
                alt="preview"
                class="block min-w-min"
            />
        {:else}
            <div style={`width: ${Number(imageInfo.width)}px; height: ${Number(imageInfo.height)}px`} />
        {/if}
    {:else}<span>{postText}</span>{/if}
</div>

<style lang="postcss">
    .preview {
        @apply absolute z-50 max-h-[13rem] max-w-[18rem]
                overflow-hidden break-words border
                border-skin-base
                bg-skin-bg p-1
                text-xs;
    }
</style>
