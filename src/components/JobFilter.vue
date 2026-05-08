<script setup>
defineProps({
    searchKeyword:{
        type: String
       ,default: ''
    },
    showFavoritesOnly:{
        type: Boolean
        ,default: false
    },
    showIgnoredJobs:{
        type:Boolean,
        default:false
    },
    sortField: {
        type: String
        ,default: 'default'
    },
    sortDirection: {
        type: String
        ,default: 'asc'
    }
})

defineEmits([
    'update:searchKeyword',
    'update:showFavoritesOnly',
    'update:showIgnoredJobs',
    'update:sortField',
    'update:sortDirection'
])


</script>
<template>
<div class="jobFilter">
    <input type="text" 
    class="searchInput" 
    placeholder="회사명 또는 공고명" 
    :value="searchKeyword"
    @input="$emit('update:searchKeyword', $event.target.value)"/>

    <label class="favoriteOnly">
        <input type="checkbox"
        :checked="showFavoritesOnly"
        @change="$emit('update:showFavoritesOnly', $event.target.checked)"/>
        관심등록만 보기
    </label>
    <label class="favoriteOnly">
        <input type="checkbox"
        :checked="showIgnoredJobs"
        @change="$emit('update:showIgnoredJobs', $event.target.checked)"/>
        무시한 공고만 보기
    </label>
    <div class="sortGroup">
    <select class="sortSelect"
        :value="sortField"
        @change="$emit('update:sortField',$event.target.value)">
        <option value="latest">기본순</option>
        <option value="company">회사명</option>
        <option value="title">공고명순</option>
        <option value="deadline">마감일</option>
    </select> 
    <select name="" id="" class="directionSelect"
        :value="sortDirection"
        @change="$emit('update:sortDirection', $event.target.value)">
    <option value="asc">오름차순</option>
    <option value="desc">내림차순</option>
    </select>
    </div>
</div>
</template>

<style scoped>
.jobFilter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  margin-bottom: 12px;
}

.searchInput,
.sortSelect {
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  font-size: 15px;
}

.favoriteOnly {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}
.sortGroup{
    display: flex;
    gap: 8px;
}
.sortSelect{
    flex: 1;
    padding: 8px;
    box-sizing: border-box;
}
.directionSelect{
    max-width: 140px;
}
</style>

