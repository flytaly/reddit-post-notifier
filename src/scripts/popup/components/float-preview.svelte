<script>
    import { onMount } from 'svelte';

    export let posts;
    export let containerElement;

    let previewElement;
    let imageInfo = null; // { url, width, height, loaded }
    let postText = null;

    $: {
        if (posts) {
            // Clear if post list was updated. Usefull in case
            // when a post is removed from the list but mouseleave event wasn't triggered
            imageInfo = null;
            postText = null;
        }
    }

    function setData(post) {
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

    const positionPreview = (e) => {
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
        let prevId;
        const mousemove = (e) =>
            window.requestAnimationFrame(() => {
                positionPreview(e);
            });
        const mouseover = (e) => {
            const { postId } = e.target.dataset;
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

<style>
    .preview {
        position: absolute;
        display: block;
        max-width: 300px;
        max-height: 200px;
        padding: 2px;
        font-size: 0.9em;
        word-wrap: break-word;
        overflow: hidden;
        background-color: var(--main-bg-color);
        border: 1px solid var(--hover-border-color);
        z-index: 100;
    }
    .hide {
        display: none;
    }
</style>

<div class="preview" bind:this={previewElement} class:hide={!imageInfo && !postText}>
    {#if imageInfo}
        {#if imageInfo.loaded}
            <img src={imageInfo.url} width={imageInfo.width} height={imageInfo.height} alt="preview" />
        {:else}
            <div style={`width: ${imageInfo.width}px; height: ${imageInfo.height}px`} />
        {/if}
    {:else}<span>{postText}</span>{/if}
</div>
