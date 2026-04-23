<script setup>
defineEmits(['save','clear'])
</script>

<template>
<div class="buttonGroup">
    <button type="button" @click="$emit('save')">수집</button>
    <button type="button" @click="$emit('clear')">전체 삭제</button>
</div>
</template>

<style scoped>
.buttonGroupP{
    display: flex;
    gap: 8px;
}
</style>