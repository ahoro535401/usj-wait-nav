(() => {
  'use strict';

  const measurementId = 'G-9DC2RDYPXX';
  const storageKey = 'usj-wait-nav:analytics-consent';
  const english = document.documentElement.lang === 'en';
  let started = false;
  // Only named product actions and non-personal, bounded values may leave the browser.
  const events = new Set([
    'favorite_add', 'favorite_remove', 'ride_detail_open', 'view_mode_change',
    'filter_apply', 'archive_past_select', 'archive_future_select',
    'map_place_open', 'map_location_request', 'map_location_success',
    'map_location_failure', 'walking_route_open', 'share_click'
  ]);
  const values = {
    view_mode: new Set(['today_cards', 'today_heatmap', 'archive_chart', 'archive_table',
      'show_list', 'show_timeline', 'map_geo', 'map_illustration']),
    filter_type: new Set(['height', 'child_switch', 'favorites', 'tag', 'sort', 'restaurants']),
    place_type: new Set(['ride', 'restaurant']),
    share_channel: new Set(['line', 'x', 'threads', 'other', 'copy']),
    content_type: new Set(['top_waits', 'ride', 'archive_day', 'map_ride', 'poll', 'site'])
  };

  function readChoice() {
    try { return localStorage.getItem(storageKey); } catch (_) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(storageKey, value); } catch (_) { /* Consent lasts for this page only. */ }
  }

  function startAnalytics() {
    if (started || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  window.trackSiteEvent = (name, parameters = {}) => {
    if (!started || readChoice() !== 'granted' || !events.has(name)) return;
    const safe = {};
    if (/^[1-9]\d{0,7}$/.test(String(parameters.ride_id ?? '')))
      safe.ride_id = String(parameters.ride_id);
    for (const [key, choices] of Object.entries(values)) {
      if (choices.has(parameters[key])) safe[key] = parameters[key];
    }
    window.gtag('event', name, safe);
  };

  function removeBanner() {
    document.getElementById('analytics-consent')?.remove();
  }

  function showBanner() {
    if (document.getElementById('analytics-consent')) return;
    const style = document.createElement('style');
    style.textContent = `
      #analytics-consent{position:fixed;bottom:12px;left:12px;right:12px;z-index:10000;max-width:620px;margin:auto;padding:14px 16px;border:1px solid #91a9c3;border-radius:12px;background:#f8fbff;color:#172b40;box-shadow:0 6px 28px #0b1c3260;font:15px/1.5 system-ui,sans-serif}
      #analytics-consent p{margin:0 0 10px}#analytics-consent a{color:#1058a7;text-decoration:underline}
      #analytics-consent .actions{display:flex;gap:8px;flex-wrap:wrap}#analytics-consent button{min-height:44px;padding:8px 15px;border-radius:8px;font:inherit;font-weight:700;cursor:pointer}
      #analytics-consent .allow{border:1px solid #1058a7;background:#1058a7;color:#fff}#analytics-consent .deny{border:1px solid #8ba6c1;background:#fff;color:#173b62}
    `;
    document.head.appendChild(style);
    const banner = document.createElement('div');
    banner.id = 'analytics-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', english ? 'Analytics preference' : 'アクセス解析の設定');
    banner.innerHTML = english
      ? '<p>Help improve this unofficial site with Google Analytics. Google tracking starts only if you allow it. <a href="/privacy">Privacy policy (Japanese)</a></p><div class="actions"><button type="button" class="allow">Allow analytics</button><button type="button" class="deny">Do not allow</button></div>'
      : '<p>サイト改善のためGoogle アナリティクスを使用します。許可するまでGoogleへの解析通信は行いません。<a href="/privacy">詳しく見る</a></p><div class="actions"><button type="button" class="allow">解析を許可</button><button type="button" class="deny">許可しない</button></div>';
    banner.querySelector('.allow').addEventListener('click', () => {
      saveChoice('granted');
      removeBanner();
      startAnalytics();
    });
    banner.querySelector('.deny').addEventListener('click', () => {
      saveChoice('denied');
      removeBanner();
      if (started) window.location.reload();
    });
    document.body.appendChild(banner);
  }

  window.openAnalyticsSettings = showBanner;
  function initialize() {
    if (readChoice() === 'granted') startAnalytics();
    else if (readChoice() !== 'denied') showBanner();
    document.getElementById('analytics-settings')?.addEventListener('click', showBanner);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
