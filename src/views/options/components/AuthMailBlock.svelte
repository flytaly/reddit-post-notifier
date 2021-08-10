<script lang="ts">
    import auth from '../../../reddit-api/auth';
    import OptionsItem from './OptionsItem.svelte';
    import Labeled from './Labeled.svelte';
    import BellIcon from '../../../assets/bell.svg';

    import storage from '../../../storage';
    import getMsg from '../../../utils/get-message';

    export let messages: boolean;
    export let messagesNotify: boolean;

    let authDataPromise = storage.getAuthData();
    void authDataPromise.then(({ refreshToken }) => {
        if (!refreshToken) {
            messages = false;
            messagesNotify = false;
        }
    });
    let authError = '';
    let isAuthorizing = false;

    const authorize = async () => {
        isAuthorizing = true;
        try {
            await auth.login();
            authDataPromise = storage.getAuthData();
            messages = true;
            messagesNotify = true;
            await storage.saveOptions({ messages, messagesNotify });
        } catch (e) {
            console.error(e);
            authError = e.message;
        }
        isAuthorizing = false;
    };
    const signOut = async () => {
        isAuthorizing = true;
        await storage.clearAuthData();
        authDataPromise = storage.getAuthData();
        isAuthorizing = false;
        messages = false;
        messagesNotify = false;
        await storage.saveOptions({ messages, messagesNotify });
    };

    const getBtnMessage = (authorized: boolean, loading: boolean) => {
        if (loading) return getMsg('optionStartAuthBtnDisabled');
        return getMsg(authorized ? 'optionSignOutBtn' : 'optionStartAuthBtn');
    };
</script>

{#await authDataPromise then { refreshToken }}
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
                        bind:checked={messages}
                        disabled={!refreshToken}
                        on:change={() => {
                            if (!messages) messagesNotify = false;
                            void storage.saveOptions({ messages, messagesNotify });
                        }}
                    />
                    <span slot="description">{getMsg('optionMailShow')}</span>
                </Labeled>
                <Labeled disabled={!messages} indent>
                    <input
                        slot="input"
                        type="checkbox"
                        bind:checked={messagesNotify}
                        disabled={!refreshToken || !messages}
                        on:change={() => storage.saveOptions({ messagesNotify })}
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
{:catch error}
    <div class="text-skin-error">{error}</div>
{/await}
