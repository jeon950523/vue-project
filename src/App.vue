<script setup>
import { onMounted, ref, computed } from 'vue';
import ActionBar from './components/ActionBar.vue';
import JobList from './components/JobList.vue';
import JobFilter from './components/JobFilter.vue';
import { loadSavedJobs, clearSavedJobs, saveMergedJobs, saveJobs } from './utils/storage';
import { collectJobsFromPage } from './utils/chromeMessage'


const jobs = ref([]);
const status = ref('');
const searchKeyword = ref('')
const showFavoritesOnly = ref(false)
const sortOption = ref('latest')


async function toggleFavorite(jobid){
    const target = jobs.value.find((job)=>job.id===jobid)
    if(!target) return
    target.favorite = !target.favorite
  await saveJobs(jobs.value)
}



async function handleSave() {
  const response = await collectJobsFromPage()

  if(!response.ok){
    status.value = response.message
    jobs.value = []
    return
  }

  const mergedJobs = await saveMergedJobs(response.jobs)
  jobs.value = mergedJobs
  status.value = 
  '저장 완료:' + response.jobs.length + '개 / 전체:' + mergedJobs.length + '개'
}

async function handleClear() {
  await clearSavedJobs()
  jobs.value = []
  status.value = '저장된 공고가 없습니다.'
}

const filteredJobs = computed(() => {
  let result = [...jobs.value]

  const keyword = searchKeyword.value.trim().toLowerCase()

  if (keyword) {
    result = result.filter((job) => {
      return (
        job.title?.toLowerCase().includes(keyword) ||
        job.company?.toLowerCase().includes(keyword) ||
        job.location?.toLowerCase().includes(keyword) ||
        job.career?.toLowerCase().includes(keyword) ||
        job.employmentType?.toLowerCase().includes(keyword) ||
        job.preferred?.toLowerCase().includes(keyword)
      )
    })
  }

  if (showFavoritesOnly.value) {
    result = result.filter((job) => job.favorite)
  }

  if (sortOption.value === 'company') {
    result.sort((a, b) => {
      return (a.company || '').localeCompare(b.company || '')
    })
  }

  if (sortOption.value === 'title') {
    result.sort((a, b) => {
      return (a.title || '').localeCompare(b.title || '')
    })
  }

  return result
})



onMounted(async()=>{
  const savedJobs = await loadSavedJobs()
  jobs.value = savedJobs

  if (savedJobs.length === 0){
    status.value = '저장된 공고가 없습니다'
  } else{
    status.value = '저장된 공고 수:' + savedJobs.length + '개'
  }
})


</script>

<template>
<div class="popupwrap">
  <h1 class="popuptitle">공고 수집</h1>
  <ActionBar 
  @save="handleSave"
  @clear="handleClear"
  />
  <p>{{ status }}</p>
  
  <JobFilter 
  :searchKeyword="searchKeyword"
  :showFavoritesOnly="showFavoritesOnly"
  :sortOption="sortOption"
  @update:searchKeyword="searchKeyword = $event"
  @update:showFavoritesOnly="showFavoritesOnly = $event"
  @update:sortOption="sortOption = $event"
  />
 
  <JobList :jobs="filteredJobs"
  @toggle-favorite="toggleFavorite"/>

</div>

</template>

<style scoped>
.popupwrap{
  padding: 16px;
  width: 550px;
  min-width: 550px;
  height: 600px;
  box-sizing: border-box;
  overflow-y: auto;
}

.popuptitle{
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 800;
  white-space: nowrap;
  
}
.popupwrap > p {
    margin: 12px 0;
    font-size: 15px;
}
</style>
