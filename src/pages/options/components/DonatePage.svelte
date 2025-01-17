<script lang="ts">
    import { HeartIcon, QRCodeBTC, QRCodeDoge, QRCodeETH, QRCodeLTC, QRCodeSOL, QRCodeXLM } from '@options/lib/icons';
    import DonateAddress from './DonateAddress.svelte';

    const addresses = [
        { name: 'Bitcoin (BTC)', address: 'bc1q6w68rerfyy7ex45fjwhwfe36zs5qjvwwl3xgz5', QRCode: QRCodeBTC },
        { name: 'Ethereum (ETH)', address: '0xE36CeaEa3Da6f24A629450b927cd380973E72DD9', QRCode: QRCodeETH },
        { name: 'Litecoin (LTC)', address: 'LTzrVCTUobG7XmDAjMYdRbAF22oArZGoVZ', QRCode: QRCodeLTC },
        { name: 'Solana', address: 'ArfcBJfZE8UERucen9W9UfjX2D2yV2TctAnD6ovrQzKQ', QRCode: QRCodeSOL },
        { name: 'Doge', address: 'DGyddoAuhfnHfF3qxpv9Zsrt3H399i4Rxe', QRCode: QRCodeDoge },
        {
            name: 'Stellar (XLM)',
            address: 'GCWW6CLB2L3H5SYDSKFG2PWNISLRQDILZXPXTVU64VV5WAKFPMOINMNF',
            QRCode: QRCodeXLM,
        },
    ];
</script>

<div>
    <div class="w-full max-w-4xl text-base">
        <main class="my-5 space-y-10">
            <h1 class="mx-auto flex items-center justify-center gap-1 text-lg font-bold text-skin-accent">
                <span class="h-6 w-6 text-rose-500">{@html HeartIcon}</span>
                <span>Support extension’s development and maintenance</span>
            </h1>
            <section>
                <h2 class="mb-4 text-lg font-bold">Crypto</h2>
                <div class="ml-8 space-y-8">
                    <div>
                        <h3 class="mb-4 text-sm" data-l10n-id="donateNowPayments">in any cryptocurrency via NOWPayments</h3>
                        <a
                            href="https://nowpayments.io/donation/flytaly"
                            class="inline"
                            target="_blank"
                            title="nowpayments donation"
                            rel="noreferrer"
                        >
                            <img
                                class="h-16 w-auto"
                                src="https://nowpayments.io/images/embeds/donation-button-black.svg"
                                alt="Crypto donation button by NOWPayments"
                            />
                        </a>
                    </div>
                    <div>
                        <h3 class="mb-4 text-sm">or directly to the addresses</h3>
                        <ul class="grid grid-cols-2 gap-6">
                            {#each addresses as { name, address, QRCode }}
                                <DonateAddress {address} {name}>
                                    {#snippet qr()}
                                        <span>{@html QRCode}</span>
                                    {/snippet}
                                </DonateAddress>
                            {/each}
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    </div>
</div>

<style>
</style>
