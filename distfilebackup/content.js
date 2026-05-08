const SITE ={
  SARAMIN: 'saramin',
  INCRUIT: 'incruit',
  JOBKOREA: 'jobkorea'
};

function detectSite(){
  const hostname = window.location.hostname;

  if (hostname.includes('saramin.co.kr')){
    return SITE.SARAMIN;
  }

  if(hostname.includes('incruit.com')){
    return SITE.INCRUIT;
  }

  if(hostname.includes('jobkorea.co.kr')){
    return SITE.JOBKOREA;
  }
  return null;
}

function cleanText(text){
  return (text||'').replace(/\s+/g,' ').trim();
}

function getAbsoluteUrl(href){
  if(!href) return '';

  return new URL(href, window.location.origin).href;
}

function makeJobId(sourceKey, jobUrl, company, title){
  if(jobUrl) return `${sourceKey}_${jobUrl}`;

  return `${sourceKey}_${company}_${title}`
}

function createJob({
  sourceKey
  ,source
  ,company
  ,title
  ,career = '정보없음'
  ,required = '정보없음'
  ,location = '정보없음'
  ,employmentType = '정보없음'
  ,preferred = '정보없음'
  ,deadline = '정보없음'
  ,postedDate = '정보없음'
  ,url = ''
  

}){ return{
  id: makeJobId(sourceKey, url, company, title)
  ,site: sourceKey
  ,source
  ,company
  ,title
  ,career
  ,required
  ,location
  ,employmentType
  ,preferred
  ,deadline
  ,postedDate
  ,url
  ,favorite:false
  ,ignored:false
};
}



function isJobListPage() {
  return location.pathname.startsWith('/zf_user/jobs/list/');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getText(element) {
  if (!element) {
    return '정보없음';
  }
  return element.textContent.trim().replace(/\s+/g, ' ');
}

function getRecruitCards() {
  return [...document.querySelectorAll('#default_list_wrap .list_recruiting .list_body .list_item')];
}

function getJobUrl(card) {
  const titleLink = card.querySelector('.job_tit a.str_tit, .job_tit a[href*="/zf_user/jobs/"]');
  return titleLink ? titleLink.href : '';
}

function getCompanyElement(card) {
  const companylink = card.querySelector('.company_nm a, [class*="company"] a');
  if(companylink) return companylink;
  
  const spans = card.querySelectorAll('.company_nm span');
  
  for (const span of spans){
    let text=span.textContent.trim();
    
    if(!text) continue;

    const cleaned = isCompanyExtraText(text);
    if(cleaned) {
      return{
        textContent: cleaned
      }
    }
  }
  return null;
}

function getTitleElement(card) {
  return card.querySelector('.job_tit a.str_tit > span, .job_tit a.str_tit, .job_tit a[href*="/zf_user/jobs/"] > span, .job_tit a[href*="/zf_user/jobs/"]');
}

function getMetaTexts(card) {
  const metaSelectors = [
    '.recruit_info .work_place',
    '.recruit_info .career',
    '.recruit_info .education',

    '.job_meta .job_sector span',
    '.job_meta .job_sector a',
    '.job_badge span',
    '.job_badge a',
    '.support_info .support_detail span'
  ];

  const values = [];
  const seen = new Set();

  metaSelectors.forEach(selector => {
    card.querySelectorAll(selector).forEach(el => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      if (text && !seen.has(text)) {
        seen.add(text);
        values.push(text);
      }
    });
  });

  return values;
}

function isCompanyExtraText(text) {
  const extras = [
    '관심기업 등록',
    '대기업',
    '중견기업',
    '중소기업',
    '공기업',
    '외국계',
    '코스피',
    '코스닥',
    '상장',
    '비상장',
    '그룹사',
    '계열사',
  ];
  let cleaned = text;
  extras.forEach(word=>{
    cleaned = cleaned.replace(word,'')
  });

  return cleaned.replace(/\s+/g,' ').trim();
}
function getPreferredTexts(card) {
  const selectors = [
    '.job_meta .job_sector span',
    '.job_meta .job_sector a',
    '.job_badge span',
    '.job_badge a'
  ];

  const values = [];
  const seen = new Set();

  selectors.forEach(selector => {
    card.querySelectorAll(selector).forEach(el => {
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      if (text && !seen.has(text)) {
        seen.add(text);
        values.push(text);
      }
    });
  });

  return values;
}

function parseCareerAndEmployment(text) {
  if (!text || text === '정보없음') {
    return {
      career: '정보없음',
      employmentType: '정보없음'
    };
  }

  const parts = text
    .replace(/\s+/g, ' ')
    .trim()
    .split('·')
    .map(part => part.trim())
    .filter(Boolean);

  return {
    career: parts[0] || '정보없음',
    employmentType: parts.slice(1).join(' · ') || '정보없음'
  };
}

function getDateTexts(card) {
  return [...card.querySelectorAll('.support_info .support_detail span')]
    .map(el => el.textContent.trim().replace(/\s+/g, ' '))
    .filter(Boolean);
}

function parseDates(dateTexts) {
  let deadline = '정보없음';
  let postedDate = '정보없음';

  for (const text of dateTexts) {
    if (deadline === '정보없음' && (text.startsWith('D-') || text.includes('~'))) {
      deadline = text;
      continue;
    }

    if (postedDate === '정보없음' && (text.includes('등록') || text.includes('전'))) {
      postedDate = text;
      continue;
    }
  }

  return {
    deadline,
    postedDate
  };
}


function getJobData(card) {
  const companyElement = getCompanyElement(card);
  const titleElement = getTitleElement(card);
  
  const locationElement = card.querySelector('.recruit_info .work_place');
  const careerElement = card.querySelector('.recruit_info .career');
  const educationElement = card.querySelector('.recruit_info .education');
  const deadlineElement = card.querySelector('.support_info .support_detail .date');
  const postedDateElement = card.querySelector('.support_info .support_detail .deadlines');


  const company = getText(companyElement);
  const title = getText(titleElement);
  const location = getText(locationElement);
  const careerRaw = getText(careerElement);
  const required = getText(educationElement);
  const deadline = getText(deadlineElement);
  const postedDate = getText(postedDateElement);
  
  const parsedCareer = parseCareerAndEmployment(careerRaw);
 


  const preferredTexts = getPreferredTexts(card);
  const preferred = preferredTexts.join(', ') || '정보없음';
  
  const jobUrl = getJobUrl(card);
  const id = jobUrl || company + '_' + title;
  
  return {
    id,
    company,
    title,
    career: parsedCareer.career,
    required: required,
    location: location,
    employmentType: parsedCareer.employmentType,
    preferred: preferred,
    url: jobUrl,
    deadline: deadline,
    postedDate: postedDate,
  };
}

function normalizeSaraminJobs(jobs){
  return jobs.map((job)=>({
    ...job
    ,source: job.source || '사람인'
    ,favorite:job.favorite ?? false
  }));
}






async function autoScrollAndCollect(maxRounds = 8, delay = 1200) {
  let previousCount = 0;
  let stableRounds = 0;

  for (let i = 0; i < maxRounds; i += 1) {
    const cards = getRecruitCards();
    const currentCount = cards.length;

    if (currentCount === previousCount) {
      stableRounds += 1;
    } else {
      stableRounds = 0;
      previousCount = currentCount;
    }

    if (stableRounds >= 2) {
      break;
    }

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    const wrap = document.querySelector('#default_list_wrap');
    if (wrap) {
      wrap.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }

    await sleep(delay);
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
  return getRecruitCards();
}

function collectIncruitJobs(){
  const cards = document.querySelectorAll(
    'ul.c_row[jobno]'
  );

  const jobs=[];
  
  cards.forEach((card)=>{
    const companyElement = card.querySelector(
      '.cell_first .cl_top a.cpname'
    );

    const titleElement = card.querySelector(
      '.cell_mid .cl_top a[href*="jobpost.asp"], .cell_mid .cl_top a'
    );

    const company = cleanText(companyElement?.textContent);
    const title = cleanText(titleElement?.textContent);
    const url = getAbsoluteUrl(titleElement?.getAttribute('href'));

    if(!company || !title) return;

    const infoSpans = Array.from(
      card.querySelectorAll('.cell_mid .cl_md span')
    ).map((span) => cleanText(span.textContent));

    const location = infoSpans[0]||'정보없음';
    const career = infoSpans[1]||'정보없음';
    const required = infoSpans[2]||'정보없음';
    const employmentType = infoSpans[3]||'정보없음';

    const preferred =
      Array.from(card.querySelectorAll('.cell_mid .cl_btm span'))
      .map((span)=>cleanText(span.textContent))
      .filter(Boolean)
      .join(', ') || '정보없음';
    
    const dateSpans = Array.from(
      card.querySelectorAll('.cell_last .cl_btm span')
      ).map((span)=>cleanText(span.textContent));

    const deadline = dateSpans[0] || '정보없음';
    const postedDate = dateSpans [1] || '정보없음';
    
    jobs.push(
      createJob({
        sourceKey: SITE.INCRUIT
        ,source: '인크루트'
        ,company
        ,title
        ,career
        ,required
        ,location
        ,employmentType
        ,preferred
        ,deadline
        ,postedDate
        ,url
      })
    );
  });
  return jobs;
}

function collectJobKoreaJobs(){
  const cards=document.querySelectorAll('tr[class*="dev"][data-gno], tr[class*="dev"], [data-gno]')
  const jobs = []

  cards.forEach((card)=>{
    const companyElement = card.querySelector(
      '.tplCo a[href*="/Recruit/Co_Read"], .tplCo a'
    )
    const titleElement = card.querySelector(
      '.tplTit .titBx strong a[href*="/Recruit/GI_Read"], .tplTit .titBx a[href*="/Recruit/GI_Read"], .tplTit a[href*="/Recruit/GI_Read"], a[href*="/Recruit/GI_Read"]'
    )
    const company = cleanText(companyElement?.textContent)
    const title = cleanText(titleElement?.textContent)
    const url = getAbsoluteUrl(titleElement?.getAttribute('href'))

    if (!company || !title) return

    const infoSpans = Array.from(
      card.querySelectorAll('.tplTit p.etc span.cell, p.etc span.cell')
    ).map((span)=> cleanText(span.textContent))

    const career = infoSpans[0] || '정보없음'
    const required = infoSpans[1] || '정보없음'
    const location = infoSpans[2] || '정보없음'
    const employmentType = infoSpans[3] || '정보없음'
    const salary = infoSpans[4] || ''

    const keywordText = cleanText(
      card.querySelector('.tplTit p.dsc, p.dsc')?.textContent
    )
    const preferred = [salary, keywordText]
    .filter(Boolean)
    .join(' / ') || '정보없음'

    const postedDate = 
      cleanText(card.querySelector('.odd .time, .tplPrv .time, .time')?.textContent)||'정보없음'
    const deadline = cleanText(card.querySelector('.odd .date, .tplPrv .date, .date')?.textContent)||'정보없음'
    
    jobs.push(
      createJob({
        sourceKey:SITE.JOBKOREA
        ,source:'잡코리아'
        ,company
        ,title
        ,career
        ,required
        ,location
        ,employmentType
        ,preferred
        ,deadline
        ,postedDate
        ,url
      })
    )
  })
  return jobs
}




chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== 'COLLECT_JOBS') return;
  
  const site = detectSite();

  if(site === SITE.SARAMIN){
  
    if (!isJobListPage()) {
      sendResponse({
        ok: false,
        message: '사람인 채용 목록 페이지에서만 사용할 수 있습니다.'
      });
      return;
    }
    autoScrollAndCollect().then(cards => {
      if (cards.length === 0) {
        sendResponse({
          ok: false,
          message: '현재 페이지에서 공고를 찾지 못했습니다.'
        });
        return;
      }
      const jobs = cards
        .map(card => getJobData(card))
        .filter(job => job.title !== '정보없음');
    
      if (jobs.length === 0) {
        sendResponse({
          ok: false,
          message: '공고 데이터를 읽지 못했습니다.'
        });
        return;
      }
    
      sendResponse({
        ok: true
        ,site
        ,jobs: normalizeSaraminJobs(jobs)
      });
    }).catch(error => {
      console.error(error);
      sendResponse({
        ok: false,
        message: '공고 수집 중 오류가 발생했습니다.'
      });
    });
    return true;
  }
  if(site===SITE.INCRUIT){
    try{
      const jobs = collectIncruitJobs();

      if(jobs.length === 0){
        sendResponse({
          ok: false,
          message: '현재 인크루트 페이지에서 공고를 찾지 못했습니다.'
        });
        return;
      }
      sendResponse({
        ok:true
        ,site
        ,jobs
      });
    } catch(error){
      console.error(error);
      sendResponse({
        ok: false,
        message: '인크루트 공고 수집 중 오류가 발생했습니다.'
      });
    }
    return;
  }
  if(site===SITE.JOBKOREA){
    try{ 
      const jobs = collectJobKoreaJobs();
      if(jobs.length === 0){
        sendResponse({
          ok:false,
          message: '현재 잡코리아 페이지에서 공고를 찾지 못했습니다.'
        });
      return;
      }
      sendResponse({
        ok:true,
        site,
        jobs
      });
    }
    catch(error){
      console.log('[잡코리아 수집 오류]', error);
      
      sendResponse({
        ok:false,
        message: '지원하지 않는 사이트 입니다.'
    });
  }
  return;
  }
})