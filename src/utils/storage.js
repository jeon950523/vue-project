const STORAGE_KEY = 'saramin-saved-jobs'

export const SITE_KEYS = ['saramin', 'incruit', 'jobkorea']

export const SITE_LABELS = {
  saramin: '사람인'
  ,incruit: '인크루트'
  ,jobkorea: '잡코리아'
}

const SOURCE_TO_SITE = {
  사람인:'saramin'
  ,인크루트:'incruit'
  ,잡코리아:'jobkorea'
}

function createEmptyStore(){
  return{
    saramin:[]
    ,incruit:[]
    ,jobkorea:[]
  }
}

export function getSiteKey(job){
  if(job.site) return job.site
  
  if(job.source && SOURCE_TO_SITE[job.source]){
    return SOURCE_TO_SITE[job.source]
    } 
  return 'saramin'
}

function normalizeJob(siteKey,job){
  return {
    ...job
    ,site:siteKey
    ,source:job.source || SITE_LABELS[siteKey]
    ,favorite:job.favorite ?? false
  }
}

function normalizeStore(rawData){
  const store = createEmptyStore()
  if(rawData && typeof rawData === 'object'){
    SITE_KEYS.forEach((siteKey)=>{
      const jobs = Array.isArray(rawData[siteKey])?rawData[siteKey]:[]
      store[siteKey] = jobs.map((job)=>normalizeJob(siteKey,job))
    })
    return store
  }
  return store
}

function loadStore(){
  return new Promise((resolve)=>{
    chrome.storage.local.get([STORAGE_KEY],(data)=>{
      resolve(normalizeStore(data[STORAGE_KEY]))
    })
  })
}

function saveStore(store){
  return new Promise((resolve)=>{
    chrome.storage.local.set({[STORAGE_KEY]:store},()=>{
      resolve()
    })
  })
}

function flattenStore(store){
  return SITE_KEYS.flatMap((siteKey)=>store[siteKey]||[])
}

export async function loadSavedJobs(){
  const store = await loadStore()
  return flattenStore(store)
}

export async function clearSavedJobs() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(STORAGE_KEY, () => {
      resolve()
    })
  })
}

export async function saveMergedJobs(siteKey, newJobs){
  const store = await loadStore()
  const currentJobs = store[siteKey] || []
  const jobMap = new Map()

  currentJobs.forEach((job)=>{
    jobMap.set(job.id, job)
  })

  newJobs.forEach((job)=>{
    const normalizedJob = normalizeJob(siteKey, job)
    const oldjob = jobMap.get(normalizedJob.id)

    jobMap.set(
      normalizedJob.id
      ,oldjob?{
        ...oldjob
        ,...normalizedJob
        ,favorite: oldjob.favorite ?? false
      }
      :normalizedJob
    )
  })
  store[siteKey] = [...jobMap.values()]
  await saveStore(store)
  return flattenStore(store)
}

export async function saveJobs(jobsToSave){
  const store = createEmptyStore()

  jobsToSave.forEach((job)=>{
    const siteKey = getSiteKey(job)
    if(!store[siteKey]){
      store[siteKey] = []
    }
    store[siteKey].push(normalizeJob(siteKey,job))
  })
  await saveStore(store)
}


