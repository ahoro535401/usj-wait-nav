(() => {
  const FAVORITES_KEY = 'usj-wait-nav-favorites-v1';
  const VISIT_DAY_KEY = 'usj-wait-nav-visit-day-v1';
  const byId = id => document.getElementById(id);
  const names = new Map();
  let savedPlan = null;

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
      item.textContent = names.get(id) || `施設ID ${id}`;
      target.append(item);
    }
  }
  function renderLocal() {
    const favorites = localFavorites();
    byId('local-count').textContent = `${favorites.length}施設`;
    showList(byId('local-favorites'), favorites);
  }
  function renderSaved() {
    byId('saved-plan').hidden = !savedPlan?.saved;
    if (!savedPlan?.saved) return;
    const date = savedPlan.visit_day ? `${savedPlan.visit_day.replaceAll('-', '/')} 来園予定` : '来園予定日なし';
    byId('saved-summary').textContent = `${date}・お気に入り${savedPlan.favorites.length}施設`;
    showList(byId('saved-favorites'), savedPlan.favorites);
  }
  function status(message, kind = '') {
    byId('status').textContent = message;
    byId('status').dataset.kind = kind;
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
    for (const id of ['save', 'load', 'apply', 'delete']) byId(id).disabled = true;
    try { await action(); }
    catch (error) { status(error.message || '操作を完了できません', 'error'); }
    finally {
      byId('save').disabled = !byId('consent').checked;
      for (const id of ['load', 'apply', 'delete']) byId(id).disabled = false;
    }
  }

  byId('consent').addEventListener('change', () => {
    byId('save').disabled = !byId('consent').checked;
  });
  byId('visit-day').addEventListener('change', () => {
    try { localStorage.setItem(VISIT_DAY_KEY, byId('visit-day').value); } catch (_) {}
  });
  byId('save').addEventListener('click', () => withBusy(async () => {
    if (!byId('consent').checked) return;
    savedPlan = await api('PUT', { consent: true, favorites: localFavorites(), visit_day: byId('visit-day').value || null });
    renderSaved();
    status('LINEに保存しました。別の端末では「保存済みを確認する」から読み込めます。', 'success');
  }));
  byId('load').addEventListener('click', () => withBusy(async () => {
    savedPlan = await api('GET');
    renderSaved();
    status(savedPlan.saved ? '保存済みのプランを読み込みました。' : 'LINE上に保存したプランはありません。',
      savedPlan.saved ? 'success' : '');
  }));
  byId('apply').addEventListener('click', () => {
    if (!savedPlan?.saved) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedPlan.favorites));
      localStorage.setItem(VISIT_DAY_KEY, savedPlan.visit_day || '');
      byId('visit-day').value = savedPlan.visit_day || '';
      renderLocal();
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
  renderLocal();
  fetch('/api/waits', { cache: 'no-store' }).then(response => response.ok ? response.json() : null)
    .then(data => {
      for (const ride of data?.rides || []) {
        if (Number.isInteger(Number(ride.id))) names.set(Number(ride.id), ride.name);
      }
      renderLocal();
      renderSaved();
    }).catch(() => {});
})();
