<script setup>
defineProps({
    job: {
        type: Object,
        required: true
    }
})
defineEmits(['toggle-favorite'])
</script>

<template>
    <article class="jobcard">
     <h2 class="jobCardTitle">{{ job.title }}</h2>
    
     <p class="jobRow">
      <span class="jobLabel">회사명:</span>
      <span>{{ job.company }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">경력:</span>
      <span>{{ job.career }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">학력:</span>
      <span>{{ job.required }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">지역:</span>
      <span>{{ job.location }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">고용형태:</span>
      <span>{{ job.employmentType }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">우대/키워드:</span>
      <span>{{ job.preferred }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">마감일:</span>
      <span>{{ job.deadline }}</span>
    </p>
    
    <p class="jobRow">
      <span class="jobLabel">등록일:</span>
      <span>{{ job.postedDate }}</span>
    </p>
    
    <a 
    v-if="job.url"
    :href="job.url"
    class="joblink"
    target="_blank"
    rel="noopener noreferrer">
    공고 바로가기
        </a>
    <button type="button" class="favoriteBtn" @click="$emit('toggle-favorite', job.id)">
      {{ job.favorite ?'관심해제':'관심등록' }}
    </button>
    </article>
</template>

<style scoped>
.jobcard{
    border: 1px solid black;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
}   

.jobCardTitle{
    font-size: 1.3rem;
    margin-bottom: 10px;
}

.jobRow{
    margin: 6px;
}

.jobLabel{
    font-weight: 900;
    margin-right: 4px;
}

.joblink{
    display: inline-block;
    margin-top: 10px;
}
.favoriteBtn{
  display: block;
  margin-top: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
</style>