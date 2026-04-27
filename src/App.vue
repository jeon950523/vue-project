<script setup>
import { onMounted, ref, computed } from 'vue';
import ActionBar from './components/ActionBar.vue';
import JobList from './components/JobList.vue';
import JobFilter from './components/JobFilter.vue';

const STORAGE_KEY = "saramin-saved-jobs";
const jobs = ref([]);
const status = ref('');
const searchKeyword = ref('')
const showFavoritesOnly = ref(false)
const sortOption = ref('latest')

function loadSavedJobs() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], function (data) {
      resolve(data[STORAGE_KEY] || []);
    });
  });
}

function clearSavedJobs() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(STORAGE_KEY, function () {
      resolve();
    });
  });
}

function saveMergedJobs(newJobs){
  return new Promise((resolve)=>{
    chrome.storage.local.get([STORAGE_KEY], function(data){
      const savedJobs = data[STORAGE_KEY]||[];
      const jobMap = new Map();

      savedJobs.forEach(job => jobMap.set(job.id, job))
      newJobs.forEach((job) => jobMap.set(job.id, job))

      const mergedJobs = [...jobMap.values()]

      chrome.storage.local.set({[STORAGE_KEY]: mergedJobs}, function(){resolve(mergedJobs)})
    });
  });
};

function getCurrentTab(){
  return new Promise((resolve)=>{chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
    resolve(tabs[0])
  })
})
}

function collectJobsFromPage(){
  return new Promise(async(resolve)=>{
    const currentTab = await getCurrentTab()
    
    chrome.tabs.sendMessage(
      currentTab.id,
      {action: 'COLLECT_JOBS'},
      function (response){
        if(chrome.runtime.lastError){
          resolve({
            ok: false,
            message: '사람인 페이지에서만 실행 가능합니다.'
          })
          return
        }
        resolve(response)
      }
    )
  })
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
 
  <JobList :jobs="filteredJobs"/>

</div>

</template>

<style scoped>
.popupwrap{
  padding: 16px;
}

.popuptitle{
  margin-bottom: 16px;
}
</style>
