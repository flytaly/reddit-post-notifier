<table class="border-collapse text-base">
    <thead>
        <tr>
            <th align="center">Key</th>
            <th>Function</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td align="center">
                <span class="kbd">Alt</span>+<span class="kbd">Shift</span>+<span class="kbd">S</span>
            </td>
            <td>Open the extension's popup</td>
        </tr>
        <tr>
            <td align="center"><span class="kbd">↓</span>, <span class="kbd">j</span></td>
            <td>Select the next item</td>
        </tr>
        <tr>
            <td align="center"><span class="kbd">↑</span>, <span class="kbd">k</span></td>
            <td>Select the previous item</td>
        </tr>
        <tr>
            <td align="center">
                <span class="kbd">→</span>,
                <span class="kbd">l</span>,
                <span class="kbd">Enter</span>
            </td>
            <td>Expand selected posts group; open selected post in the new tab</td>
        </tr>
        <tr>
            <td align="center">
                <span class="kbd">←</span>,
                <span class="kbd">h</span>,
                <span class="kbd">Backspace</span>
            </td>
            <td>Collapse selected posts group</td>
        </tr>
        <tr>
            <td align="center"><span class="kbd">Space</span></td>
            <td>Mark selected item as read (remove it)</td>
        </tr>

        <tr>
            <td align="center"><span class="kbd">p</span></td>
            <td>Pin selected post; remove already pinned post</td>
        </tr>
    </tbody>
</table>

<style lang="postcss">
    /* Github markdown keys styles */
    .kbd {
        @apply inline-block px-[5px] py-[2px]
               text-xs font-mono leading-normal text-skin-base
               align-middle
               bg-skin-input
               border border-skin-base rounded-md;

        box-shadow: inset 0 -1px 0 var(--color-gray);
    }

    th,
    td {
        @apply border border-skin-delimiter py-1 px-2;
    }
</style>
