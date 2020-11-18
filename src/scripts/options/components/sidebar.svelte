<script>
    import { routes } from '../route';
    import Logo from '../../assets/logo.svg';

    export let activePage = '';
</script>

<style>
    aside {
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
        height: 100%;
        min-width: 8rem;
        box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
    }
    :global(body.dark-mode) aside {
        box-shadow: 0px 0px 2px 0px rgba(255, 255, 255, 0.5);
    }
    .logo {
        align-self: center;
        transform: translate(2px, 0px);
    }
    .logo :global(svg) {
        width: 4.5rem;
    }
    .logo :global(svg .eye) {
        fill: var(--accent-color);
    }
    .header {
        align-self: center;
        text-align: center;
        margin: 0.3rem 0 1.5rem;
        font-size: 1.1rem;
        font-weight: bold;
    }
    nav {
        display: flex;
        flex-direction: column;
    }
    a {
        color: var(--font-color);
        margin-top: 0.5rem;
        text-decoration: none;
        size: 1rem;
    }
    a.active {
        font-weight: bold;
        color: var(--accent-color);
    }
    a.page-link {
        font-size: 1.1rem;
    }
    a:hover {
        /* text-decoration: underline; */
        color: var(--accent-color);
    }
    a.section-link {
        margin-left: 1rem;
    }
</style>

<aside>
    <div class="logo">
        {@html Logo}
    </div>
    <div class="header">Reddit Post<br />Notifier</div>
    <nav>
        {#each Object.values(routes) as route}
            <a class="page-link" class:active={activePage === route.id} href={`#${route.id}`}>{route.name}</a>
            {#if route.sections}
                {#each Object.values(route.sections) as subroute}
                    <a class="section-link" href={`#${subroute.id}`}>{subroute.name}</a>
                {/each}
            {/if}
        {/each}
    </nav>
</aside>
