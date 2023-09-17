<script lang="ts">
    import { onMount } from 'svelte';
    import type { RedditItem, RedditMessage, RedditPost } from '@/reddit-api/reddit-types';
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

    const MAX_WIDTH = 300;
    const MAX_HEIGHT = 200;

    function getImageList(post: RedditPost): { url: string; width: number; height: number }[] | undefined {
        if (post.data.is_gallery && post.data.media_metadata) {
            const media = Object.values(post.data.media_metadata);
            const withPreview = media.find((m) => m.p?.length);
            if (withPreview) {
                return withPreview.p?.map((p) => {
                    return { url: p.u, width: p.x, height: p.y };
                });
            }
        }
        const image = post?.data?.preview?.images[0];
        return image?.resolutions?.map((p) => {
            return { url: p.url, width: p.width || 0, height: p.height || 0 };
        });
    }

    function selectFittingImage(imageList: ReturnType<typeof getImageList>) {
        if (!imageList?.length) return;
        let result = imageList.find((i) => {
            return i.width > MAX_WIDTH && i.height > MAX_HEIGHT;
        });
        result = result || imageList[0];
        result.width = Math.max(result.width, MAX_WIDTH);
        result.height = Math.max(result.height, MAX_HEIGHT);

        const aspectRatio = result.width / result.height;
        if (aspectRatio > 1) {
            result.width = Math.min(MAX_WIDTH, result.width);
            result.height = result.width / aspectRatio;
            return result;
        }
        result.height = Math.min(MAX_HEIGHT, result.height);
        result.width = result.height * aspectRatio;
        return result;
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
                const imgList = getImageList(post);
                const image = selectFittingImage(imgList);
                if (!image) return;
                imageInfo = { ...image, loaded: false };
                const imgElem = new Image();
                imgElem.onload = () => {
                    if (imageInfo?.url !== image.url) return;
                    imageInfo.loaded = true;
                };
                imgElem.src = image.url;

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
    style={`max-width: ${MAX_WIDTH}px; max-height: ${MAX_HEIGHT}px`}
>
    {#if imageInfo}
        <div style={`width: ${Number(imageInfo.width)}px; height: ${Number(imageInfo.height)}px`}>
            {#if imageInfo.loaded}
                <img
                    src={imageInfo.url}
                    width={imageInfo.width}
                    height={imageInfo.height}
                    alt="preview"
                    class="block min-h-full min-w-full"
                />
            {/if}
        </div>
    {:else}<span>{postText}</span>{/if}
</div>

<style lang="postcss">
    .preview {
        @apply absolute z-50 overflow-hidden break-words border
                border-skin-base
                bg-skin-bg p-1
                text-xs;
    }
</style>
