<script>
    import storage from '../../storage';
    import { getMsg } from '../../utils';
    import OptionItem from './option-item.svelte';
    import LabelContainer from './label-container.svelte';
    import auth from '../../background/auth';
    import NotificationLabel from './notification-label.svelte';

    export let messages;
    export let messagesNotify;

    let authDataPromise = storage.getAuthData();
    authDataPromise.then(({ refreshToken }) => {
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
        } catch (e) {
            console.error(e);
            authError = e.message;
        }
        authDataPromise = storage.getAuthData();
        isAuthorizing = false;
        messages = true;
        messagesNotify = true;
        storage.saveOptions({ messages, messagesNotify });
    };
    const signOut = async () => {
        isAuthorizing = true;
        await storage.clearAuthData();
        authDataPromise = storage.getAuthData();
        isAuthorizing = false;
        messages = false;
        messagesNotify = false;
        storage.saveOptions({ messages, messagesNotify });
    };

    const getBtnMessage = (authorized, loading) => {
        if (loading) return getMsg('optionStartAuthBtnDisabled');
        return getMsg(authorized ? 'optionSignOutBtn' : 'optionStartAuthBtn');
    };
</script>

<style>
    .auth {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        min-width: 15rem;
    }
    .auth-status {
        color: var(--accent-color);
    }
    .auth-status.is-auth {
        color: var(--success-color);
    }
    .auth button {
        margin-top: 0.4rem;
        width: max-content;
    }
    .sign-out {
        border-color: var(--accent-color);
        color: var(--accent-color);
    }
</style>

{#await authDataPromise then { refreshToken }}
    <OptionItem title={getMsg('optionAuthorization')}>
        <div slot="description">{getMsg('optionAuthorizationDescription')}</div>
        <div slot="controls">
            <div class="auth">
                <div class="auth-status" class:is-auth={refreshToken}>
                    {getMsg(refreshToken ? 'optionIsAuthMsg' : 'optionNoAuthMsg')}
                </div>
                <button
                    class:sign-out={refreshToken}
                    on:click={refreshToken ? signOut : authorize}
                    disabled={isAuthorizing}>
                    {getBtnMessage(refreshToken, isAuthorizing)}</button>
                <div class="error">{authError}</div>
            </div>
        </div>
    </OptionItem>
    <OptionItem title={getMsg('optionMail')} column>
        <div slot="description">{getMsg('optionMailDescription')}</div>
        <div slot="controls">
            <LabelContainer disabled={!refreshToken} title={!refreshToken ? getMsg('optionMailNoAuthTooltip') : ''}>
                <input
                    slot="input"
                    type="checkbox"
                    bind:checked={messages}
                    disabled={!refreshToken}
                    on:change={() => {
                        if (!messages) messagesNotify = false;
                        storage.saveOptions({ messages, messagesNotify });
                    }} />
                <span slot="description">{getMsg('optionMailShow')}</span>
            </LabelContainer>
            <LabelContainer disabled={!messages} indent>
                <input
                    slot="input"
                    type="checkbox"
                    bind:checked={messagesNotify}
                    disabled={!refreshToken || !messages}
                    on:change={() => storage.saveOptions({ messagesNotify })} />
                <span slot="description">
                    <NotificationLabel checked={messagesNotify} text={getMsg('optionMailNotify')} />
                </span>
            </LabelContainer>
        </div>
    </OptionItem>
{:catch error}
    <div class="erorr">{error}</div>
{/await}
