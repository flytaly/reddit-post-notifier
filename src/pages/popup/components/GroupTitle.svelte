<script lang='ts'>
    import browser from 'webextension-polyfill';
    import { storageData } from '../store/store';
    import CheckMarkButton from './CheckMarkButton.svelte';
    import SvgButton from './SvgButton.svelte';
    import MailIcon from '@/assets/mail.svg?raw';
    import OpenInNew from '@/assets/open-in-new.svg?raw';
    import getMsg from '@/utils/get-message';
    // import SearchIcon from '@/assets/search.svg?raw';
    import FilterOnIcon from '@/assets/filter-on.svg?raw';
    import NotifyOffIcon from '@/assets/notify-off.svg?raw';
    import NotifyOnIcon from '@/assets/notify.svg?raw';
    import UpdatesDisabledIcon from '@/assets/updates-disable.svg?raw';
    import WarningIcon from '@/assets/warning.svg?raw';
    import type { PostGroup } from '@/utils/post-group';

    export let group: PostGroup;
    export let onCheck: (() => Promise<void>) | null = null;
    export let disabled = false;

    const linkClickHandler = async (e: Event) => {
        e.stopPropagation();
        // Prevent double opening in Firefox
        e.preventDefault();
        if (onCheck && $storageData.options.delListAfterOpening)
            await onCheck();

        void browser.tabs.create({ url: group.href, active: true });
    };
</script>

<div class='flex w-full items-center p-1 pr-4' class:disabled={disabled || group.updatesDisabled}>
    {#if onCheck}
        <CheckMarkButton clickHandler={onCheck} title={getMsg('watchListCheckMark_title')} />
    {/if}
    <div class='flex items-center space-x-1'>
        {#if group.type === 'message' || group.type === 'account-message'}
            <div class='h-4 w-4 shrink-0 text-skin-gray' title={getMsg('watchListMailIcon')}>
                {@html MailIcon}
            </div>
            <!-- {:else if group.type == 'search'}
            <div class="h-4 w-4 text-skin-gray" title="Reddit search">
                {@html SearchIcon}
            </div> -->
        {/if}
        <span class='mr-auto max-w-[40ch] overflow-hidden text-ellipsis whitespace-nowrap'>{group.title}</span>
        {#if group.updatesDisabled}
            <div class='h-4 w-4 shrink-0 text-skin-gray' title={getMsg('watchListUpdatesOff')}>
                {@html UpdatesDisabledIcon}
            </div>
        {/if}
        {#if group.error}
            <div class='h-4 w-4 shrink-0 text-skin-error' title={group.error}>
                {@html WarningIcon}
            </div>
        {/if}
        {#if group.notify === 'on'}
            <div class='h-4 w-4 shrink-0 text-skin-gray' title={getMsg('watchListNotifyOn')}>
                {@html NotifyOnIcon}
            </div>
        {:else if group.notify === 'off'}
            <div class='h-4 w-4 shrink-0 text-skin-gray' title={getMsg('watchListNotifyOff')}>
                {@html NotifyOffIcon}
            </div>
        {/if}
        {#if group.filter === 'on'}
            <div class='h-4 w-4 shrink-0 text-skin-gray' title={getMsg('watchListFiltersOn')}>
                {@html FilterOnIcon}
            </div>
        {/if}
    </div>
    <span class='ml-2 text-skin-link opacity-50 hover:opacity-100'>
        <SvgButton href={group.href} title={getMsg('watchListOpenInNew_title')} on:click={linkClickHandler}>
            {@html OpenInNew}
        </SvgButton>
    </span>
</div>

<style lang='postcss'>
    .disabled {
        @apply text-skin-gray;
    }
</style>
