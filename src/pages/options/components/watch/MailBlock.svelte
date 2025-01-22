<script lang='ts'>
    import BlockDescription from '@options/components/common/BlockDescription.svelte';
    import { storageData } from '@options/lib/store';
    import NotifyToggle from '../common/NotifyToggle.svelte';
    import IosCheckbox from '../common/IosCheckbox.svelte';
    import getMsg from '@/utils/get-message';
    import type { MailInfo } from '@/storage/storage-types';
    import storage from '@/storage';

    const defaultData = { error: '', mailNotify: false, checkMail: false } as MailInfo;

    let mailData = $state(defaultData);

    $effect(() => {
        mailData = $storageData.mail || defaultData;
    });

    const checkHandler = async (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        mailData.checkMail = checked;
        if (!checked)
            mailData.mailNotify = false;
        await storage.saveMail($state.snapshot(mailData));
    };
    const notifyHandler = async (e: Event) => {
        const checked = (e.currentTarget as HTMLInputElement).checked;
        mailData.mailNotify = checked;
        if (checked)
            mailData.checkMail = true;
        await storage.saveMail($state.snapshot(mailData));
    };
</script>

<div class='text-sm'>
    <BlockDescription>
        <span class='flex items-center'>
            <span>{getMsg('optionMailDescription')}</span>
        </span>
    </BlockDescription>
    <div class='my-2 flex gap-6'>
        <div>
            <IosCheckbox
                bind:checked={mailData.checkMail}
                changeHandler={checkHandler}
                tooltipText={getMsg('optionMailCheck_title')}
            >
                <span>{getMsg('optionMailCheck')}</span>
            </IosCheckbox>
        </div>
        <div class='w-min'>
            <NotifyToggle
                bind:checked={mailData.mailNotify}
                changeHandler={notifyHandler}
                tooltipText={getMsg('optionMailNotify_title')}
            />
        </div>
    </div>
    {#if mailData?.error}
        <div class='mt-2 text-skin-error'><span>Error: </span><span>{mailData.error}</span></div>
    {/if}
</div>
