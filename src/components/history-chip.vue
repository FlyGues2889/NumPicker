<template>
    <mdui-chip variant="outlined">
        <slot></slot>
    </mdui-chip>
</template>
<script>
export default {
    name: "history-chip"
}
</script>
<style scoped>
mdui-chip {
    margin-right: 0.2rem;

    box-shadow: none;
    background-color: unset;

    color: rgb(var(--mdui-color-secondary));
    font-family: 'Nunito';
    font-weight: bold;
}

mdui-chip[selected] {
    background-color: rgba(var(--mdui-color-secondary-container));
}
</style>