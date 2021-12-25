<script lang="ts">
    import getMsg from '@/utils/get-message';
    import OpenInNew from '@/assets/open-in-new.svg';
    import MailIcon from '@/assets/mail.svg';
    import SvgButton from './SvgButton.svelte';
    import { browser } from 'webextension-polyfill-ts';
    import CheckMarkButton from './CheckMarkButton.svelte';

    export let onCheck: () => void | null = null;
    export let href: string;
    export let title: string;
    export let disabled = false;
    export let type: 'message' | unknown | null = null;

    const linkClickHandler = (e: Event) => {
        e.stopPropagation();
        // Prevent double opening in Firefox
        e.preventDefault();
        void browser.tabs.create({ url: href, active: true });
    };
</script>

<div class="flex items-center w-full p-1 pr-4" class:disabled>
    {#if onCheck}
        <CheckMarkButton clickHandler={onCheck} title={getMsg('queryListCheckMark_title')} />
    {/if}
    <div class="flex items-center">
        {#if type == 'message'}
            <div class="h-4 w-4 mr-1">
                {@html MailIcon}
            </div>
        {/if}
        <span>{title}</span>
    </div>
    <span class="ml-2 text-skin-link opacity-50 hover:opacity-100">
        <SvgButton {href} title={getMsg('watchListOpenInNew_title')} on:click={linkClickHandler}>
            {@html OpenInNew}
        </SvgButton>
    </span>
</div>

<style lang="postcss">
    .disabled {
        @apply text-skin-gray pl-4;
    }
</style>
