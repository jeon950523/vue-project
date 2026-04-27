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
    srotOption: {
        type: String
        ,default: 'latest'
    }
})

defineEmits([
    'update:searchKeyword',
    'update:showFavoritesOnly',
    'update:sortOption'
])
</script>
<template>
<div class="jobFilter">
    <input type="text" 
    class="searchInput" 
    placeholder="회사명 또는 공고명" 
    :value="searchKeyword"
    @input="$emit('update:serachKeyword', $event.target.value)"/>

    <label class="favoriteOnly">
        <input type="checkbox"
        :checked="showFavoritesOnly"
        @change="$emit('update:showFavoritesOnly', $event.target.checked)"/>
        관심등록만 보기
    </label>
    <select class="sortSelect"
        :value="sortOption"
        @change="$emit('update:sortOption',$event.target.value)">
        <option value="latest">기본순</option>
        <option value="company">회사명</option>
        <option value="title">공고명순</option>
    </select> 
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
}

.favoriteOnly {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>