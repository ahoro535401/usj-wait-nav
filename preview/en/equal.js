/* English trial: feature parity with the Japanese pages. This file is bundled only with INCLUDE_EN=1. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const app = window.enApp;
  if (!app) return;
  const el = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = value;
    return node;
  };
  const get = async path => {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  };
  const today = () => window.__EN_PREVIEW_DATE__ || new Date(Date.now() + 32400000).toISOString().slice(0, 10);
  const shareTags = '#UniversalStudiosJapan #USJWaitTimes #OsakaTravel';
  const dateLabel = app.dateLabel;
  const page = window.__EN_PREVIEW_PAGE__ || location.pathname.replace(/\/$/, '').split('/')[2] || 'today';
  const allowed = new Set(['today', 'map', 'plan', 'vote', 'install', 'privacy']);
  if (!allowed.has(page)) return;
  document.body.dataset.page = page;
  const groups = {
    today: ['today', 'shows', 'weather', 'more'],
    map: ['map'],
    plan: ['history', 'shows', 'hours', 'more'],
    vote: [], install: [], privacy: [],
  };
  for (const id of ['today', 'map', 'history', 'shows', 'hours', 'weather', 'more']) {
    $(id).hidden = !groups[page].includes(id);
  }
  const sectionTitle = {
    today: 'Wait times at Universal Studios Japan', map: 'Find attractions on the map',
    plan: 'Plan your visit to USJ', vote: 'Vote for your No. 1 attraction',
    install: 'Add USJ Wait Times Guide to your home screen',
    privacy: 'About this site and privacy',
  };
  const isPublished = document.querySelector('meta[name="robots"]')?.content === 'index, follow';
  document.title = `${sectionTitle[page]} | USJ Wait Times Guide${isPublished ? '' : ' · English Preview'}`;
  if (isPublished) document.querySelector('.badge').textContent = 'Unofficial';
  document.querySelector('.hero h1').textContent = sectionTitle[page];
  document.querySelector('.hero p').textContent = {
    today: 'Live standby estimates, recent changes, shows and weather in one place.',
    map: 'Explore attraction waits and restaurant locations. GPS is optional.',
    plan: 'Past wait records and published hours, prices and closures for upcoming visits.',
    vote: 'Choose one favorite attraction and explore reader results.',
    install: 'Open the site quickly from your phone, with no app-store download.',
    privacy: 'How we display park information and handle site usage data.',
  }[page];
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.classList.toggle('active', link.dataset.nav === page);
    if (link.dataset.nav === page) link.setAttribute('aria-current', 'page');
  });
  $('japanese-link').href = ({map:'/map',plan:'/plan',vote:'/vote',install:'/install',privacy:'/privacy'})[page] || '/';
  const note = document.querySelector('.notice');
  note.innerHTML = isPublished ?
    '<strong>English edition · Japan Standard Time</strong>Current waits and past records use the same public data as the Japanese edition. Park details may change. Confirm operations with the <a href="https://www.usj.co.jp/web/en/us" target="_blank" rel="noopener noreferrer">official USJ site or app</a>.' :
    '<strong>English preview · Japan Standard Time</strong>This unpublished trial uses the same live APIs and saved records as the Japanese site. Park details may change. Confirm operations with the <a href="https://www.usj.co.jp/web/en/us" target="_blank" rel="noopener noreferrer">official USJ site or app</a>.';
  if (page === 'install' || page === 'privacy') note.hidden = true;
  const pollLink=$('more')?.querySelector('a[href="/vote"]');
  if (pollLink) {pollLink.href='/en/vote';pollLink.textContent='Vote for your favorite attraction';}
  const footerPrivacy=document.querySelector('.footer a[href="/privacy"]');
  if (footerPrivacy) {footerPrivacy.href='/en/privacy';footerPrivacy.textContent='Privacy policy';}

  const style = el('style');
  style.textContent = `
    .hero .theme-switch{position:relative;z-index:2;margin:10px 0 0;border:1px solid #b9d0ec;border-radius:8px;background:#193f68;color:#fff;padding:7px 12px;font-weight:700}
    .feature-panel{border:1px solid #d5e1ee;border-radius:10px;padding:12px;margin:12px 0;background:#f7faff}
    .feature-panel h3{margin:0 0 8px}.feature-panel p{margin:6px 0}.feature-grid{display:flex;gap:8px;flex-wrap:wrap}
    .feature-grid>*{flex:1 1 170px}.feature-grid label{display:grid;gap:3px}.feature-grid select{width:100%;border:1px solid #9fb5cb;border-radius:7px;padding:7px;background:#fff}
    .check-group{display:flex;gap:8px;flex-wrap:wrap}.check-group label{display:flex;align-items:center;gap:4px;padding:5px 8px;border:1px solid #bfd0e3;border-radius:7px}
    .top-five{margin:5px 0;padding-left:1.6em}.top-five li{margin:5px 0}.top-five .wait{margin-left:7px}.movement-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}.movement-grid p{background:#eaf3ff;padding:8px;border-radius:7px}
    .share-panel{margin-top:24px}.share-panel .share-links{margin-top:10px}.share-panel button{min-height:44px}.share-panel .share-status{min-height:1.5em}
    .page-links{display:flex;gap:13px;flex-wrap:wrap}.plan-meta{display:flex;gap:6px;flex-wrap:wrap}.plan-meta span{display:inline-block;padding:4px 7px;border-radius:6px;background:#e8f1fc}
    .month-grid button .cal-extra{color:#355f89;font-size:.65rem}.month-grid button .exclusion{color:#7144a2}.month-grid button .closure{color:#a34148}
    .archive-charts{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:9px}.archive-chart{padding:10px;border:1px solid #d4e0ed;border-radius:9px}.archive-chart strong{display:block;min-height:2.5em}.mini-bars{display:flex;align-items:end;gap:2px;height:78px;border-bottom:1px solid #9fb5cb}.mini-bars i{display:block;flex:1;background:#64a6de;min-width:2px;border-radius:3px 3px 0 0}.mini-bars i.missing{background:#ccd8e4;height:2px!important}
    .weather-periods{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:7px}.weather-periods div{border:1px solid #d5e0ec;border-radius:8px;padding:7px;background:#f8fbff}.weather-periods strong{display:block}
    .map-mode{display:flex;gap:6px;margin:10px 0}.map-mode button[aria-pressed="true"],.archive-mode button[aria-pressed="true"]{background:#1765ac;color:#fff}
    .map-frame{height:min(75vh,720px);min-height:420px;overflow:hidden;border:1px solid #cddbec;border-radius:12px;touch-action:none;position:relative;background:#ecf3ec}.map-stage{position:absolute;inset:0;transform-origin:0 0}.map-stage img{width:100%;height:100%;object-fit:fill;display:block}.illustration-pin{position:absolute;transform:translate(-50%,-100%);border:2px solid white;border-radius:8px;box-shadow:0 2px 7px #0009;padding:4px 6px;background:#43586e;color:white;font-size:.8rem;font-weight:750;white-space:nowrap}.illustration-pin.low{background:#087c60}.illustration-pin.mid,.illustration-pin.high{background:#a45d12}.illustration-pin.very-high{background:#a02a3b}.map-frame[data-zoom="overview"] .illustration-pin.not-overview{display:none}
    .poll-frame{width:100%;min-height:680px;border:0}.poll-bars{padding:0;list-style:none}.poll-bars li{padding:7px 0;border-bottom:1px solid #dce7f1}.poll-track{display:block;height:12px;background:#e6eff8;border-radius:6px;overflow:hidden}.poll-track i{display:block;height:100%;background:#2e81cb}
    .footer-link{margin-right:12px}.footer p{line-height:1.7}
    [data-theme="dark"]{color-scheme:dark;background:#0e1721;color:#e9f2fc}[data-theme="dark"] body{background:#0e1721}[data-theme="dark"] section{background:#172534;border-color:#344b61;color:#e9f2fc}[data-theme="dark"] .nav{background:#192b3d;border-color:#344b61}[data-theme="dark"] .nav a{color:#b9d9ff}[data-theme="dark"] .nav a.active{color:white}[data-theme="dark"] .muted,[data-theme="dark"] .small{color:#b4c8df}[data-theme="dark"] .feature-panel,[data-theme="dark"] .stat,[data-theme="dark"] .plan-day-info,[data-theme="dark"] .map-detail,[data-theme="dark"] .weather-periods div,[data-theme="dark"] .archive-chart{background:#203346;border-color:#3e536a;color:#e9f2fc}[data-theme="dark"] .ride,[data-theme="dark"] .day,[data-theme="dark"] .month-grid button,[data-theme="dark"] .table td:first-child,[data-theme="dark"] .table th:first-child{background:#1c2d40;color:#e9f2fc}[data-theme="dark"] .table th,[data-theme="dark"] .table td{border-color:#3c536c}[data-theme="dark"] .table thead th{background:#274464;color:#e9f2fc}[data-theme="dark"] .notice{background:#203b58;color:#e9f2fc}[data-theme="dark"] .notice a{color:#a7d4ff}[data-theme="dark"] a{color:#a7d4ff}[data-theme="dark"] .movement-grid p{background:#294766}[data-theme="dark"] .month-grid button:disabled{background:#1a2735;color:#8497a8}
    [data-theme="dark"] .ride{border-color:#3e536a}
    [data-theme="dark"] .ride summary:hover{background:#27405a}
    [data-theme="dark"] .ride .name small,[data-theme="dark"] .delta,[data-theme="dark"] .day small,[data-theme="dark"] .month-grid>span{color:#b9cce0}
    [data-theme="dark"] .ride-details,[data-theme="dark"] .poll-bars li{border-color:#3e536a}
    [data-theme="dark"] .delta-grid span,[data-theme="dark"] .plan-meta span{background:#29445e;color:#e9f2fc}
    [data-theme="dark"] .controls select,[data-theme="dark"] .controls input,[data-theme="dark"] .feature-grid select{background:#21384e;border-color:#6686a2;color:#f3f8ff}
    [data-theme="dark"] .segmented,[data-theme="dark"] .check-group label{border-color:#6686a2}
    [data-theme="dark"] .segmented button,[data-theme="dark"] .date-pills button,[data-theme="dark"] .map-mode button,[data-theme="dark"] .archive-mode button{background:#21384e;border-color:#6686a2;color:#c5e0ff}
    [data-theme="dark"] .segmented button[aria-pressed="true"],[data-theme="dark"] .date-pills button[aria-pressed="true"],[data-theme="dark"] .map-mode button[aria-pressed="true"],[data-theme="dark"] .archive-mode button[aria-pressed="true"]{background:#2f6fc0;color:#fff}
    [data-theme="dark"] .action,[data-theme="dark"] .quick-nav a{background:#21384e;border-color:#6686a2;color:#c5e0ff}
    [data-theme="dark"] .month-grid button{border-color:#3e536a}
    [data-theme="dark"] .month-grid button .cal-extra{color:#a9d2ff}
    [data-theme="dark"] .month-grid button .exclusion{color:#d0a8ff}
    [data-theme="dark"] .month-grid button .closure{color:#ffb1b6}
    [data-theme="dark"] .hour-track,[data-theme="dark"] .poll-track{background:#30465d}
    [data-theme="dark"] .map-controls{background:#172534;border-color:#3e536a;color:#e9f2fc}
    [data-theme="dark"] .share-links :is(a,button):not(.line):not(.x):not(.threads):not(.facebook){background:#21384e;border-color:#6686a2;color:#c5e0ff}
    [data-theme="dark"] #geo-map,[data-theme="dark"] .map-frame{filter:none;color-scheme:light}
    @media(max-width:620px){.month-grid button .cal-extra{font-size:.58rem}.map-controls{top:55px}.feature-grid>*{flex-basis:100%}}
  `;
  document.head.append(style);
  const themeButton = el('button', 'theme-switch', 'Display: Auto');
  themeButton.type = 'button';
  themeButton.setAttribute('aria-label', 'Change display brightness: auto, dark, light');
  document.querySelector('.hero-content').append(themeButton);
  const darkQuery = matchMedia('(prefers-color-scheme: dark)');
  let theme = 'auto';
  try { theme = localStorage.getItem('usj-wait-nav:theme') || 'auto'; } catch (_) { /* storage optional */ }
  if (!['auto', 'dark', 'light'].includes(theme)) theme = 'auto';
  function applyTheme() {
    document.documentElement.dataset.theme = theme === 'dark' || (theme === 'auto' && darkQuery.matches) ? 'dark' : 'light';
    themeButton.textContent = `Display: ${theme[0].toUpperCase() + theme.slice(1)}`;
  }
  themeButton.addEventListener('click', () => {
    theme = ({auto:'dark',dark:'light',light:'auto'})[theme];
    try { localStorage.setItem('usj-wait-nav:theme', theme); } catch (_) { /* storage optional */ }
    applyTheme();
  });
  darkQuery.addEventListener?.('change', () => { if (theme === 'auto') applyTheme(); });
  applyTheme();

  // Keep the same subjects as the Japanese share actions; Facebook uses the page's OG card.
  function sharePanel(kind, parent, pathOverride = null, payloadOverride = null) {
    const paths = {today:'/en/',map:'/en/map',plan:'/en/plan',vote:'/en/vote'};
    const messages = {
      today:{
        body:'USJ Wait Times Guide (unofficial)\nBefore your visit or while you are in the park:\n• Current standby waits and recent changes\n• A map of attractions and restaurants\n• A calendar of past crowd records',
        xIntro:'USJ Wait Times Guide: waits, recent changes, maps and past crowd records. Check before or during your visit ↓',
        threads:'Planning a trip to Universal Studios Japan? See current standby waits, recent changes, attractions and restaurants on the map, and past crowd records in one place. Unofficial guide.',
      },
      map:{
        body:'USJ Wait Times Guide · Map (unofficial)\nFind attractions and their standby waits on a map. Optional GPS and restaurant locations are available.',
        xIntro:'Find USJ attractions, standby waits, restaurants and optional GPS on one map ↓',
        threads:'Explore Universal Studios Japan on a map with attraction wait times, restaurant locations and optional GPS. Unofficial USJ Wait Times Guide.',
      },
      plan:{
        body:'USJ Wait Times Guide · Plan your visit (unofficial)\nCheck the calendar of past crowd records, park hours and event information before you go.',
        xIntro:'Planning a USJ visit? Check past crowd records, park hours and events ↓',
        threads:'Before visiting Universal Studios Japan, explore past wait times on a calendar, park hours and event information. Unofficial USJ Wait Times Guide.',
      },
      vote:{
        body:'What is your No. 1 USJ attraction? Vote in the USJ Wait Times Guide poll and see the reader results. Unofficial poll.',
        xIntro:'What is your No. 1 USJ attraction? Vote and see the reader results ↓',
        threads:'Which Universal Studios Japan attraction is your favorite? Pick one in the USJ Wait Times Guide poll and explore the reader results. Unofficial poll.',
      },
    };
    const box = el('aside','feature-panel share-panel');
    box.setAttribute('aria-label', 'Share this page');
    box.append(el('h3',null,kind === 'vote' ? 'Share this poll' : 'Share this page'));
    const message=payloadOverride || messages[kind];
    const summary=el('p','muted',message.body);summary.style.whiteSpace='pre-line';box.append(summary);
    const links = el('div','share-links');
    const base = `https://uniba-waittimes.com${pathOverride || paths[kind]}`;
    const channels = [
      ['Facebook','facebook'],['X','x'],['Threads','threads'],['Copy text','copy'],
    ];
    const status = el('p','small muted share-status');status.setAttribute('role','status');
    for (const [label,channel] of channels) {
      const button = el(channel === 'copy' ? 'button' : 'a',channel,label);
      const u = new URL(base);u.searchParams.set('utm_source',channel);u.searchParams.set('utm_medium','social');u.searchParams.set('utm_campaign',`share_en_${kind}`);
      const body = `${message.body}\n${u.href}`;
      if (channel !== 'copy') {
        button.href = channel === 'facebook' ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u.href)}` :
          channel === 'x' ? `https://x.com/intent/post?text=${encodeURIComponent(message.xIntro + '\n' + u.href + '\n' + shareTags)}` :
          `https://www.threads.com/intent/post?text=${encodeURIComponent(message.threads)}&url=${encodeURIComponent(u.href)}`;
        button.target = '_blank';button.rel = 'noopener noreferrer';
      } else {
        button.type = 'button';button.addEventListener('click', async () => {
          try { await navigator.clipboard.writeText(body);status.textContent = 'Text and link copied.'; }
          catch { status.textContent = 'Copy unavailable in this browser.'; }
        });
      }
      button.addEventListener('click', () => window.trackSiteEvent?.('share_click',{share_channel:channel,content_type:`en_${kind}`}));
      links.append(button);
    }
    box.append(links,status);parent.append(box);
    return box;
  }
  function dataShare(type, details) {
    const wrap=el('div','share-links ride-data-share');
    const status=el('p','small muted');status.setAttribute('role','status');
    const outer=el('div','feature-panel');outer.append(el('strong',null,'Share these wait times'),wrap,status);
    function payload(channel) {
      const {text,path,xIntro,xDetails,threads}=details();
      const url=new URL(`https://uniba-waittimes.com${path}`);
      url.searchParams.set('utm_source',channel);url.searchParams.set('utm_medium','social');
      url.searchParams.set('utm_campaign',`share_en_${type}`);
      return {text,xIntro,xDetails,threads,url:url.href};
    }
    function xMessage(item) {
      const head=`${item.xIntro||item.text}\n${item.url}`;
      const tags='\n'+shareTags;
      const lines=(item.xDetails||'').split('\n').filter(Boolean);
      for(let count=lines.length;count>=0;count--) {
        const value=head+(count?'\n\n'+lines.slice(0,count).join('\n'):'')+tags;
        const weighted=[...value.replace(item.url,'')].reduce((n,char)=>n+(char.codePointAt(0)>0x2ff?2:1),23);
        if(weighted<=280)return value;
      }
      return head+tags;
    }
    for(const [label,channel] of [['Facebook','facebook'],['X','x'],['Threads','threads'],['Copy','copy']]) {
      const control=el(channel==='copy'?'button':'a',channel,label);
      if(channel==='copy') {
        control.type='button';control.addEventListener('click',async()=>{
          const {text,url}=payload(channel);
          try{await navigator.clipboard.writeText(text+'\n'+url);status.textContent='Wait summary copied.';}
          catch{status.textContent='Copy unavailable in this browser.';}
        });
      }else{
        control.href='#';control.target='_blank';control.rel='noopener noreferrer';
        control.addEventListener('click',()=>{
          const item=payload(channel);
          control.href=channel==='facebook'?`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(item.url)}`:
            channel==='x'?`https://x.com/intent/post?text=${encodeURIComponent(xMessage(item))}`:
            `https://www.threads.com/intent/post?text=${encodeURIComponent(item.threads||item.text)}&url=${encodeURIComponent(item.url)}`;
        });
      }
      control.addEventListener('click',()=>window.trackSiteEvent?.('share_click',{share_channel:channel,content_type:type==='top_waits'?'top_waits':type==='map_ride'?'map_ride':'ride'}));
      wrap.append(control);
    }
    return outer;
  }
  function rideSharePayload(id,path='/en/') {
    const ride=app.live?.rides?.find(item=>Number(item.id)===Number(id));
    const name=ride?app.nameOf(ride):`Attraction ${id}`;
    const wait=ride?app.available(ride)?`${ride.wait_time} min`:'current wait unavailable':'current wait unavailable';
    const checked=app.live?.fetched_at ? new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(app.live.fetched_at))+' JST':'time unavailable';
    const compare=(minutes,label)=>{
      const value=ride&&app.available(ride)?app.change(ride,minutes):'—';
      const detail=value==='—'?'unavailable':value.startsWith('↑')?`${value.match(/\d+/)?.[0]||'?'} min longer`:
        value.startsWith('↓')?`${value.match(/\d+/)?.[0]||'?'} min shorter`:'about the same';
      return `${label}: ${detail}`;
    };
    const comparisons=[compare(5,'vs 5 min ago'),compare(20,'vs 20 min ago'),compare(60,'vs 1 hour ago')];
    const text=`USJ Wait Times Guide · standby wait (unofficial)\n${name}: ${wait} (${checked})\n${comparisons.join('\n')}\nPast changes, not a forecast.`;
    const short=[...name].length>28?[...name].slice(0,27).join('')+'…':name;
    return {text,threads:text,xIntro:`USJ wait · ${short}: ${wait} (${checked}) ↓`,
      xDetails:comparisons.filter(line=>!line.endsWith('unavailable')).join('\n'),
      path:`${path}${path.includes('?')?'&':'?'}ride=${id}`};
  }
  if (page === 'today') sharePanel('today',$('more'));
  if (page === 'map') sharePanel('map',$('map'));
  if (page === 'plan') sharePanel('plan',document.querySelector('main'));
  const footer = document.querySelector('.footer div');
  footer.append(el('p','page-links'));
  const footLinks = footer.lastElementChild;
  for (const [label,path] of [['Add to home screen','/en/install'],['About & privacy','/en/privacy'],['Contact by X DM','https://twitter.com/messages/compose?recipient_id=2108874187519733760']]) {
    const a = el('a','footer-link',label);a.href = path;
    if (path.startsWith('https:')) {a.target='_blank';a.rel='noopener noreferrer';}
    footLinks.append(a);
  }
  footer.append(el('p',null,'Created and operated by USJ Wait Times Guide · Since Oct. 2026'));

  const HEIGHTS = new Map([[7077,132],[12070,132],[7092,132],[12065,122],[12061,107],[14402,107],[12067,107],[12066,102],[12082,102],[12071,92],[12073,92],[12072,92],[14919,92],[12075,92],[14918,0],[7065,0],[12068,0],[17894,0],[13005,0]]);
  const CHILD_SWITCH = new Set([14402,12061,12071,12065,12073,14918,12066,12072,14919,12075,7065,7077,12070,12082,12084,12083,13005,7092,12067,12068,17894]);
  const TAGS = new Map([
    ['kids',new Set([12197,12084,7214,14919,12083,7065,7063,12075,12091,12072,14918,12066,12071])],
    ['small',new Set([12197,12068,7214,14919,7065,7063,12075,12091,14918,12071,13005])],
    ['thrill',new Set([7092,12067,15322,12068,17894,14919,12082,14402,12065,7077,12070,12073,12061,12066,12324,13925,17893,17912])],
    ['wet',new Set([12067,15322,12084,12068,17894,12083,14402,12072,13005])],
  ]);
  const WIND_SENSITIVE = new Set([7077,12070,7092,12073]);
  let windWarning = false;
  let applyingFilters = false;
  function setupToday() {
    const section = $('today');
    const top = el('div','feature-panel');top.append(el('h3',null,'Five longest listed standby waits'));
    const list = el('ol','top-five');list.id='en-top-five';top.append(list);
    section.insertBefore(top,$('today-status'));
    const movement = el('div','feature-panel');movement.append(el('h3',null,'Recent movement across attractions'));
    const movementStatus = el('div','movement-grid');movementStatus.id='en-movement';movement.append(movementStatus);
    movement.append(el('p','muted small','Changes from earlier recorded values, not a forecast. “About the same” means a difference under 5 minutes.'));
    section.insertBefore(movement,document.querySelector('#today .controls'));
    const cta = el('aside','feature-panel');cta.append(el('strong',null,'Which attraction is your No. 1? '));
    const voteLink = el('a',null,'Vote and see results ↗');voteLink.href='/en/vote';cta.append(voteLink);
    section.insertBefore(cta,document.querySelector('#today .controls'));
    const filters = el('div','feature-panel');filters.append(el('h3',null,'More filters'));
    filters.innerHTML += '<div class="feature-grid"><label>Minimum height allowed<select id="en-height"><option value="all">All attractions</option><option value="0">No listed height restriction</option><option value="92">92 cm or less</option><option value="102">102 cm or less</option><option value="107">107 cm or less</option><option value="122">122 cm or less</option><option value="132">132 cm or less</option></select></label><div><strong>Child Switch</strong><span class="check-group"><label><input id="en-child-switch" type="checkbox"> Compatible only</label></span></div></div><fieldset><legend>Attraction features (all selected must match)</legend><div class="check-group"><label><input type="checkbox" data-en-tag="kids"> 🧒 For kids</label><label><input type="checkbox" data-en-tag="small"> 👶 With small children</label><label><input type="checkbox" data-en-tag="thrill"> 🎢 Thrill ride</label><label><input type="checkbox" data-en-tag="wet"> 💧 May get wet</label></div></fieldset><p class="muted small">Height and features are site guidance. Confirm all riding conditions on the <a href="https://www.usj.co.jp/web/en/us/service-guide/safe/height-restriction" target="_blank" rel="noopener noreferrer">official USJ site</a>.</p>';
    section.insertBefore(filters,document.querySelector('#today .controls'));
    for (const control of filters.querySelectorAll('input,select')) control.addEventListener('change', applyRideFilters);
    const observer = new MutationObserver(() => { if (!applyingFilters) applyRideFilters(); });
    observer.observe($('ride-cards'),{childList:true});
    const statusObserver = new MutationObserver(updateToday);
    statusObserver.observe($('today-status'),{childList:true,characterData:true,subtree:true});
    window.addEventListener('en:history-updated',updateToday);
    updateToday();
  }
  function matchRide(id) {
    const height = $('en-height')?.value || 'all';
    if (height !== 'all') {
      const min = HEIGHTS.get(id);
      if (min === undefined || (height === '0' ? min !== 0 : min > Number(height))) return false;
    }
    if ($('en-child-switch')?.checked && !CHILD_SWITCH.has(id)) return false;
    for (const input of document.querySelectorAll('[data-en-tag]:checked')) if (!TAGS.get(input.dataset.enTag)?.has(id)) return false;
    return true;
  }
  function applyRideFilters() {
    if (applyingFilters) return;
    applyingFilters = true;
    try {
      const cards = [...$('ride-cards').children];
      const rows = [...$('ride-body').children];
      cards.forEach((card,index) => {
        const id = Number(card.querySelector('details[data-id]')?.dataset.id);
        const visible = matchRide(id);
        card.hidden = !visible;
        if (rows[index]) rows[index].hidden = !visible;
        const old = card.querySelector('.wind-caution');old?.remove();
        if (windWarning && WIND_SENSITIVE.has(id)) card.append(el('span','wind-caution','⚠ Wind may affect operations'));
        const detail=card.querySelector('.ride-details');
        if(detail && !detail.querySelector('.ride-data-share')) detail.append(dataShare('ride',()=>rideSharePayload(id)));
      });
    } finally { applyingFilters = false; }
  }
  function updateToday() {
    const rides = (app.live?.rides || []).filter(app.available).sort((a,b) => b.wait_time-a.wait_time);
    const list = $('en-top-five');if (!list) return;
    list.replaceChildren();
    for (const ride of rides.slice(0,5)) {
      const item = el('li'),name=app.nameOf(ride),url=app.officialAttractionUrl(ride.id);
      if(url){const link=el('a',null,name);link.href=url;link.target='_blank';link.rel='noopener noreferrer';item.append(link);}
      else item.append(document.createTextNode(name));
      item.append(document.createTextNode(' '),el('span','wait '+app.waitClass(ride.wait_time),`${ride.wait_time} min`));list.append(item);
    }
    if (!rides.length) list.append(el('li',null,'No current standby estimates.'));
    const topPanel=list.closest('.feature-panel');
    if(!topPanel.querySelector('.ride-data-share')) topPanel.append(dataShare('top_waits',()=>{
      const current=(app.live?.rides||[]).filter(app.available).sort((a,b)=>b.wait_time-a.wait_time).slice(0,5);
      const stamp=app.live?.fetched_at?new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(app.live.fetched_at))+' JST':'time unavailable';
      const ranked=current.length?current.map((ride,i)=>`${i+1}. ${app.nameOf(ride)} ${ride.wait_time} min`).join('\n'):'No current standby estimates.';
      const all=(app.live?.rides||[]).filter(app.available);
      const movements=[20,5].map(minutes=>{
        const counts={up:0,flat:0,down:0};
        for(const ride of all){const value=app.change(ride,minutes);if(value.startsWith('↑'))counts.up++;else if(value.startsWith('↓'))counts.down++;else if(value.startsWith('→'))counts.flat++;}
        const total=counts.up+counts.flat+counts.down;
        return {minutes,total,...counts,line:total?
          `• Compared with ${minutes} min ago (${total} attractions): ${counts.up} longer · ${counts.flat} about the same · ${counts.down} shorter`:
          `• Compared with ${minutes} min ago: reliable comparison unavailable`};
      });
      const text=`USJ standby waits · ${stamp} (longest first)\n\n${ranked}\n\nRecent wait changes\n${movements.map(item=>item.line).join('\n')}\n\nUnofficial estimates; past changes are not a forecast.`;
      const compact=current.map((ride,i)=>{
        const name=app.nameOf(ride);const short=[...name].length>15?[...name].slice(0,14).join('')+'…':name;
        return `${i+1}. ${short} ${ride.wait_time}m`;
      });
      const twenty=movements[0];
      return {text,threads:text,xIntro:`USJ waits · ${stamp}. Top 5 and recent changes ↓`,
        xDetails:[...compact,...(twenty.total?[`20m: ${twenty.up} longer · ${twenty.flat} same · ${twenty.down} shorter`]:[])].join('\n'),path:'/en/'};
    }));
    const movement = $('en-movement');movement.replaceChildren();
    for (const minutes of [20,5]) {
      let up=0,flat=0,down=0,compared=0;
      for (const ride of rides) {
        const value = app.change(ride,minutes);
        if (value==='—') continue;
        compared++;
        if(value.startsWith('↑')) up++;
        else if(value.startsWith('↓')) down++;
        else flat++;
      }
      movement.append(el('p',null,compared?
        `${minutes} min ago (${compared} attractions): ${up} longer · ${flat} about the same · ${down} shorter`:
        `${minutes} min ago: reliable comparison unavailable`));
    }
    applyRideFilters();
  }
  if (page === 'today') setupToday();

  function setupRideHistory() {
    const section=el('section');section.id='en-ride-history';
    section.innerHTML='<h2>Attraction history and comparisons</h2><p id="en-history-status" class="muted" role="status">Choose an attraction to see saved records.</p><div class="controls"><label>Attraction<select id="en-history-ride"></select></label><label>Time range<select id="en-history-range"><option value="1">Past 24 hours</option><option value="7">Past 7 days</option><option value="30">Past 30 days</option></select></label></div><div class="summary"><div class="stat">Current listed wait<strong id="en-history-current">—</strong></div><div class="stat">Previous saved record<strong id="en-history-previous">—</strong></div><div class="stat">Difference from the past 7 days at this hour<strong id="en-history-week">—</strong></div></div><h3>Average wait by hour</h3><div id="en-history-bars" class="hour-bars"></div><h3>Recent 20-minute records today</h3><div class="table-wrap"><table class="table"><thead><tr><th>Time</th><th>Wait</th><th>Change</th></tr></thead><tbody id="en-history-records"></tbody></table></div><p class="muted small">Hourly averages use available open-attraction records. Closures and missing records are not counted as zero.</p>';
    $('more').before(section);
    const rideSelect=$('en-history-ride'),range=$('en-history-range');
    let currentRequest=0;
    function fillRides() {
      const old=rideSelect.value;
      rideSelect.replaceChildren();
      for (const ride of app.live?.rides||[]) rideSelect.append(new Option(app.nameOf(ride),String(ride.id)));
      rideSelect.value=old && [...rideSelect.options].some(o=>o.value===old)?old:rideSelect.options[0]?.value||'';
      load();
    }
    async function load() {
      const id=Number(rideSelect.value);if (!id) return;
      const request=++currentRequest,days=Number(range.value);
      const ride=app.live?.rides?.find(item=>Number(item.id)===id);
      $('en-history-current').textContent=ride?app.available(ride)?`${ride.wait_time} min`:'Closed or unknown':'—';
      const snapshots=(app.history?.snapshots||[]).slice().reverse();
      const saved=snapshots.map(s=>({at:s.captured_at,value:s.rides?.[String(id)]?.is_open?s.rides?.[String(id)]?.wait_minutes:null}));
      $('en-history-records').replaceChildren();
      const recent=saved.slice(-18);
      for (let index=recent.length-1;index>=0;index--) {
        const item=recent[index],prior=recent[index-1]?.value;
        const row=el('tr');
        row.append(el('td',null,app.hourFmt.format(new Date(item.at*1000))),el('td',null,Number.isFinite(item.value)?`${item.value} min`:'—'));
        row.append(el('td',null,Number.isFinite(item.value)&&Number.isFinite(prior)?`${item.value-prior>0?'+':''}${item.value-prior} min`:'—'));
        $('en-history-records').append(row);
      }
      const previous=saved.filter(s=>Number.isFinite(s.value)).at(-1);
      $('en-history-previous').textContent=previous?`${previous.value} min (${app.hourFmt.format(new Date(previous.at*1000))})`:'—';
      $('en-history-status').textContent='Loading saved hourly averages…';
      try {
        const [data,week]=await Promise.all([get(`/api/history?ride_id=${id}&days=${days}`),days===7?Promise.resolve(null):get(`/api/history?ride_id=${id}&days=7`)]);
        if (request!==currentRequest) return;
        const hours=(data.hours||[]).filter(h=>Number.isFinite(h.average_wait));
        $('en-history-status').textContent=`${hours.length} hourly averages from saved records.`;
        const bars=$('en-history-bars');bars.replaceChildren();
        const points=days===30?groupByDay(hours):hours;
        const max=Math.max(1,...points.map(h=>h.average_wait));
        for (const point of points.slice(-35)) {
          const row=el('div','hour-row');
          row.style.gridTemplateColumns=days===1?'55px 1fr 58px':'95px 1fr 58px';
          row.append(el('span',null,point.label));
          const track=el('div','hour-track');const fill=el('span');fill.style.width=`${point.average_wait/max*100}%`;track.append(fill);
          row.append(track,el('strong',null,`${Math.round(point.average_wait)} min`));bars.append(row);
        }
        const weekly=(week||data).hours||[];
        const hourNow=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit'}).format(new Date());
        const jstDay=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'});
        const today=jstDay.format(new Date());
        const comparable=weekly.filter(h=>Number.isFinite(h.average_wait) && jstDay.format(new Date(h.at*1000))!==today && new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit'}).format(new Date(h.at*1000))===hourNow);
        const baseline=comparable.length?comparable.reduce((sum,h)=>sum+h.average_wait,0)/comparable.length:null;
        $('en-history-week').textContent=app.available(ride)&&Number.isFinite(baseline)?`${ride.wait_time-baseline>=0?'+':''}${Math.round(ride.wait_time-baseline)} min vs ${Math.round(baseline)} min hourly average`:'Not enough comparable records';
      } catch(error) {if(request===currentRequest)$('en-history-status').textContent=`History unavailable: ${error.message}`;}
    }
    function groupByDay(hours) {
      const days=new Map();
      for(const h of hours) {
        const day=new Date(h.at*1000+32400000).toISOString().slice(0,10);
        const values=days.get(day)||[];values.push(h.average_wait);days.set(day,values);
      }
      return [...days].map(([day,values])=>({label:day.slice(5),average_wait:values.reduce((a,b)=>a+b,0)/values.length}));
    }
    rideSelect.addEventListener('change',load);range.addEventListener('change',load);
    new MutationObserver(fillRides).observe($('today-status'),{childList:true,characterData:true,subtree:true});
    fillRides();
  }
  if (page==='today') setupRideHistory();

  function setupShowTimeline() {
    const section=$('shows');
    const switcher=el('div','segmented');
    const list=el('button',null,'List'),timeline=el('button',null,'Timeline');
    for(const button of [list,timeline]) {button.type='button';switcher.append(button);}
    list.setAttribute('aria-pressed','true');timeline.setAttribute('aria-pressed','false');
    section.insertBefore(switcher,$('show-status'));
    const timelineBox=el('div','table-wrap');timelineBox.hidden=true;
    const table=el('table','table');table.innerHTML='<thead><tr><th>Start time</th><th>Show</th></tr></thead><tbody id="en-show-timeline"></tbody>';
    timelineBox.append(table);$('show-list').after(timelineBox);
    list.addEventListener('click',()=>{list.setAttribute('aria-pressed','true');timeline.setAttribute('aria-pressed','false');$('show-list').hidden=false;timelineBox.hidden=true;});
    timeline.addEventListener('click',()=>{list.setAttribute('aria-pressed','false');timeline.setAttribute('aria-pressed','true');$('show-list').hidden=true;timelineBox.hidden=false;});
    let request=0;
    async function load(day) {
      const id=++request;
      try {
        const data=await get(`/api/shows?date=${encodeURIComponent(day)}`);if(id!==request)return;
        const rows=[];
        for(const show of data.shows||[]) for(const t of show.times||[]) {
          const time=typeof t==='string'?t:new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit'}).format(new Date(t.start||t));
          rows.push({time,name:app.showNames.get(show.name)||show.name});
        }
        rows.sort((a,b)=>a.time.localeCompare(b.time));
        const body=$('en-show-timeline');body.replaceChildren();
        for(const item of rows){const row=el('tr');row.append(el('td',null,item.time),el('td',null,item.name));body.append(row);}
        if(!rows.length){const row=el('tr');const cell=el('td',null,'No published show starts for this date.');cell.colSpan=2;row.append(cell);body.append(row);}
      } catch { $('en-show-timeline').textContent='Show timeline unavailable.'; }
    }
    $('show-dates').addEventListener('click',event=>{
      const buttons=[...$('show-dates').querySelectorAll('button')];
      const index=buttons.indexOf(event.target.closest('button'));if(index<0)return;
      const day=new Date(Date.parse(today()+'T00:00:00Z')+index*86400000).toISOString().slice(0,10);load(day);
    });
    load(today());
  }
  if(page==='today'||page==='plan')setupShowTimeline();

  // Planning details use the same API responses and the same manually checked source dates as Japanese.
  const plan = {prices:null,pass:null,holidays:new Map(),closures:[],events:[]};
  const holidayNames = new Map(Object.entries({
    '元日':"New Year's Day",'成人の日':'Coming of Age Day','建国記念の日':'National Foundation Day',
    '天皇誕生日':"Emperor's Birthday",'春分の日':'Vernal Equinox Day','昭和の日':'Showa Day',
    '憲法記念日':'Constitution Memorial Day','みどりの日':'Greenery Day','こどもの日':"Children's Day",
    '海の日':'Marine Day','山の日':'Mountain Day','敬老の日':'Respect for the Aged Day',
    '秋分の日':'Autumnal Equinox Day','スポーツの日':'Sports Day','文化の日':'Culture Day',
    '勤労感謝の日':'Labor Thanksgiving Day','振替休日':'Substitute Holiday','国民の休日':"Citizen's Holiday",
  }));
  function passDays(months) {
    const days = new Set();
    for (const [month,ranges] of Object.entries(months || {})) {
      for (const token of ranges.split(',').filter(Boolean)) {
        if (!/^\d{1,2}(?:-\d{1,2})?$/.test(token)) continue;
        const [from,to=from] = token.split('-').map(Number);
        const last = new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5)),0)).getUTCDate();
        if (from<1 || to<from || to>last) continue;
        for (let n=from;n<=to;n++) days.add(`${month}-${String(n).padStart(2,'0')}`);
      }
    }
    return days;
  }
  function closuresOn(day) {
    return plan.closures.filter(item => item.start && item.start<=day && (!item.end || day<=item.end));
  }
  function renderPlanCalendarExtras() {
    const grid = $('month-grid');if (!grid) return;
    for (const button of grid.querySelectorAll('button[data-day]')) {
      button.querySelectorAll('.cal-extra').forEach(node => node.remove());
      const day = button.dataset.day;
      const price = plan.prices?.adult_prices?.[day];
      const exclusion = plan.pass?.days.has(day);
      const holiday = plan.holidays.get(day);
      const closures = closuresOn(day).length;
      if (price) button.append(el('small','cal-extra',`¥${price.toLocaleString('en-US')}`));
      if (exclusion) button.append(el('small','cal-extra exclusion','Standard Pass excluded'));
      if (holiday) button.append(el('small','cal-extra',holiday));
      if (closures) button.append(el('small','cal-extra closure',`${closures} closure${closures===1?'':'s'}`));
      button.disabled = button.disabled && !(price || exclusion || holiday || closures);
    }
  }
  function renderSelectedDay() {
    const box = $('en-selected-day');if (!box) return;
    const day = app.selectedDay;
    const item = app.scheduleDays.get(day);
    const hours = item?.status === 'CLOSED' ? 'Park closed' : item?.opens && item?.closes ? `${item.opens}–${item.closes} JST` : 'Not published';
    box.replaceChildren(el('h3',null,dateLabel(day)),el('p',null,`Published park hours: ${hours}`));
    const meta = el('div','plan-meta');
    const price = plan.prices?.adult_prices?.[day];
    if (price) meta.append(el('span',null,`1-Day Studio Pass, adult: ¥${price.toLocaleString('en-US')}`));
    if (plan.pass?.days.has(day)) meta.append(el('span',null,'Universal Prime Annual Pass Standard: excluded date'));
    if (plan.holidays.has(day)) meta.append(el('span',null,`Japan public holiday: ${plan.holidays.get(day)}`));
    box.append(meta);
    const closures = closuresOn(day);
    if (closures.length) {
      box.append(el('h3',null,'Scheduled attraction closures'));
      const list = el('ul','simple-list');
      for (const item of closures) list.append(el('li',null,`${item.title_en || item.title}${item.end_note_en ? ` · ${item.end_note_en}` : ''}`));
      box.append(list);
    }
    const events = plan.events.filter(item => item.start && item.start<=day && (!item.end || day<=item.end));
    if (events.length) {
      box.append(el('h3',null,'Events on this date'));
      const list = el('ul','simple-list');
      for (const item of events) {
        const li=el('li');const a=el('a',null,item.title_en||item.title);
        a.href=item.url_en||item.url||'#';a.target='_blank';a.rel='noopener noreferrer';li.append(a);
        if(item.time_note_en)li.append(el('span','small muted',` · ${item.time_note_en}`));
        list.append(li);
      }
      box.append(list);
    }
    if (price && plan.prices?.checked_at) box.append(el('p','muted small',`Adult ticket price is manually transcribed from the official purchase screen, checked ${plan.prices.checked_at}. It may change; confirm before buying.`));
    const links=el('p','small muted');
    if(price && plan.prices?.source_url){const a=el('a',null,'Official ticket price calendar ↗');a.href=plan.prices.source_url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
    if(plan.pass?.source_url){if(links.childNodes.length)links.append(document.createTextNode(' · '));const a=el('a',null,'Official Standard Pass exclusions ↗');a.href=plan.pass.source_url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
    if(links.childNodes.length)box.append(links);
  }
  function archiveHighlights(data) {
    const hours = (data.hours||[]).filter(h => Number.isFinite(h.average_wait));
    const peak = [...hours].sort((a,b)=>b.average_wait-a.average_wait)[0];
    const top = [];
    for (const hour of data.hours||[]) for (const [id,value] of Object.entries(hour.rides||{})) {
      if (Number.isFinite(value.average_wait)) top.push({id,at:hour.at,wait:value.average_wait});
    }
    top.sort((a,b)=>b.wait-a.wait);
    return {peak,top:top[0]};
  }
  function renderArchiveDetails() {
    const data = app.archiveData;
    if (!data || data.day !== app.selectedDay) return;
    const box = $('en-archive-detail');if (!box) return;
    const {peak,top} = archiveHighlights(data);
    const rideName = id => app.nameOf(app.live?.rides?.find(ride=>String(ride.id)===String(id)) || {id});
    $('en-archive-peak').textContent = peak ? `${app.hourFmt.format(new Date(peak.at*1000)).slice(0,2)}:00 hour · ${Math.round(peak.average_wait)} min average` : 'No comparable hour';
    $('en-archive-longest').textContent = top ? `${rideName(top.id)} · ${Math.round(top.wait)} min average (${app.hourFmt.format(new Date(top.at*1000)).slice(0,2)}:00 hour)` : 'No comparable record';
    $('en-archive-period').textContent = data.first_at && data.last_at ? `Records from ${app.hourFmt.format(new Date(data.first_at*1000))} to ${app.hourFmt.format(new Date(data.last_at*1000))} JST. Hours without records are not included.` : 'Record times unavailable.';
    const weather = data.weather;
    $('en-archive-weather').textContent = weather ? `Osaka Observatory observations: max ${weather.temp_max ?? '—'}°C, min ${weather.temp_min ?? '—'}°C, precipitation ${weather.precip_total ?? '—'} mm. These are not measurements inside USJ.` : 'Osaka weather observations are unavailable for this day.';
    const charts = $('en-archive-charts');charts.replaceChildren();
    const ids = [...new Set((data.hours||[]).flatMap(hour=>Object.keys(hour.rides||{})))];
    const avg = id => {const values=(data.hours||[]).map(hour=>hour.rides?.[id]?.average_wait).filter(Number.isFinite);return values.length?values.reduce((a,b)=>a+b,0)/values.length:-1;};
    ids.sort((a,b)=>Number(app.favorites.has(Number(b)))-Number(app.favorites.has(Number(a))) || avg(b)-avg(a));
    for (const id of ids) {
      const card = el('div','archive-chart');card.append(el('strong',null,rideName(id)));
      const bars = el('div','mini-bars');
      const max = Math.max(30,...(data.hours||[]).map(h=>h.rides?.[id]?.average_wait||0));
      for (const hour of data.hours||[]) {
        const value=hour.rides?.[id]?.average_wait,bar=el('i',Number.isFinite(value)?'':'missing');
        bar.style.height=Number.isFinite(value)?`${Math.max(3,value/max*100)}%`:'2px';
        bar.title=`${app.hourFmt.format(new Date(hour.at*1000))}: ${Number.isFinite(value)?Math.round(value)+' min average':hour.rides?.[id]?.closed_samples?'closed':'no record'}`;
        bars.append(bar);
      }
      bars.setAttribute('role','img');bars.setAttribute('aria-label',`${rideName(id)} hourly average wait trend on ${dateLabel(data.day)}`);
      card.append(bars,el('span','small muted',`Day mean of hourly values: ${avg(id)>=0?Math.round(avg(id))+' min':'unavailable'}`));
      charts.append(card);
    }
    $('en-archive-share')?.remove();
    const average=Number.isFinite(data.average_wait)?`${Math.round(data.average_wait)} min`:'unavailable';
    const busiest=peak?`${app.hourFmt.format(new Date(peak.at*1000)).slice(0,2)}:00 hour (${Math.round(peak.average_wait)} min average)`:'unavailable';
    const longest=top?`${rideName(top.id)} · ${Math.round(top.wait)} min hourly average`:'unavailable';
    const weatherLine=weather?`Osaka weather: high ${weather.temp_max??'—'}°C, low ${weather.temp_min??'—'}°C, rain ${weather.precip_total??'—'} mm.`:'';
    const body=`USJ Wait Times Guide · past crowd record for ${dateLabel(data.day)}\nAverage wait: ${average}\nBusiest hour: ${busiest}\nLongest attraction hourly average: ${longest}${weatherLine?'\n'+weatherLine:''}\nUnofficial site; unavailable and closed records are excluded.`;
    const share=sharePanel('plan',$('past-record'),`/en/plan?date=${encodeURIComponent(data.day)}`,{
      body,threads:body,xIntro:`USJ ${dateLabel(data.day)} past waits: ${average} average; busiest at ${busiest}. See the record ↓`,
    });
    share.id='en-archive-share';share.querySelector('h3').textContent='Share this day';
  }
  async function loadPlanMeta() {
    const results = await Promise.allSettled([
      get('/api/ticket-prices'),get('/api/pass-exclusions'),get('/api/holidays'),get('/api/closures'),get('/api/events'),
    ]);
    if (results[0].status==='fulfilled') plan.prices=results[0].value;
    if (results[1].status==='fulfilled') plan.pass={...results[1].value,days:passDays(results[1].value.months)};
    if (results[2].status==='fulfilled') plan.holidays=new Map((results[2].value.days||[]).map(item=>[item.day,holidayNames.get(item.name)||item.name]));
    if (results[3].status==='fulfilled') plan.closures=results[3].value.closures||[];
    if (results[4].status==='fulfilled') plan.events=results[4].value.events||[];
    renderPlanCalendarExtras();renderSelectedDay();renderPlanEvents();
  }
  function renderPlanEvents() {
    const target=$('en-plan-events');if(!target)return;
    target.replaceChildren();
    const current=today();
    const groups=[
      ['Currently running',plan.events.filter(item=>item.start && item.start<=current && item.end && current<=item.end)],
      ['Coming up',plan.events.filter(item=>item.start && item.start>current)],
      ['End date not published',plan.events.filter(item=>item.start && item.start<=current && !item.end)],
    ];
    for(const [heading,events] of groups){
      target.append(el('h3',null,`${heading} (${events.length})`));
      const list=el('ul','simple-list');
      for(const item of events){
        const li=el('li');const link=el('a',null,item.title_en||item.title);
        link.href=item.url_en||item.url||'#';link.target='_blank';link.rel='noopener noreferrer';
        li.append(link,el('span','small muted',` · ${item.time_note_en||`${item.start}${item.end?'–'+item.end:''}`}`));list.append(li);
      }
      if(!events.length)list.append(el('li','muted','None listed.'));
      target.append(list);
    }
  }
  function setupPlan() {
    const history = $('history');
    const detail=el('div','feature-panel');detail.id='en-selected-day';
    $('plan-day-info').after(detail);
    const record=$('past-record');
    const facts=el('div','feature-panel');facts.id='en-archive-detail';
    facts.innerHTML='<div class="summary"><div class="stat">Busiest hour<strong id="en-archive-peak">—</strong></div><div class="stat">Longest hourly attraction average<strong id="en-archive-longest">—</strong></div></div><p id="en-archive-period" class="small muted"></p><p id="en-archive-weather" class="small muted"></p>';
    record.insertBefore(facts,record.querySelector('h3'));
    const switcher=el('div','segmented archive-mode');
    for (const mode of ['Charts','Table']) {
      const button=el('button',null,mode);button.type='button';button.setAttribute('aria-pressed',String(mode==='Charts'));
      button.addEventListener('click',()=>{
        for (const b of switcher.children) b.setAttribute('aria-pressed',String(b===button));
        $('en-archive-charts').hidden=mode!=='Charts';$('archive-wrap').hidden=mode!=='Table';
      });switcher.append(button);
    }
    record.insertBefore(switcher,$('archive-wrap'));
    const charts=el('div','archive-charts');charts.id='en-archive-charts';
    record.insertBefore(charts,$('archive-wrap'));$('archive-wrap').hidden=true;
    const source=el('p','muted small');source.innerHTML='Park hours: <a href="https://www.usj.co.jp/web/en/us/park-guide/schedule/park-hour2" target="_blank" rel="noopener noreferrer">USJ official schedule</a>. Ticket prices and Standard Pass exclusions are manually checked; see their linked official sources in Japanese. Past hourly values exclude closed and missing records.';
    history.append(source);
    const events=el('section');events.id='en-plan-events';events.append(el('h2',null,'Events'));$('hours').after(events);
    $('event-list').closest('details').hidden=true;
    new MutationObserver(renderPlanCalendarExtras).observe($('month-grid'),{childList:true});
    new MutationObserver(renderSelectedDay).observe($('plan-day-info'),{childList:true,characterData:true,subtree:true});
    new MutationObserver(renderArchiveDetails).observe($('archive-body'),{childList:true});
    loadPlanMeta();renderSelectedDay();
    const dayParam=new URLSearchParams(location.search).get('date');
    if (/^\d{4}-\d{2}-\d{2}$/.test(dayParam||'')) {
      const poll=setInterval(()=>{
        if (app.scheduleDays.size || app.recordedDays.size) {clearInterval(poll);app.selectPlanDay(dayParam);}
      },150);
      setTimeout(()=>clearInterval(poll),5000);
    }
  }
  if (page === 'plan') setupPlan();

  async function loadWeatherDetail() {
    const target=$('en-weather-extra');if (!target) return;
    try {
      const data=await get('/api/weather');
      target.replaceChildren();
      const observed=data.jma;
      if (observed) {
        const when=observed.observed_at ? new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(observed.observed_at)) : 'time unavailable';
        target.append(el('h3',null,'Japan Meteorological Agency: Osaka observation'));
        target.append(el('p','small muted',`${when} JST · Osaka weather observation. See the linked JMA source for the official forecast.`));
        const values=el('div','summary');
        for (const [label,value,unit] of [['Observed temperature',observed.temperature,'°C'],['Observed wind',observed.wind_speed,' m/s'],['1-hour rainfall',observed.precipitation_1h,' mm']]) {
          const cell=el('div','stat',label);cell.append(el('strong',null,Number.isFinite(value)?`${value}${unit}`:'—'));values.append(cell);
        }
        target.append(values);
      }
      const periods=(data.periods||[]).slice(0,8);
      target.append(el('h3',null,'Hourly forecast near USJ'));
      const forecast=el('div','weather-periods');
      for (const period of periods) {
        const card=el('div');
        const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit'}).format(new Date(period.time));
        card.append(el('strong',null,`${time} JST`));
        card.append(el('span',null,`${Number.isFinite(period.temperature)?period.temperature+'°C':'—'} · wind ${Number.isFinite(period.wind_speed)?period.wind_speed+' m/s':'—'} · rain ${Number.isFinite(period.precipitation)?period.precipitation+' mm':'—'}`));
        forecast.append(card);
      }
      target.append(forecast);
      const first=periods[0];
      windWarning=!!first && ((Number.isFinite(first.wind_speed)&&first.wind_speed>=7)||(Number.isFinite(first.wind_gust)&&first.wind_gust>=10));
      if (windWarning) {
        target.append(el('p','feature-panel',Number(first.wind_speed)>=10 || Number(first.wind_gust)>=10 ? '⚠ Strong wind caution for outdoor rides. Check the official app for operations.' : '⚠ Wind caution for outdoor rides. Check the official app for operations.'));
      }
      applyRideFilters();
    } catch(error) { target.textContent=`Detailed weather unavailable: ${error.message}`; }
  }
  if (page==='today') {
    const extra=el('div');extra.id='en-weather-extra';$('weather-values').after(extra);
    loadWeatherDetail();setInterval(loadWeatherDetail,30*60*1000);
  }

  const illustrationSpots = [
    [35.15,53.65,[7077,12070,17912]],[21.13,34.93,[12082,12324]],[19.64,49.06,[12083,12084,13925]],
    [34.75,36.11,[7214]],[28.4,42.66,[12091]],[21.36,40.84,[17893]],[20.48,30.04,[13005]],
    [48.98,10.69,[12066]],[45.56,16.09,[12072]],[52.61,17.74,[14918]],[70.26,17.52,[7092]],
    [78.21,28.41,[12067,15322]],[61.27,46.2,[12068,17894]],[47.55,64.64,[7065]],
    [51.3,67.4,[7063]],[56.36,56.6,[14919]],[49.77,56.03,[12075]],[67.09,77.85,[12065]],
    [61.01,77.37,[12073]],[68.24,72.49,[12197]],[81.84,74.54,[12061]],[86.83,79.09,[12071]],
    [83.75,84.30,[14402]],
  ];
  const illustrationKeys=[
    'hollywood_dream_the_ride','space_fantasy_the_ride','chainsawman_the_chaos_4D_2026','sing_on_tour',
    'playing_with_curious_george','factory_of_fear_zombie_tour_2026','conan_4d_live_show','despicable_me_minion_mayhem',
    'freeze_ray_sliders','illuminations_villain_con_minion_blast','the_flying_dinosaur','jurassic_park_the_ride',
    'jaws','hello_kittys_cupcake_dream','hello_kittys_ribbon_collection','snoopys_adventure','the_flying_snoopy',
    'harry_potter_forbidden_journey','flight_of_the_hippogriff','ollivanders','mario_kart_koopas_challenge',
    'yoshis_adventure','donkey_kong_country_ride',
  ];
  function setupMap() {
    const section=$('map');
    const switcher=el('div','map-mode segmented');
    const geoButton=el('button',null,'Map and GPS'),illusButton=el('button',null,'Illustrated map');
    for (const b of [geoButton,illusButton]) {b.type='button';switcher.append(b);}
    geoButton.setAttribute('aria-pressed','true');illusButton.setAttribute('aria-pressed','false');
    section.insertBefore(switcher,section.querySelector('.map-controls'));
    const geoControls=section.querySelector('.map-controls');
    const tools=el('div','map-controls');tools.hidden=true;
    for (const [label,fn] of [['+ Zoom in',()=>zoom(1.25)],['− Zoom out',()=>zoom(1/1.25)],['Show whole map',()=>resetIllustration()],['↻ Refresh waits',()=>app.refreshWaits($('map-refresh'))]]) {
      const b=el('button','action',label);b.type='button';b.addEventListener('click',fn);tools.append(b);
    }
    const level=el('span','small muted','100%');level.id='en-map-zoom';tools.append(level);
    section.insertBefore(tools,$('map-status'));
    const frame=el('div','map-frame');frame.id='en-illustration';frame.hidden=true;
    frame.style.cssText='height:auto;min-height:0;aspect-ratio:1280/1169;';
    const stage=el('div','map-stage');stage.id='en-map-stage';
    const image=el('img');image.src=window.__EN_PREVIEW_PARK_IMAGE__||'/park-map.jpg';image.alt='Illustrated map of Universal Studios Japan, created by the site owner';image.draggable=false;
    const pins=el('div');pins.id='en-illustration-pins';pins.style.cssText='position:absolute;inset:0;';
    stage.append(image,pins);frame.append(stage);$('geo-map').after(frame);
    const places=(()=>{try{return JSON.parse($('map-locations').textContent).locations||[];}catch{return [];}})();
    const byKey=new Map(places.filter(p=>p.type==='ATTRACTION').map(p=>[p.key.split('.').at(-1),p]));
    const state={scale:1,x:0,y:0,pointers:new Map(),drag:null};
    function apply() {
      const w=frame.clientWidth,h=frame.clientHeight;
      state.x=Math.max(w*(1-state.scale),Math.min(0,state.x));
      state.y=Math.max(h*(1-state.scale),Math.min(0,state.y));
      stage.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;
      frame.dataset.zoom=state.scale<1.45?'overview':'detail';
      level.textContent=`${Math.round(state.scale*100)}%`;
    }
    function zoom(factor,cx=frame.clientWidth/2,cy=frame.clientHeight/2) {
      const old=state.scale;state.scale=Math.max(1,Math.min(4,state.scale*factor));
      state.x=cx-(cx-state.x)*state.scale/old;state.y=cy-(cy-state.y)*state.scale/old;apply();
    }
    function resetIllustration(){state.scale=1;state.x=0;state.y=0;apply();}
    function renderPins() {
      pins.replaceChildren();
      const rides=new Map((app.live?.rides||[]).map(ride=>[Number(ride.id),ride]));
      illustrationSpots.forEach(([x,y,ids],index)=>{
        const ride=ids.map(id=>rides.get(id)).find(app.available) || (ids.length===1?rides.get(ids[0]):null);
        const place=byKey.get(illustrationKeys[index]);
        const value=ride?app.available(ride)?`${ride.wait_time} min`:'Unknown':'Unknown';
        const delta=ride?app.change(ride,20):'—';
        const text=value+(delta==='—'?'':' '+delta[0]);
        const pin=el('button','illustration-pin '+(app.available(ride)?app.waitClass(ride.wait_time):'unknown'),text);
        pin.type='button';pin.style.left=`${x}%`;pin.style.top=`${y}%`;
        if (![0,7,10,12,17,20].includes(index)) pin.classList.add('not-overview');
        pin.title=`${ride?app.nameOf(ride):place?.name||'Attraction'}: ${value}`;
        pin.setAttribute('aria-label',pin.title+'; show details');
        pin.addEventListener('click',event=>{
          event.stopPropagation();
          const detail=$('map-detail');detail.replaceChildren();detail.hidden=false;
          detail.append(el('h3',null,ride?app.nameOf(ride):place?.name||'Attraction'));
          detail.append(el('p',null,`Current standby wait: ${value}`));
          if (ride) detail.append(el('p',null,`20 min ago: ${delta}`));
          const official=ride&&app.officialAttractionUrl(ride.id);
          if(official){
            const info=el('p'),link=el('a',null,'View attraction on the official USJ site ↗');
            link.href=official;link.target='_blank';link.rel='noopener noreferrer';info.append(link);detail.append(info);
          }
          if (place) {
            const route=el('a',null,'Open walking directions in Google Maps ↗');
            route.href=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.lat},${place.lng}`)}&travelmode=walking`;
            route.target='_blank';route.rel='noopener noreferrer';detail.append(route);
          }
          detail.scrollIntoView({block:'nearest'});
        });
        pins.append(pin);
      });
    }
    geoButton.addEventListener('click',()=>{
      geoButton.setAttribute('aria-pressed','true');illusButton.setAttribute('aria-pressed','false');
      geoControls.hidden=false;$('geo-map').hidden=false;tools.hidden=true;frame.hidden=true;
      app.geoMap?.resize();
    });
    illusButton.addEventListener('click',()=>{
      geoButton.setAttribute('aria-pressed','false');illusButton.setAttribute('aria-pressed','true');
      geoControls.hidden=true;$('geo-map').hidden=true;tools.hidden=false;frame.hidden=false;
      renderPins();apply();
    });
    const zoomControls=el('span','feature-grid');
    for (const [label,sign] of [['+ Map zoom',1],['− Map zoom',-1]]) {
      const b=el('button','action',label);b.type='button';b.addEventListener('click',()=>{
        if (!app.geoMap) return;
        app.geoMap.zoomTo(app.geoMap.getZoom()+sign,{duration:250});
      });zoomControls.append(b);
    }
    geoControls.append(zoomControls);
    new MutationObserver(()=>{
      const detail=$('map-detail');
      if(detail.hidden||detail.querySelector('.ride-data-share'))return;
      const name=detail.querySelector('h3')?.textContent;
      const ride=app.live?.rides?.find(item=>app.nameOf(item)===name);
      if(ride)detail.append(dataShare('map_ride',()=>rideSharePayload(ride.id,'/en/map')));
    }).observe($('map-detail'),{childList:true});
    frame.addEventListener('wheel',e=>{e.preventDefault();const rect=frame.getBoundingClientRect();zoom(e.deltaY<0?1.15:1/1.15,e.clientX-rect.left,e.clientY-rect.top);},{passive:false});
    frame.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;frame.setPointerCapture(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});state.drag={x:e.clientX,y:e.clientY};});
    frame.addEventListener('pointermove',e=>{
      if (!state.pointers.has(e.pointerId)) return;
      const before=state.pointers.get(e.pointerId);state.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if (state.pointers.size===1) {state.x+=e.clientX-before.x;state.y+=e.clientY-before.y;apply();}
      else if(state.pointers.size===2) {
        const points=[...state.pointers.values()];
        const previous=[...state.pointers.values()].map(p=>p===state.pointers.get(e.pointerId)?before:p);
        const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
        const prior=distance(previous[0],previous[1]);
        if(prior>0) zoom(distance(points[0],points[1])/prior,(points[0].x+points[1].x)/2-frame.getBoundingClientRect().left,(points[0].y+points[1].y)/2-frame.getBoundingClientRect().top);
      }
    });
    const release=e=>{state.pointers.delete(e.pointerId);state.drag=null;};
    frame.addEventListener('pointerup',release);frame.addEventListener('pointercancel',release);
    new MutationObserver(renderPins).observe($('today-status'),{childList:true,characterData:true,subtree:true});
    renderPins();
  }
  if (page==='map') setupMap();

  const POLL_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScJm9Ep-67ONqlxMhTyPcBJBJXGmKg4w2HJr2PTb5pQrQxgiQ/viewform';
  const POLL_FIELD = 'entry.893336371';
  const POLL_OPTIONS = [
    [12061,'マリオカート ～クッパの挑戦状～™','Mario Kart: Koopa’s Challenge'],
    [14402,'ドンキーコングのクレイジー・トロッコ™','Mine Cart Madness'],
    [12065,'ハリー・ポッター・アンド・ザ・フォービドゥン・ジャーニー™','Harry Potter and the Forbidden Journey'],
    [12066,'ミニオン・ハチャメチャ・ライド','Despicable Me Minion Mayhem'],
    [13005,'名探偵コナン 4-D ライブ・ショー ～星空の宝石（ジュエル）～','Detective Conan 4-D Live Show'],
    [12073,'フライト・オブ・ザ・ヒッポグリフ™','Flight of the Hippogriff'],
    [12072,'ミニオン・ハチャメチャ・アイス','Freeze Ray Sliders'],
    [7065,'ハローキティのカップケーキ・ドリーム','Hello Kitty’s Cupcake Dream'],
    [7063,'ハローキティのリボン・コレクション','Hello Kitty’s Ribbon Collection'],
    [7077,'ハリウッド・ドリーム・ザ・ライド','Hollywood Dream: The Ride'],
    [12070,'ハリウッド・ドリーム・ザ・ライド ～バックドロップ～','Hollywood Dream: The Ride – Backdrop'],
    [14918,'ミニオン・ハチャメチャ・ミッション ～大悪党への道～','Villain-Con Minion Blast'],
    [12068,'ジョーズ','Jaws'],
    [17894,'ジョーズ ～レッド・アラート～','Jaws: Red Alert'],
    [12067,'ジュラシック・パーク・ザ・ライド','Jurassic Park: The Ride'],
    [12197,'オリバンダーの店™','Ollivanders'],
    [12091,'プレイング・ウィズおさるのジョージ™','Playing with Curious George'],
    [12324,'貞子の呪い ～ダーク・ホラー・ライド～','Sadako’s Curse: Dark Horror Ride'],
    [12083,'セサミストリート 4-D ムービーマジック™','Sesame Street 4-D Movie Magic'],
    [12084,'シュレック 4-D アドベンチャー','Shrek 4-D Adventure'],
    [7214,'シング・オン・ツアー','Sing on Tour'],
    [14919,'スヌーピーのフライング・エース・アドベンチャー','Snoopy’s Flying Ace Adventure'],
    [12082,'スペース・ファンタジー・ザ・ライド','Space Fantasy: The Ride'],
    [7092,'ザ・フライング・ダイナソー','The Flying Dinosaur'],
    [12075,'フライング・スヌーピー','The Flying Snoopy'],
    [12071,'ヨッシー・アドベンチャー™','Yoshi’s Adventure'],
    [13925,'チェンソーマン・ザ・カオス 4-D','Chainsaw Man: The Chaos 4-D'],
    [17893,'ファクトリー・オブ・フィアー ～絶望のゾンビ・ツアー～','Factory of Fear: Zombie Tour'],
    [15322,'ジュラシック・パーク・ザ・ライド ～イン・ザ・ダーク～','Jurassic Park: The Ride in the Dark'],
  ];
  function setupPoll() {
    const section=el('section');section.id='en-poll';
    section.innerHTML='<h2>Your No. 1 USJ attraction</h2><p>Select one attraction below. The English Google Form opens with your choice preselected; review it and press Submit there to cast your vote.</p><p class="muted small">One answer per person, please. No name or email address is requested by this form. The results represent voluntary respondents, not all USJ visitors.</p><div class="controls"><label>My favorite attraction<select id="en-poll-choice"><option value="">Choose one attraction</option></select></label><button id="en-poll-open" type="button" class="action">Continue to Google Form ↗</button></div><p id="en-poll-status" class="muted" role="status"></p><h3>Reader results</h3><p id="en-poll-result-status" role="status">Loading votes…</p><ol id="en-poll-bars" class="poll-bars"></ol><p class="muted small">Votes from the English and Japanese forms are combined here and on the Japanese site. Updates may take several minutes. <a href="https://docs.google.com/forms/d/1PLE99NvoUNX8jAG8MBGu-Swh788WYkT2fHB6Y15s9kU/viewanalytics" target="_blank" rel="noopener noreferrer">View English form results ↗</a></p>';
    document.querySelector('main').insertBefore(section,document.querySelector('.follow-x'));
    const select=$('en-poll-choice');
    for (const [id,,english] of POLL_OPTIONS) {
      const option=new Option(english,english);option.dataset.id=id;select.append(option);
    }
    const openForm=el('a','action','Continue to Google Form ↗');
    openForm.id='en-poll-open';openForm.href=POLL_FORM;openForm.target='_blank';openForm.rel='noopener noreferrer';
    $('en-poll-open').replaceWith(openForm);
    openForm.addEventListener('click',event=>{
      const chosen=select.value;
      if (!chosen) { event.preventDefault();$('en-poll-status').textContent='Please choose one attraction first.';select.focus();return; }
      const url=new URL(POLL_FORM);url.searchParams.set('usp','pp_url');url.searchParams.set('hl','en');url.searchParams.set(POLL_FIELD,chosen);
      openForm.href=url.href;
      $('en-poll-status').textContent='Review the preselected choice on Google Forms, then press Submit.';
    });
    sharePanel('vote',section);
    async function results() {
      try {
        const data=await get('/api/poll-results');
        if (!Number.isInteger(data.total)||!Array.isArray(data.results)) throw new Error('invalid results');
        $('en-poll-result-status').textContent=`${data.total} vote${data.total===1?'':'s'}${data.total?'':' · be the first to vote!'}${data.partial?' · one form is temporarily unavailable':''}`;
        const list=$('en-poll-bars');list.replaceChildren();
        const max=Math.max(1,...data.results.map(item=>item.votes));
        for (const item of data.results) {
          if(typeof item.name!=='string'||!Number.isInteger(item.votes)) continue;
          const row=el('li');
          const label=POLL_OPTIONS.find(option=>option[1]===item.name)?.[2]||item.name;
          row.append(el('span',null,`${label} · ${item.votes} vote${item.votes===1?'':'s'}`));
          const track=el('span','poll-track');const bar=el('i');bar.style.width=`${Math.max(0,Math.min(100,item.votes/max*100))}%`;track.append(bar);row.append(track);list.append(row);
        }
      } catch { $('en-poll-result-status').textContent='Results are temporarily unavailable. Please check the Google Forms summary.'; }
    }
    results();setInterval(results,5*60*1000);
  }
  if (page==='vote') setupPoll();

  function addInfoPage(kind,html) {
    const section=el('section');section.id=`en-${kind}`;section.innerHTML=html;
    document.querySelector('main').insertBefore(section,document.querySelector('.follow-x'));
  }
  if (page==='install') addInfoPage('install',`
    <h2>Add this site to your home screen</h2>
    <p>Open the English site directly from your phone. You do not need an account or an app-store download.</p>
    <div class="feature-grid">
      <div class="feature-panel"><h3>iPhone: Safari</h3><ol><li>Open <a href="/en/">the English wait time page</a> in Safari.</li><li>Tap Share.</li><li>Choose “Add to Home Screen.”</li><li>Set the name to “USJ Wait Times Guide,” then tap Add.</li></ol></div>
      <div class="feature-panel"><h3>Android: Chrome</h3><ol><li>Open <a href="/en/">the English wait time page</a> in Chrome.</li><li>Tap the three-dot menu.</li><li>Choose “Add to Home screen” or “Install app,” then confirm.</li></ol></div>
    </div>
    <p class="muted">The exact menu wording varies by browser and phone. On an existing home-screen shortcut, open the page and tap “Refresh wait times” on Today or the map. Wait estimates usually refresh about every five minutes while the page is open.</p>
    <p>No native iPhone widget is provided. A home-screen shortcut opens the web app.</p>
  `);
  if (page==='privacy') {
    addInfoPage('privacy',`
      <h2>About this site and privacy</h2>
      <p><strong>USJ Wait Times Guide</strong> is an independently operated, unofficial information site. It is not affiliated with Universal Studios Japan or its operator.</p>
      <p class="small muted">Last updated: 10 October 2026</p>
      <h3>Park information and sources</h3>
      <p>Standby waits, show starts and published park hours are reformatted from publicly available third-party data. Weather uses observations from the Japan Meteorological Agency’s Osaka station and forecasts near USJ from MET Norway; Osaka observations are not measurements inside the park. Event, closure, pass-exclusion and ticket-price data are manually checked against official pages on the dates shown. Data can be delayed, missing or changed. Please confirm the latest details on the <a href="https://www.usj.co.jp/web/en/us" target="_blank" rel="noopener noreferrer">official USJ site and app</a>.</p>
      <h3>Information handled when you browse</h3>
      <p>The site does not require an account and has no contact form. The server and delivery providers may record your IP address, visit time, requested page and browser information to deliver pages, protect the service and investigate errors.</p>
      <p>Favorite attraction IDs and your display preference are stored in your browser, not sent to the site’s database. Clearing browser site data may remove them.</p>
      <h3>Map, location and external links</h3>
      <p>The map loads OpenFreeMap/OpenStreetMap tiles and MapLibre GL JS from external providers. Attraction and restaurant positions come from ThemeParks.wiki and are approximate. GPS is requested only when you press the location button and grant browser permission. Your coordinates and accuracy are shown on your device and are not sent to this site’s server or database. The walking-directions link opens Google Maps with the selected destination, not your current position.</p>
      <h3>Favorite-attraction poll</h3>
      <p>The English poll uses a separate Google Form. When you submit a vote, Google Forms stores your choice and submission time. The form does not request a name or email address and email collection is turned off. The site’s D1 database does not store poll answers. Public results combine attraction vote totals from the English and Japanese forms, possibly with a delay; individual answers are not displayed. Duplicate responses across the two forms cannot be fully prevented, so the results are not a representative survey of USJ visitors. See <a href="https://policies.google.com/privacy?hl=en" target="_blank" rel="noopener noreferrer">Google’s privacy policy</a>.</p>
      <h3>Analytics, cookies and advertising</h3>
      <p>Cloudflare Web Analytics measures page usage and device types. Google Analytics 4 starts only if you select “Allow analytics” in the consent banner. If you do not allow it, this site does not load the GA4 tag. With consent, page visits and selected actions such as filters, favorites, map and share use may be sent to Google, along with a Google Analytics identifier cookie. Attraction public IDs may be included in action events. GA4 also receives a broad browser category: general visitor or site operator. This category contains no name or device-specific ID. GPS coordinates, accuracy, your name, email and favorite list are not sent to GA4. Your choice is stored in this browser. Declining later stops future GA4 loading by this site but does not erase data or cookies already held by Google. No advertising tag is currently installed.</p>
      <p><button type="button" class="action" id="analytics-settings">Change analytics choice</button></p>
      <h3>Contact and changes</h3>
      <p>For site display or content questions, <a href="https://twitter.com/messages/compose?recipient_id=2108874187519733760" target="_blank" rel="noopener noreferrer">message @uniba_waits_en on X</a>. You need an X account to send a message. If the message screen does not open, visit <a href="https://x.com/uniba_waits_en" target="_blank" rel="noopener noreferrer">our English X profile</a>. Do not send sensitive personal information. Please contact USJ directly about park operations and tickets. This page will be updated if the site’s services or data handling change.</p>
    `);
  }
})();
