<script setup>

defineProps({
    selectedSite:{
        type: String,
        default: 'all'
    },
    siteCounts:{
        type:Object,
        default: ()=>({})
    },
    collectPage:{
        type:Number,
        default: 1
    },
    lastCollectedPage:{
        type:Number,
        default: null
    }
})
const emit = defineEmits(['save','clear','update:selectedSite','update:collectPage'])

const siteButtons = [
    {label:'전체',value:'all'},
    {label:'사람인',value:'saramin'},
    {label:'인크루트',value:'incruit'},
    {label:'잡코리아',value:'jobkorea'}
]

function updateCollectPage(event){
    const page = Number(event.target.value)

    if(!Number.isFinite(page)) return
    if(page<1)return

    emit('update:collectPage',page)
}

</script>

<template>
<div class="actionBar">
    <div class="mainButtons">
        <button type="button" @click="$emit('save')">수집</button>
        <button type="button" @click="$emit('clear')">전체 삭제</button>
    </div>

    <div class="pageControl">
        <label for="collectPage">다음 수집 페이지</label>
        <input type="number" id="collectPage" min="1" 
        :value="collectPage" @input="updateCollectPage"/>

        <span v-if="lastCollectedPage">
            마지막 수집:{{ lastCollectedPage }}페이지
        </span>
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
.pageControl{
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
}
.pageControl input{
    width: 70px;
    padding: 4px 6px;
    box-sizing: border-box;
}
.pageControl span{
    color: #555;
}
</style>