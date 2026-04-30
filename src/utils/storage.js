const STORAGE_KEY = 'saramin-saved-jobs'

export function loadSavedJobs(){
  return new Promise((resolve)=>{
   chrome.storage.local.get([STORAGE_KEY], function(data){
    resolve(data[STORAGE_KEY]||[])
    })
  })
}

export function clearSavedJobs(){
  return new Promise((resolve)=>{
    chrome.storage.local.remove(STORAGE_KEY, function(){
      resolve()
    })
  })
}

export function saveMergedJobs(newJobs){
  return new Promise((resolve)=>{
    chrome.storage.local.get([STORAGE_KEY], function(data){
      const savedJobs = data[STORAGE_KEY]||[]
      const jobMap = new Map()

      savedJobs.forEach((job)=>jobMap.set(job.id, job))
      newJobs.forEach((job)=>jobMap.set(job.id, job))

      const mergedJobs = [...jobMap.values()]

      chrome.storage.local.set({[STORAGE_KEY]: mergedJobs}, function(){
        resolve(mergedJobs)
      })
    })
  })
}
export function saveJobs(jobsTosave){
  return new Promise((resolve)=>{
    chrome.storage.local.set({[STORAGE_KEY]: jobsTosave}, function(){
      resolve()
    })
  })
}
