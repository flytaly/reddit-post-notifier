<script lang='ts'>
    import { BackupIcon, HeartIcon, HelpCircleIcon, LogoIcon, SettingsIcon, WatchListIcon } from '@options/lib/icons';
    import type { PageId } from '@options/lib/routes';
    import { routes } from '@options/lib/routes';
    import { rateLimits } from '@options/lib/store';
    import getMsg from '@/utils/get-message';
    import { tooltip } from '@/pages/options/lib/tooltip';

    interface Props {
        current: PageId;
    }

    let { current }: Props = $props();

    const pageIcons: Record<PageId, string> = {
        'watch': WatchListIcon,
        'import-export': BackupIcon,
        'settings': SettingsIcon,
        'info': HelpCircleIcon,
        'donate': HeartIcon,
    };

    function formatTime(ts: number) {
        const d = new Date(ts);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
</script>

<aside class='sticky top-4 flex min-h-[calc(100vh-1rem)] flex-col pt-4 text-sm'>
    <a href='./watch.html' class='self-center text-skin-text hover:text-skin-text'>
        <div class={[
            'logo',
            'mx-auto mb-1 w-[4.5rem] translate-x-[2px]',
        ]}>
            {@html LogoIcon}
        </div>
    </a>
    <nav class='flex flex-col p-4 leading-8'>
        {#each Object.values(routes) as { id, href, name, sections } (id)}
            <a
                {href}
                class={[
                    'flex items-center',
                    { 'text-skin-text': current !== id },
                    { 'font-bold text-skin-accent': current === id },
                ]}>
                {#if pageIcons[id]}
                    <span
                        class={[
                            'mr-1 h-5 w-5',
                            { 'text-rose-300': id === 'donate' },
                        ]}
                    >
                        {@html pageIcons[id]}
                    </span>
                {/if}
                {name}
            </a>
            {#each Object.values(sections) as { id, name } (id)}
                <a href={`${href}#${String(id)}`} class='text-skin-text ml-8'>{name}</a>
            {/each}
        {/each}
    </nav>
    <div class='mt-auto w-full text-xs'>
        {#if $rateLimits && typeof $rateLimits.used === 'number'}
            <div class='my-4 grid w-max grid-cols-2 gap-x-4 gap-y-1'>
                <span
                    use:tooltip={{ content: getMsg('rateLimitsDescription'), allowHTML: true }}
                    class='col-span-2 mt-4 flex items-center border-b border-skin-delimiter'
                >
                    <b class='font-bold'>{getMsg('rateLimits')}</b>
                    <span class='ml-2 inline-flex h-[0.85rem] w-[0.85rem] text-skin-text'>
                        {@html HelpCircleIcon}
                    </span>
                </span>
                {#if $rateLimits.used}
                    <div>used</div>
                    <div>{$rateLimits.used}</div>
                {/if}
                {#if $rateLimits.remaining}
                    <div>remaining</div>
                    <div>{$rateLimits.remaining}</div>
                {/if}
                {#if $rateLimits.reset}
                    <div>reset at</div>
                    <div>{formatTime($rateLimits.reset)}</div>
                {/if}
            </div>
        {/if}
    </div>
</aside>

<style lang='postcss'>
    .logo :global(.eye) {
        fill: var(--color-accent);
    }
    .logo:hover :global(.eye) {
        fill: var(--color-accent2);
    }
</style>
