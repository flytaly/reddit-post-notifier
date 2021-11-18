<script lang="ts">
    import auth from '@/reddit-api/auth';
    import storage from '@/storage';
    import getMsg from '@/utils/get-message';
    import { BellIcon } from '@/views/options/icons';
    import { storageData } from '../store';
    import Labeled from './Labeled.svelte';
    import OptionsItem from './OptionsItem.svelte';

    let messages: boolean;
    let messagesNotify: boolean;
    let refreshToken: string;
    let authError = '';
    let isAuthorizing = false;

    $: ({ messages, messagesNotify } = $storageData.options);
    $: {
        refreshToken = $storageData.refreshToken;
        if (!refreshToken) {
            $storageData.options.messages = false;
            $storageData.options.messagesNotify = false;
        }
    }

    const authorize = async () => {
        isAuthorizing = true;
        try {
            await auth.login();
            await storage.saveOptions({ messages: true, messagesNotify: true });
        } catch (e) {
            console.error(e);
            authError = e.message;
        }
        isAuthorizing = false;
    };

    const signOut = async () => {
        isAuthorizing = true;
        await storage.clearAuthData();
        isAuthorizing = false;
        await storage.saveOptions({ messages: false, messagesNotify: false });
    };

    const getBtnMessage = (authorized: boolean, loading: boolean) => {
        if (loading) return getMsg('optionStartAuthBtnDisabled');
        return getMsg(authorized ? 'optionSignOutBtn' : 'optionStartAuthBtn');
    };
</script>

<OptionsItem title={getMsg('optionAuthorization')}>
    <div slot="description">{getMsg('optionAuthorizationDescription')}</div>
    <div slot="controls">
        <div class="flex flex-col items-end min-w-[10rem]">
            <div class={`${refreshToken ? 'text-skin-success' : 'text-skin-accent'}`}>
                {getMsg(refreshToken ? 'optionIsAuthMsg' : 'optionNoAuthMsg')}
            </div>
            <button on:click={refreshToken ? signOut : authorize} disabled={isAuthorizing}>
                {getBtnMessage(!!refreshToken, isAuthorizing)}</button
            >
            <div class="text-skin-error">{authError}</div>
        </div>
    </div>
</OptionsItem>
<OptionsItem title={getMsg('optionMail')} column>
    <div slot="description">{getMsg('optionMailDescription')}</div>
    <div slot="controls">
        <div class="space-y-2">
            <Labeled disabled={!refreshToken} title={!refreshToken ? getMsg('optionMailNoAuthTooltip') : ''}>
                <input
                    slot="input"
                    type="checkbox"
                    bind:checked={$storageData.options.messages}
                    disabled={!refreshToken}
                    on:change={() => {
                        if (!messages) $storageData.options.messagesNotify = false;
                        void storage.saveOptions({
                            messages: $storageData.options.messages,
                            messagesNotify: $storageData.options.messagesNotify,
                        });
                    }}
                />
                <span slot="description">{getMsg('optionMailShow')}</span>
            </Labeled>
            <Labeled disabled={!messages} indent>
                <input
                    slot="input"
                    type="checkbox"
                    bind:checked={$storageData.options.messagesNotify}
                    disabled={!refreshToken || !$storageData.options.messages}
                    on:change={() => storage.saveOptions({ messagesNotify: $storageData.options.messagesNotify })}
                />
                <span slot="description">
                    <div class="flex items-center">
                        <span class={`h-4 w-4 mr-2 ${messagesNotify ? 'text-skin-accent' : 'text-skin-base'}`}>
                            {@html BellIcon}
                        </span>
                        {getMsg('optionMailNotify')}
                    </div>
                </span>
            </Labeled>
        </div>
    </div>
</OptionsItem>
