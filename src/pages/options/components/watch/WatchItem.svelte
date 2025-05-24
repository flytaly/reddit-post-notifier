<script lang='ts'>
    import getMsg from '@/utils/get-message';
    import type { InputChangeEv } from '@options/components/common/events';
    import IosCheckbox from '@options/components/common/IosCheckbox.svelte';
    import * as icons from '@options/lib/icons';
    import { tooltip } from '@options/lib/tooltip';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        itemDisabled?: boolean;
        name?: string;
        fetchBlocked?: boolean;
        errorMessage?: string;
        showEditBlock?: boolean;
        onDelete?: () => void;
        onFetch?: () => void;
        onCollapse?: () => void;
        onActiveToggle?: (e: InputChangeEv) => void;
        posts?: Snippet;
        toggles?: Snippet;
        children?: Snippet;
    }

    let {
        itemDisabled = false,
        name = '',
        fetchBlocked = false,
        errorMessage = '',
        showEditBlock = $bindable(false),
        onDelete = () => {},
        onCollapse = () => {},
        onFetch = () => {},
        onActiveToggle = () => {},
        posts: postsSnip,
        toggles: togglesSnip,
        children,
        ...restProps
    }: Props = $props();

    const toggleEditBlock = () => {
        showEditBlock = !showEditBlock;
        if (!showEditBlock) onCollapse();
    };
</script>

<div
    class={[
        'rounded-md hover:ring-1 hover:ring-skin-delimiter',
        { 'bg-skin-bg2 shadow-input-expand': showEditBlock },
    ]}
    {...restProps}>
    <div
        class={[
            'watch-item-grid rounded-md border border-dashed border-transparent bg-skin-bg',
            { 'border-b-skin-delimiter': showEditBlock },
        ]}
    >
        <!-- Input name -->
        <button
            class='flex h-full border-none p-0 px-2 text-left text-sm'
            onclick={toggleEditBlock}
            data-testid='input-name'
        >
            <div class='w-full overflow-hidden text-ellipsis whitespace-nowrap' class:font-bold={name}>
                {name}
            </div>
            {#if errorMessage}
                <div class='flex justify-center' use:tooltip={{ content: errorMessage }} data-testid='warning-icon'>
                    <div class='h-5 w-5 text-skin-error'>
                        {@html icons.WarningIcon}
                    </div>
                </div>
            {/if}
        </button>

        <!-- Fetch posts -->
        <button
            class='flex items-center p-0 text-skin-text hover:text-skin-accent2 disabled:text-skin-gray'
            onclick={onFetch}
            use:tooltip={{ content: getMsg('optionsWatchInputFetchDesc') }}
            disabled={fetchBlocked}
        >
            <div class='mr-1 h-5 w-5 text-skin-accent2'>
                {@html icons.RefreshIcon2}
            </div>
            <span>{getMsg('optionsSubredditFetch')}</span>
        </button>

        <IosCheckbox
            tooltipText={getMsg('optionWatchInputDisable')}
            checked={!itemDisabled}
            changeHandler={onActiveToggle}
            data-testid='isActive'
        />

        {@render togglesSnip?.()}

        <!-- Toggle editor -->
        <button
            class='flex items-center justify-start border-transparent bg-transparent px-2 py-0'
            onclick={toggleEditBlock}
        >
            <span class='h-5 w-5'>
                {@html icons.EditIcon}
            </span>
            <span>Edit</span>
        </button>

        <!-- Delete -->
        <button
            class='icon-button text-skin-accent'
            aria-label={getMsg('optionWatchInputDelete')}
            use:tooltip={{ content: getMsg('optionWatchInputDelete') }}
            onclick={onDelete}
        >
            <div class='h-5 w-5'>{@html icons.DeleteIcon}</div>
        </button>

        <!-- Post list row -->
        <div class='col-span-full'>
            {@render postsSnip?.()}
        </div>
    </div>

    <!-- Editor -->
    {#if showEditBlock}
        <div class='col-span-full m-2 pb-2'>
            {@render children?.()}
        </div>
    {/if}
</div>
