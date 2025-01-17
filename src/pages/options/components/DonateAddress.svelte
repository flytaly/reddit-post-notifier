<script lang="ts">
    import { CheckMarkIcon, CopyIcon, QRCode } from '@options/lib/icons';

    interface Props {
        address: string;
        name: string;
        qr?: import('svelte').Snippet;
    }

    let { address, name, qr }: Props = $props();

    let wasCopied = $state(false);

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

    let isOpened = $state(false);

    const toggleQRCode = () => {
        isOpened = !isOpened;
    };
</script>

<li>
    <b class="mb-1">{name}</b>
    <div class="rounded-sm border border-skin-delimiter bg-skin-bg2 px-1 py-1 text-sm">
        <div class="flex">
            <span class="mr-4 break-all">{address}</span>
            <button
                onclick={copyAddress}
                class="ml-auto h-5 w-5 flex-shrink-0 hover:text-skin-accent2"
                class:text-skin-success={wasCopied}
                title="copy the address"
            >
                {#if wasCopied}
                    {@html CheckMarkIcon}
                {:else}
                    {@html CopyIcon}
                {/if}
            </button>
            <button onclick={toggleQRCode} class="ml-1 h-5 w-5 hover:text-skin-accent2" title="show QR code">
                {@html QRCode}
            </button>
        </div>
        <div class="flex justify-center transition-all duration-700" class:hidden={!isOpened}>
            <span class="h-56 w-56">
                {@render qr?.()}
            </span>
        </div>
    </div>
</li>
