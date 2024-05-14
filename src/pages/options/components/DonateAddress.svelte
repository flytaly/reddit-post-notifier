<script lang='ts'>
    import { CheckMarkIcon, CopyIcon, QRCode } from '@options/lib/icons';

    export let address: string;
    export let name: string;

    let wasCopied = false;

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            wasCopied = true;
            setTimeout(() => (wasCopied = false), 2000);
        }
        catch (error) {
            console.error(error);
        }
    };

    let isOpened = false;

    const toggleQRCode = () => {
        isOpened = !isOpened;
    };
</script>

<li>
    <b class='mb-1'>{name}</b>
    <div class='rounded-sm border border-skin-delimiter bg-skin-bg2 py-1 px-1 text-sm'>
        <div class='flex'>
            <span class='mr-4 break-all'>{address}</span>
            <button
                on:click={copyAddress}
                class='ml-auto h-5 w-5 flex-shrink-0 hover:text-skin-accent2'
                class:text-skin-success={wasCopied}
                title='copy the address'
            >
                {#if wasCopied}
                    {@html CheckMarkIcon}
                {:else}
                    {@html CopyIcon}
                {/if}
            </button>
            <button on:click={toggleQRCode} class='ml-1 h-5 w-5 hover:text-skin-accent2' title='show QR code'>
                {@html QRCode}
            </button>
        </div>
        <div class='flex justify-center transition-all duration-700' class:hidden={!isOpened}>
            <span class='h-56 w-56'>
                <slot name='qr' />
            </span>
        </div>
    </div>
</li>
