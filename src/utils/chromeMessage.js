export function getCurrentTab(){
  return new Promise((resolve)=>{chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
    resolve(tabs[0])
  })
})
}


export function collectJobsFromPage(){
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