  (() => {
    const byId = id => document.getElementById(`survey-${id}`);
    const status = (message, kind = '') => { byId('status').textContent = message; byId('status').dataset.kind = kind; };
    async function call(method, body) {
      if (!window.usjLiffReady) throw Error('LINEアプリから開いてください');
      await window.usjLiffReady;
      if (!window.liff?.isLoggedIn()) throw Error('LINEでログインして開いてください');
      const token = window.liff.getIDToken();
      if (!token) throw Error('LINEの認証を確認できません。開き直してください');
      const response = await fetch('/api/line-survey', { method, cache:'no-store', credentials:'omit',
        headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},
        ...(body?{body:JSON.stringify(body)}:{}) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(result.error || '処理を完了できません');
      return result;
    }
    async function busy(action) {
      for (const id of ['save','load','delete']) byId(id).disabled = true;
      try { await action(); } catch(error) { status(error.message || '処理を完了できません', 'error'); }
      finally { byId('save').disabled = !byId('consent').checked; byId('load').disabled = false; byId('delete').disabled = false; }
    }
    byId('consent').addEventListener('change', () => { byId('save').disabled = !byId('consent').checked; });
    byId('save').addEventListener('click', () => busy(async () => {
      if (!byId('consent').checked) return;
      const fields = ['age','gender','prefecture','frequency','annual-pass'];
      const missing = fields.find(id => !byId(id).value);
      if (missing) { byId(missing).focus(); status('5項目すべてを選択してください。','error'); return; }
      const answer = {consent:true,age_band:byId('age').value,gender:byId('gender').value,
        prefecture:byId('prefecture').value,visit_frequency:byId('frequency').value,
        annual_pass:byId('annual-pass').value};
      const result = await call('PUT', answer);
      byId('delete').hidden = !result.saved;
      status('アンケートを保存しました。変更・削除はいつでもできます。','success');
    }));
    byId('load').addEventListener('click', () => busy(async () => {
      const result = await call('GET');
      byId('delete').hidden = !result.saved;
      if (result.saved) {
        byId('age').value = result.age_band || ''; byId('gender').value = result.gender || '';
        byId('prefecture').value = result.prefecture || ''; byId('frequency').value = result.visit_frequency || '';
        byId('annual-pass').value = result.annual_pass || '';
      }
      const complete = ['age','gender','prefecture','frequency','annual-pass'].every(id => byId(id).value);
      status(result.saved ? complete ? '保存済みの回答を表示しました。' :
        '以前の回答を表示しました。未選択の項目を選び、改めて保存してください。' :
        '保存済みの回答はありません。', result.saved && complete ? 'success' : '');
    }));
    byId('delete').addEventListener('click', () => busy(async () => {
      if (!confirm('保存したアンケート回答を削除しますか？')) return;
      await call('DELETE');
      for (const id of ['age','gender','prefecture','frequency','annual-pass']) byId(id).value = '';
      byId('consent').checked = false; byId('delete').hidden = true;
      status('アンケート回答を削除しました。','success');
    }));
    if (location.pathname.replace(/\/$/, '').endsWith('/survey')) {
      document.addEventListener('DOMContentLoaded', () => document.getElementById('survey').scrollIntoView({block:'start'}));
    }
  })();
