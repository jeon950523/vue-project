<script setup>
import { onMounted, ref, computed } from 'vue';
import ActionBar from './components/ActionBar.vue';
import JobList from './components/JobList.vue';
import JobFilter from './components/JobFilter.vue';
import { loadSavedJobs,
         clearSavedJobs,
         saveMergedJobs, 
         saveJobs,
         getSiteKey,
         SITE_LABELS} from './utils/storage';
import { collectJobsFromPage,getCurrentPageInfo } from './utils/chromeMessage'

const jobs = ref([]);
const status = ref('');
const searchKeyword = ref('')
const showFavoritesOnly = ref(false)
const sortField = ref('default')
const sortDirection = ref('asc')
const selectedSite = ref('all')
const showIgnoredJobs = ref(false)
const collectPage = ref(1)
const lastCollectedPage = ref(null)

const siteCounts = computed(()=>{
    const counts = {
        all: jobs.value.length,
        saramin:0,
        incruit:0,
        jobkorea:0    
    }
    jobs.value.forEach((job)=>{
        const siteKey = getSiteKey(job)
        if(!counts[siteKey]){
            counts[siteKey] = 0
        } 
        counts[siteKey] +=1
    }) 
    return counts
})


async function toggleFavorite(jobid){
    const target = jobs.value.find((job)=>job.id===jobid)
    if(!target) return
    target.favorite = !target.favorite
  await saveJobs(jobs.value)
}

async function toggleIgnored(jobId) {
    const target = jobs.value.find((job)=>job.id === jobId)
    if(!target) return
    target.ignored = !target.ignored
    await saveJobs(jobs.value)
}



async function handleSave() {
  const pageToCollect = Number(collectPage.value||1)

  status.value = pageToCollect + '페이지 수집중...'
try{
    const response = await collectJobsFromPage(pageToCollect)
    
    if(!response?.ok){
      status.value = response.message || '수집에 실패했습니다.'
      return
}
const siteKey = response.site || response.jobs?.[0]?.site || 'saramin'
const mergedJobs = await saveMergedJobs(siteKey,response.jobs)

jobs.value = mergedJobs
selectedSite.value = siteKey

lastCollectedPage.value = pageToCollect
collectPage.value = pageToCollect + 1

status.value = 
SITE_LABELS[siteKey] +
' ' + 
pageToCollect +
'페이지 저장 완료:' +
response.jobs.length+
'개/ 전체: '+
mergedJobs.length +
'개/ 다음 수집: '+
collectPage.value +
'페이지'

}catch(error){
    console.log(error)
    status.value = '수집 중 오류가 발생했습니다. popup 콘솔을 확인해주세요.'
    }
}

async function handleClear() {
  await clearSavedJobs()
  jobs.value = []
  status.value = '저장된 공고가 없습니다.'
}

function parseDeadlineValue(deadline){
    if(!deadline) return null
    const text = String(deadline).trim()

    if(
        text.includes('상시') ||
        text.includes('채용시') ||
        text.includes('수시') ||
        text ==='정보없음'
    ){
    return null
    }
    const now = new Date()
    const currentYear = now.getFullYear()
    const dDayMatch = text.match(/D-(\d+)/i)

    if(dDayMatch){
        const days = Number(dDayMatch[1])
        const date = new Date()
        date.setDate(date.getDate()+ days)
        return date.getTime()
    }
    if(text.includes('오늘')){
        return now.getTime()
    }
    const monthDayMatch = text.match(/(\d{1,2})[/.](\d{1,2})/)

    if(monthDayMatch){
        const month = Number(monthDayMatch[1])
        const day = Number(monthDayMatch[2])
        const date = new Date(currentYear, month - 1, day)

        return date.getTime()
    }
    return null
}

function compareDeadline(a, b, direction){
    const aValue = parseDeadlineValue(a.deadline)
    const bValue = parseDeadlineValue(b.deadline)

    if(aValue === null && bValue === null) return 0
    if(aValue === null) return 1
    if(bValue === null) return -1

    return direction ==='asc'
    ?aValue - bValue
    :bValue - aValue
}



const filteredJobs = computed(() => {
  let result = jobs.value.map((job, index)=>({
    ...job,
    displayNumber: index + 1
  }))

  if(selectedSite.value !== 'all'){
    result = result.filter((job)=>{
        return getSiteKey(job) === selectedSite.value
    })
  }
  if(showIgnoredJobs.value){
    result = result.filter((job)=>job.ignored)
  }else {
    result = result.filter((job)=>!job.ignored)
  }


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

  const direction = sortDirection.value

  if(sortField.value === 'default'){
    result.sort((a,b)=>{
        return direction === 'asc'
        ? a.displayNumber - b.displayNumber
        :b.displayNumber - a.displayNumber
    })
  }
  if(sortField.value ==='company'){
    result.sort((a,b)=>{
        const compared = (a.company||'').localeCompare(b.company||'')
        return direction ==='asc'?compared : -compared
    })
  }
  if(sortField.value === 'title'){
    result.sort((a,b)=>{
        const compared = (a.title||'').localeCompare(b.title||'')
        return direction ==='asc'? compared : -compared
    })
  }
  if(sortField.value === 'deadline'){
    result.sort((a,b)=>{
        return compareDeadline(a,b,direction)
    })
  }

  return result
})



onMounted(async()=>{
  const savedJobs = await loadSavedJobs()
  jobs.value = savedJobs
  
  const pageInfo = await getCurrentPageInfo()

  if(pageInfo.page){
    collectPage.value = pageInfo.page
  }

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
  :selectedSite="selectedSite" 
  :siteCounts="siteCounts"
  :collectPage="collectPage"
  :lastCollectedPage="lastCollectedPage"
  @save="handleSave"
  @clear="handleClear"
  @update:selectedSite="selectedSite = $event"
  @update:collectPage="collectPage = $event"
  />
  <p>{{ status }}</p>

  <JobFilter 
  :searchKeyword="searchKeyword"
  :showFavoritesOnly="showFavoritesOnly"
  :showIgnoredJobs="showIgnoredJobs"
  :sortField="sortField"
  :sortDirection="sortDirection"
  @update:searchKeyword="searchKeyword = $event"
  @update:showFavoritesOnly="showFavoritesOnly = $event"
  @update:showIgnoredJobs="showIgnoredJobs = $event"
  @update:sortField="sortField = $event"
  @update:sortDirection="sortDirection = $event"
  />
 
  <JobList :jobs="filteredJobs"
  @toggle-favorite="toggleFavorite"
  @toggle-ignored="toggleIgnored"/>

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
