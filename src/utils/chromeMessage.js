export function getCurrentTab(){
  return new Promise((resolve)=>{chrome.tabs.query({active:true, currentWindow: true}, function(tabs){
    resolve(tabs[0])
  })
})
}

function sleep(ms){
  return new Promise((resolve)=>{
    setTimeout(resolve,ms)
  })
}

function detectSiteFromUrl(tabUrl){
  if(!tabUrl) return null

  const url = new URL(tabUrl)
  const hostname = url.hostname

  if(hostname.includes('saramin.co.kr')){
    return 'saramin'
  }
  if(hostname.includes('incruit.com')){
    return 'incruit'
  }
  if(hostname.includes('jobkorea.co.kr')){
    return 'jobkorea'
  }
  return null
}

function getPageFromUrl(tabUrl, site){
const url = new URL(tabUrl)

if(site === 'saramin'){
  return Number(url.searchParams.get('page')||1)
}
if(site === 'incruit'){
  return Number(url.searchParams.get('page')||1)
}
if(site === 'jobkorea'){
  const page = (url.searchParams.get('page')|| url.searchParams.get('page'))
  
  if(page){
    return Number(page)
  }
  const hashMatch = url.hash.match(/anchorGICnt_(\d+)/)

  if(hashMatch){
    return Number(hashMatch[1])
  }
  return 1
  }
return 1
}

function buildPageUrl(tabUrl, site, page){
  const url = new URL(tabUrl)

  if(site === 'saramin'){
    url.searchParams.set('page', String(page))
    url.searchParams.set('isAjaxRequest',0)
    return url.href
  }

  if(site === 'incruit'){
    url.searchParams.set('page', String(page))
    return url.href
  }
  if(site === 'jobkorea'){
    
      const pageUrl = new URL(tabUrl)

      pageUrl.pathname = '/recruit/joblist'
    
      pageUrl.searchParams.delete('page')
      pageUrl.searchParams.delete('Page')
      
      if(!pageUrl.searchParams.has('menucode')){
        pageUrl.searchParams.set('menucode','local')
      }
      
      if(!pageUrl.searchParams.has('localorder')){
        pageUrl.searchParams.set('localorder','1')
      }

      
   
      pageUrl.hash = `anchorGICnt_${page}`
    
    return pageUrl.href
  }
}

function waitForTabLoad(tabId, timeoutMs = 3000){
  return new Promise((resolve)=>{
    let finished = false

    const done = () => {
      if(finished) return
      
      finished = true
      chrome.tabs.onUpdated.removeListener(listener)
      resolve()
    }

    const listener = function(updatedTabId, changeInfo){
      if(updatedTabId !== tabId) return
      if(changeInfo.status !== 'complete') return

      done()
    }

      chrome.tabs.onUpdated.removeListener(listener)
      
      setTimeout(()=>{
        done()
      }, timeoutMs)  
    })
  }


function moveTabToUrl(tabId, url){
  return new Promise((resolve)=>{
    chrome.tabs.update(tabId,{url},function(){
      resolve()
    })
  })
}

function sendCollectMessage(tabId){
  return new Promise((resolve)=>{
    chrome.tabs.sendMessage(
      tabId,
      {action: 'COLLECT_JOBS'},
      function(response){
        if(chrome.runtime.lastError){
          resolve({ok:false,
            message: '지원 사이트 채용 목록 페이지에서만 실행 가능합니다.'
          })
          return
        }
        resolve(response)
      }
    )
  })
}

export async function getCurrentPageInfo() {
  const currentTab = await getCurrentTab()
  const site = detectSiteFromUrl(currentTab?.url)

  if(!currentTab||!site){
    return{
      site: null,
      page: 1
    }
  }
  return{
    site,
    page: getPageFromUrl(currentTab.url, site)
  }
}

export async function collectJobsFromPage(targetPage) {
  const currentTab = await getCurrentTab()
  const site = detectSiteFromUrl(currentTab?.url)

  if(!currentTab||!site){
    return{
      ok:false,
      message:'사람인/인크루트/잡코리아 채용 목록 페이지에서 실행해주세요'
    }
  }
  const currentPage = getPageFromUrl(currentTab.url,site)
  const page = Number(targetPage||getPageFromUrl(currentTab.url,site)||1)
  const targetUrl = buildPageUrl(currentTab.url,site,page)

  if(currentPage !== page){
    const loadPromise = waitForTabLoad(currentTab.id)

    await moveTabToUrl(currentTab.id, targetUrl)
    await loadPromise

    await sleep(1000)
  }
  return sendCollectMessage(currentTab.id)
}



