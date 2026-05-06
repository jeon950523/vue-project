<script setup>

defineProps({
    selectedSite:{
        type: String,
        default: 'all'
    },
    siteCounts:{
        type:Object,
        default: ()=>({})
    }
})
defineEmits(['save','clear','update:selectedSite'])

const siteButtons = [
    {label:'전체',value:'all'},
    {label:'사람인',value:'saramin'},
    {label:'인크루트',value:'incruit'},
    {label:'잡코리아',value:'jobkorea'}
]

</script>

<template>
<div class="actionBar">
    <div class="mainButtons">
        <button type="button" @click="$emit('save')">수집</button>
        <button type="button" @click="$emit('clear')">전체 삭제</button>
    </div>


    <div class="siteButtons">
        <button
            v-for="site in siteButtons"
            :key="site.value"
            type="button"
            class="siteButton"
            :class="{active:selectedSite===site.value}"
            @click="$emit('update:selectedSite',site.value)"
        >
        {{ site.label }}
        <span>{{ siteCounts[site.value]||0 }}</span>
        </button>
    </div>
</div>
</template>

<style scoped>
.actionBar{
    display: flex;
    gap: 8px;
    flex-direction: column;
}
.mainButtons{
    display: flex;
    gap: 8px;
}
.siteButtons{
    display: flex;
    flex-wrap: wrap;
    gap:6px
}
.siteButton{
    padding: 6px 8px;
    border: 1px solid #ccc;
    background: #fff;
    border-radius: 6px;
    cursor: pointer;
}
.siteButton.active{
    border-color: #222;
    font-weight: 700;
    background: #f2f2f2;
}
.siteButton span {
    margin-left: 4px;
    font-size: 12px;
}

</style>