<script lang='ts'>
    import type { RedditItem, RedditMessage, RedditPost } from '@/reddit-api/reddit-types';
    import { RedditObjectKind } from '@/reddit-api/reddit-types';
    import { onMount } from 'svelte';

    interface Props {
        posts: RedditItem[] | RedditMessage[];
        containerElement: HTMLElement;
    }

    let { posts, containerElement }: Props = $props();

    let previewElement: HTMLElement | undefined = $state();
    let imageInfo: { url: string; width: number; height: number; loaded: boolean } | null = $state(null);
    let postContent: string | null = $state(null);

    $effect(() => {
        if (posts) {
            // Clear if post list was updated. Usefull in case
            // when a post is removed from the list but mouseleave event wasn't triggered
            imageInfo = null;
            postContent = null;
        }
    });

    const MAX_WIDTH = 340;
    const MAX_HEIGHT = 280;
    const MAX_HEIGHT_IMG = 180;
    const MAX_HEIGHT_TEXT = 180;

    function getImageList(post: RedditPost): { url: string; width: number; height: number }[] | undefined {
        if (post.data.is_gallery && post.data.media_metadata) {
            const media = Object.values(post.data.media_metadata);
            const withPreview = media.find(m => m.p?.length);
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
        if (!imageList?.length)
            return;
        let result = imageList.find((i) => {
            return i.width > MAX_WIDTH && i.height > MAX_HEIGHT_IMG;
        });
        result = result || imageList[0];
        result.width = Math.max(result.width, MAX_WIDTH);
        result.height = Math.max(result.height, MAX_HEIGHT_IMG);

        const aspectRatio = result.width / result.height;
        if (aspectRatio > 1) {
            result.width = Math.min(MAX_WIDTH, result.width);
            result.height = result.width / aspectRatio;
            return result;
        }
        result.height = Math.min(MAX_HEIGHT_IMG, result.height);
        result.width = result.height * aspectRatio;
        return result;
    }

    function setData(post: RedditItem | RedditMessage) {
        imageInfo = null;
        postContent = null;
        const sliceText = (str: string, max = 400) => (str.length > max ? `${str.slice(0, max)}...` : str);
        switch (post.kind) {
            case RedditObjectKind.link: {
                if (post.data.selftext_html) {
                    postContent = post.data.selftext_html;
                }
                else if (post.data.selftext) {
                    postContent = sliceText(post.data.selftext);
                }
                const imgList = getImageList(post);
                const image = selectFittingImage(imgList);
                if (!image)
                    return;
                imageInfo = { ...image, loaded: false };
                const imgElem = new Image();
                imgElem.onload = () => {
                    if (imageInfo?.url !== image.url)
                        return;
                    imageInfo.loaded = true;
                };
                imgElem.src = image.url;
                if (!postContent && !imageInfo) {
                    postContent = post.data.url;
                }

                return;
            }
            case RedditObjectKind.comment:
            case RedditObjectKind.message:
                postContent = sliceText(post.data.body || '');
                break;
            default:
                break;
        }
    }

    const positionPreview = (e: MouseEvent) => {
        if (!previewElement)
            return;
        const { pageX, pageY, clientY } = e;
        previewElement.style.left = `${pageX + 10}px`;
        const { height } = previewElement.getBoundingClientRect();
        const offset = document.documentElement.clientHeight - clientY - height - 10;
        if (offset < 0)
            previewElement.style.top = `${pageY + offset}px`;
        else
            previewElement.style.top = `${pageY + 10}px`;
    };

    onMount(() => {
        let prevId: string | null;
        const mousemove = (e: Event) =>
            window.requestAnimationFrame(() => {
                positionPreview(e as MouseEvent);
            });
        const mouseover = (e: Event) => {
            const { postId } = (e.target as HTMLElement).dataset;
            if (postId && postId !== prevId) {
                // array union bug: https://github.com/microsoft/TypeScript/issues/44373
                const post = (posts as { data: { id: string } }[]).find(p => p.data.id === postId) as
                    | RedditMessage
                    | RedditItem;
                if (!post)
                    return;
                setData(post);
                prevId = postId;
                window.requestAnimationFrame(() => {
                    positionPreview(e as MouseEvent);
                });
            }
        };
        const mouseleave = () => {
            prevId = null;
            imageInfo = null;
            postContent = null;
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
    class="floating-preview absolute z-50 overflow-hidden break-words border border-skin-border bg-skin-bg p-1 text-xs"
    class:hidden={!imageInfo && !postContent}
    bind:this={previewElement}
    style={`max-width: ${MAX_WIDTH}px; max-height: ${MAX_HEIGHT}px`}
>
    {#if imageInfo}
        <div style={`width: ${Number(imageInfo.width)}px; height: ${Number(imageInfo.height)}px`}>
            {#if imageInfo.loaded}
                <img
                    src={imageInfo.url}
                    alt='preview'
                    class='block'
                />
            {/if}
        </div>
    {/if}
    <div style={`max-height: ${MAX_HEIGHT_TEXT}px`}>{@html postContent}</div>
</div>

<style>
    .hidden {
        visibility: hidden;
    }

    .floating-preview :global(li) {
        list-style: disc;
        margin-left: 1rem;
    }

</style>
