(() => {
  const FAVORITES_KEY = 'usj-wait-nav-favorites-v1';
  const VISIT_DAY_KEY = 'usj-wait-nav-visit-day-v1';
  const byId = id => document.getElementById(id);
  // Keep this list aligned with japaneseNames in index.html (checked at build time).
  const names = new Map([
    [12066, 'ミニオン・ハチャメチャ・ライド'],
    [13005, '名探偵コナン 4-D ライブ・ショー ～星空の宝石（ジュエル）～'],
    [12073, 'フライト・オブ・ザ・ヒッポグリフ™'],
    [12072, 'ミニオン・ハチャメチャ・アイス'],
    [12065, 'ハリー・ポッター・アンド・ザ・フォービドゥン・ジャーニー™'],
    [7065, 'ハローキティのカップケーキ・ドリーム'],
    [7063, 'ハローキティのリボン・コレクション'],
    [7077, 'ハリウッド・ドリーム・ザ・ライド'],
    [12070, 'ハリウッド・ドリーム・ザ・ライド ～バックドロップ～'],
    [14918, 'ミニオン・ハチャメチャ・ミッション ～大悪党への道～'],
    [12068, 'ジョーズ'],
    [17894, 'ジョーズ ～レッド・アラート～'],
    [12067, 'ジュラシック・パーク・ザ・ライド'],
    [12061, 'マリオカート ～クッパの挑戦状～™'],
    [14402, 'ドンキーコングのクレイジー・トロッコ™'],
    [12197, 'オリバンダーの店™'],
    [12091, 'プレイング・ウィズおさるのジョージ™'],
    [12324, '貞子の呪い ～ダーク・ホラー・ライド～'],
    [12083, 'セサミストリート 4-D ムービーマジック™'],
    [12084, 'シュレック 4-D アドベンチャー'],
    [7214, 'シング・オン・ツアー'],
    [14919, 'スヌーピーのフライング・エース・アドベンチャー'],
    [12082, 'スペース・ファンタジー・ザ・ライド'],
    [7092, 'ザ・フライング・ダイナソー'],
    [12075, 'フライング・スヌーピー'],
    [12071, 'ヨッシー・アドベンチャー™'],
    [13925, 'チェンソーマン・ザ・カオス 4-D'],
    [17893, 'ファクトリー・オブ・フィアー ～絶望のゾンビ・ツアー～'],
    [15322, 'ジュラシック・パーク・ザ・ライド ～イン・ザ・ダーク～'],
  ]);
  let savedPlan = null;
  let currentRides = null;
  let fetchedAt = null;
  let pendingImport = [];

  function readWebFavorites() {
    const raw = new URLSearchParams(location.hash.slice(1)).get('favorites');
    if (!raw || !/^[1-9]\d{0,7}(?:,[1-9]\d{0,7}){0,39}$/.test(raw)) return [];
    return [...new Set(raw.split(',').map(Number))];
  }

  function showWebFavoritesImport() {
    byId('web-favorites-import').hidden = !pendingImport.length;
    if (pendingImport.length) byId('import-summary').textContent =
      `${pendingImport.length}施設を受け取りました。現在の登録を残したまま追加できます。`;
  }

  function localFavorites() {
    try {
      const list = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      return Array.isArray(list) ? [...new Set(list.map(Number).filter(id =>
        Number.isInteger(id) && id > 0 && id <= 99999999))].slice(0, 40) : [];
    } catch (_) { return []; }
  }
  function showList(target, favorites) {
    target.replaceChildren();
    if (!favorites.length) {
      const item = document.createElement('li');
      item.textContent = 'まだ選んでいません';
      target.append(item);
      return;
    }
    for (const id of favorites) {
      const item = document.createElement('li');
      const ride = currentRides?.get(id);
      const label = names.get(id) || `施設ID ${id}`;
      const link = document.createElement('a');
      link.href = `/liff/r/${id}`;
      link.textContent = label;
      item.append(link);
      const badge = document.createElement('span');
      const state = waitState(ride);
      badge.className = 'wait-badge';
      badge.dataset.state = state.kind;
      badge.textContent = state.label;
      item.append(badge);
      target.append(item);
    }
  }
  function waitState(ride) {
    if (!currentRides || !Number.isFinite(Date.parse(fetchedAt)) ||
        Date.now() - Date.parse(fetchedAt) > 15 * 60 * 1000) {
      return { kind: 'unknown', label: '更新待ち' };
    }
    if (!ride) return { kind: 'unknown', label: '現在の掲載なし' };
    if (ride.data_unavailable) return { kind: 'unknown', label: '未取得' };
    const sourceTime = Date.parse(ride.source === 'ThemeParks.wiki' ? ride.verified_at : ride.last_updated);
    const sourceAge = Date.now() - sourceTime;
    if (!Number.isFinite(sourceTime) || sourceAge < -2 * 60 * 1000 || sourceAge > 15 * 60 * 1000)
      return { kind: 'unknown', label: '更新待ち' };
    if (!ride.is_open) return { kind: 'closed', label: '現在運行なし' };
    const wait = Number(ride.wait_time);
    if (!Number.isInteger(wait) || wait < 0 || wait > 9999)
      return { kind: 'unknown', label: '待ち時間を確認できません' };
    return { kind: 'open', label: `${wait}分` };
  }
  function renderFavorites() {
    const local = localFavorites();
    const saved = savedPlan?.saved ? savedPlan.favorites : [];
    const favorites = local.length ? local : saved;
    byId('favorites-source').textContent = local.length
      ? `この端末のお気に入り：${local.length}施設`
      : saved.length ? `LINEに保存したお気に入り：${saved.length}施設（この端末には未反映）`
        : 'お気に入りはまだ選んでいません。';
    showList(byId('favorites'), favorites);
  }
  function renderSaved() {
    byId('saved-plan').hidden = !savedPlan?.saved;
    if (savedPlan?.saved) {
      const date = savedPlan.visit_day ? `${savedPlan.visit_day.replaceAll('-', '/')} 来園予定` : '来園予定日なし';
      byId('saved-summary').textContent = `${date}・お気に入り${savedPlan.favorites.length}施設を保存中`;
    }
    renderFavorites();
  }
  function status(message, kind = '') {
    byId('status').textContent = message;
    byId('status').dataset.kind = kind;
  }
  async function refreshWaits() {
    const button = byId('refresh-waits');
    button.disabled = true;
    byId('waits-status').textContent = '待ち時間を更新中です。';
    try {
      const response = await fetch('/api/waits', { cache: 'no-store' });
      if (!response.ok) throw new Error('待ち時間を取得できません');
      const data = await response.json();
      if (!Array.isArray(data.rides)) throw new Error('待ち時間を確認できません');
      currentRides = new Map(data.rides.map(ride => [Number(ride.id), ride]));
      fetchedAt = data.fetched_at;
      for (const ride of data.rides) {
        if (Number.isInteger(Number(ride.id)) && !names.has(Number(ride.id)))
          names.set(Number(ride.id), ride.name);
      }
      const age = Date.now() - Date.parse(fetchedAt);
      if (!Number.isFinite(age) || age > 15 * 60 * 1000 || age < -2 * 60 * 1000) {
        currentRides = null;
        byId('waits-status').textContent = '新しい待ち時間を確認できません。しばらくしてから更新してください。';
      } else {
        const time = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo',
          hour: '2-digit', minute: '2-digit' }).format(new Date(fetchedAt));
        byId('waits-status').textContent = `${time}取得の情報です。${data.refresh_error ? '直近の更新に問題があります。' : ''}`;
      }
    } catch (_) {
      currentRides = null;
      byId('waits-status').textContent = '待ち時間を取得できません。しばらくしてから更新してください。';
    } finally {
      renderSaved();
      button.disabled = false;
    }
  }
  async function idToken() {
    if (!window.usjLiffReady) throw new Error('LINE内のマイプラン画面から開いてください');
    await window.usjLiffReady;
    if (!window.liff?.isLoggedIn()) throw new Error('LINEでログインして開いてください');
    const token = window.liff.getIDToken();
    if (!token) throw new Error('LINEの認証を確認できません。画面を開き直してください');
    return token;
  }
  async function api(method, body) {
    const token = await idToken();
    const response = await fetch('/api/line-plan', {
      method, cache: 'no-store', credentials: 'omit',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'マイプランを確認できません');
    return result;
  }
  async function withBusy(action) {
    for (const id of ['save', 'apply', 'delete']) byId(id).disabled = true;
    try { await action(); }
    catch (error) { status(error.message || '操作を完了できません', 'error'); }
    finally {
      byId('save').disabled = !byId('consent').checked;
      for (const id of ['apply', 'delete']) byId(id).disabled = false;
    }
  }

  byId('consent').addEventListener('change', () => {
    byId('save').disabled = !byId('consent').checked;
  });
  byId('import-favorites').addEventListener('click', () => {
    const merged = [...new Set([...(savedPlan?.favorites || []), ...localFavorites(), ...pendingImport])];
    if (merged.length > 40) {
      status('合計40施設を超えます。LINE内の待ち時間ページでお気に入りを整理してください。', 'error');
      return;
    }
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged));
      pendingImport = [];
      showWebFavoritesImport();
      history.replaceState(null, '', location.pathname + location.search);
      renderFavorites();
      status('この端末に取り込みました。内容を確認し、同意して「LINEに保存する」を押してください。', 'success');
    } catch (_) { status('この端末に保存できませんでした', 'error'); }
  });
  byId('visit-day').addEventListener('change', () => {
    try { localStorage.setItem(VISIT_DAY_KEY, byId('visit-day').value); } catch (_) {}
  });
  byId('save').addEventListener('click', () => withBusy(async () => {
    if (!byId('consent').checked) return;
    const local = localFavorites();
    savedPlan = await api('PUT', { consent: true, favorites: local.length ? local : savedPlan?.favorites || [], visit_day: byId('visit-day').value || null });
    renderSaved();
    status('LINEに保存しました。別の端末でマイプランを開くと読み込まれます。', 'success');
  }));
  byId('apply').addEventListener('click', () => {
    if (!savedPlan?.saved) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedPlan.favorites));
      localStorage.setItem(VISIT_DAY_KEY, savedPlan.visit_day || '');
      byId('visit-day').value = savedPlan.visit_day || '';
      renderFavorites();
      status('この端末に反映しました。待ち時間ページでもお気に入りを確認できます。', 'success');
    } catch (_) { status('この端末に保存できませんでした', 'error'); }
  });
  byId('delete').addEventListener('click', () => withBusy(async () => {
    if (!confirm('LINE上に保存したマイプランを削除しますか？ この端末のお気に入りは残ります。')) return;
    await api('DELETE');
    savedPlan = null;
    renderSaved();
    byId('consent').checked = false;
    status('LINE上の保存データを削除しました。', 'success');
  }));

  try { byId('visit-day').value = localStorage.getItem(VISIT_DAY_KEY) || ''; } catch (_) {}
  renderFavorites();
  byId('refresh-waits').addEventListener('click', refreshWaits);
  refreshWaits();
  if (window.usjLiffReady) withBusy(async () => {
    await window.usjLiffReady;
    pendingImport = readWebFavorites();
    savedPlan = await api('GET');
    renderSaved();
    showWebFavoritesImport();
    if (pendingImport.length) status('Webサイトのお気に入りを確認し、この端末に取り込んでください。');
    else if (savedPlan.saved) status('LINEに保存したプランを読み込みました。', 'success');
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' &&
        (!fetchedAt || Date.now() - Date.parse(fetchedAt) >= 5 * 60 * 1000)) refreshWaits();
  });
  setInterval(() => {
    if (document.visibilityState === 'visible' &&
        (localFavorites().length || savedPlan?.favorites?.length)) refreshWaits();
  }, 5 * 60 * 1000);
})();
