<script lang='ts'>
    interface Props {
        id: string;
        name: string;
    }

    let { id, name }: Props = $props();
</script>

<h2 class='border-b border-dashed border-skin-delimiter text-base font-bold text-skin-text' {id}>
    {name}
</h2>
