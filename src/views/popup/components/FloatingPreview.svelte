<script lang="ts">
    import { onMount } from 'svelte';
    import type { RedditPost } from '@/reddit-api/reddit-types';

    export let posts: RedditPost[];
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

    function setData(post: RedditPost) {
        imageInfo = null;
        if (post.data.selftext) {
            postText = post.data.selftext.length > 400 ? `${post.data.selftext.slice(0, 400)}...` : post.data.selftext;
        } else {
            const image = post?.data?.preview?.images[0];
            if (image?.resolutions?.length) {
                const { url, width, height } = image.resolutions[1] || image.resolutions[0];
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
        let prevId: string;
        const mousemove = (e: MouseEvent) =>
            window.requestAnimationFrame(() => {
                positionPreview(e);
            });
        const mouseover = (e: MouseEvent) => {
            const { postId } = (e.target as HTMLElement).dataset;
            if (postId && postId !== prevId) {
                const post = posts.find((p) => p.data.id === postId);
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

        elem.addEventListener('mousemove', mousemove);
        elem.addEventListener('mouseover', mouseover);
        elem.addEventListener('mouseleave', mouseleave);
        return () => {
            elem.removeEventListener('mousemove', mousemove);
            elem.removeEventListener('mouseover', mouseover);
            elem.removeEventListener('mouseleave', mouseleave);
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
            <div style={`width: ${imageInfo.width}px; height: ${imageInfo.height}px`} />
        {/if}
    {:else}<span>{postText}</span>{/if}
</div>

<style lang="postcss">
    .preview {
        @apply absolute max-w-[18rem] max-h-[13rem] p-1
                text-xs break-words overflow-hidden
                bg-skin-base
                border border-skin-base
                z-50;
    }
</style>
