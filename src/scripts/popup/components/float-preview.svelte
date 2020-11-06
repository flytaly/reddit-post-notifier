<script>
    import { onMount } from 'svelte';

    export let posts;
    export let containerElement;

    let previewElement;
    let imageInfo = null; // { url, width, height }
    let postText = null;

    function setData(post) {
        if (post.data.selftext) {
            postText = post.data.selftext.length > 400 ? `${post.data.selftext.slice(0, 400)}...` : post.data.selftext;
            imageInfo = null;
        } else {
            const image = post?.data?.preview?.images[0];
            if (image?.resolutions?.length) {
                const { url, width, height } = image.resolutions[1] || image.resolutions[0];
                imageInfo = url ? { url, width, height } : null;
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
            const { id } = e.target.dataset;
            if (id && id !== prevId) {
                const post = posts.find((p) => p.data.id === id);
                if (!post) return;
                setData(post);
                prevId = id;
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
        containerElement.addEventListener('mousemove', mousemove);
        containerElement.addEventListener('mouseover', mouseover);
        containerElement.addEventListener('mouseleave', mouseleave);
        return () => {
            containerElement.removeEventListener('mousemove', mousemove);
            containerElement.removeEventListener('mouseover', mouseover);
            containerElement.removeEventListener('mouseleave', mouseleave);
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
        <img src={imageInfo.url} width={imageInfo.width} height={imageInfo.height} alt="preview" />
    {:else}<span>{postText}</span>{/if}
</div>
