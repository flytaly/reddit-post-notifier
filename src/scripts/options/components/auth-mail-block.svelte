<script>
    import storage from '../../storage';
    import { getMsg } from '../../utils';
    import OptionItem from './option-item.svelte';
    import auth from '../../background/auth';

    export let messages;
    export let messagesNotify;

    let authDataPromise = storage.getAuthData();
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
    label {
        display: flex;
        justify-content: flex-start;
        align-content: center;
    }
    label > span {
        margin: auto 0.5rem;
    }
    .indent {
        margin-left: 2rem;
    }
    .disabled {
        cursor: not-allowed;
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
            <label class:disabled={!refreshToken} title={!refreshToken ? getMsg('optionMailNoAuthTooltip') : ''}>
                <input
                    type="checkbox"
                    bind:checked={messages}
                    disabled={!refreshToken}
                    on:change={() => {
                        if (!messages) messagesNotify = false;
                        storage.saveOptions({ messages, messagesNotify });
                    }} />
                <span>{getMsg('optionMailShow')}</span></label>
            <label class="indent" class:disabled={!messages}>
                <input
                    type="checkbox"
                    bind:checked={messagesNotify}
                    disabled={!refreshToken || !messages}
                    on:change={() => storage.saveOptions({ messagesNotify })} />
                <span>{getMsg('optionMailNotify')}</span></label>
        </div>
    </OptionItem>
{:catch error}
    <div class="erorr">{error}</div>
{/await}
