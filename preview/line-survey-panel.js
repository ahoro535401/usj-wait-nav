  (() => {
    const byId = id => document.getElementById(`survey-${id}`);
    const status = (message, kind = '') => { byId('status').textContent = message; byId('status').dataset.kind = kind; };
    const fields = ['age','gender','prefecture','frequency','annual-pass','usual-party','information-goal'];
    const experienceInputs = [...document.querySelectorAll('input[name="survey-experience"]')];
    const selectedExperiences = () => experienceInputs.filter(input => input.checked).map(input => input.value);
    function showAnswered(answered) {
      byId('summary').textContent = answered ? '回答済みです。確認・変更する' : '回答内容を入力する';
      document.getElementById('survey').dataset.answered = String(answered);
      byId('details').open = !answered;
    }
    function fill(result) {
      byId('delete').hidden = !result.saved;
      if (!result.saved) return false;
      byId('age').value = result.age_band || ''; byId('gender').value = result.gender || '';
      byId('prefecture').value = result.prefecture || ''; byId('frequency').value = result.visit_frequency || '';
      byId('annual-pass').value = result.annual_pass || '';
      byId('usual-party').value = result.usual_party || '';
      byId('information-goal').value = result.information_goal || '';
      for (const input of experienceInputs) input.checked = result.experience_priorities?.includes(input.value) || false;
      return fields.every(id => byId(id).value) && selectedExperiences().length >= 1 && selectedExperiences().length <= 2;
    }
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
      for (const id of ['save','delete']) byId(id).disabled = true;
      try { await action(); } catch(error) { status(error.message || '処理を完了できません', 'error'); }
      finally { byId('save').disabled = !byId('consent').checked; byId('delete').disabled = false; }
    }
    byId('consent').addEventListener('change', () => { byId('save').disabled = !byId('consent').checked; });
    for (const input of experienceInputs) input.addEventListener('change', () => {
      if (selectedExperiences().length > 2) {
        input.checked = false;
        status('楽しみにしているものは2つまで選べます。', 'error');
      }
    });
    byId('save').addEventListener('click', () => busy(async () => {
      if (!byId('consent').checked) return;
      const missing = fields.find(id => !byId(id).value);
      if (missing) { byId(missing).focus(); status('8項目すべてに回答してください。','error'); return; }
      const experiences = selectedExperiences();
      if (!experiences.length || experiences.length > 2) {
        experienceInputs[0].focus(); status('楽しみにしているものを1～2つ選んでください。','error'); return;
      }
      const answer = {consent:true,age_band:byId('age').value,gender:byId('gender').value,
        prefecture:byId('prefecture').value,visit_frequency:byId('frequency').value,
        annual_pass:byId('annual-pass').value,usual_party:byId('usual-party').value,
        experience_priorities:experiences,information_goal:byId('information-goal').value};
      const result = await call('PUT', answer);
      byId('delete').hidden = !result.saved;
      showAnswered(Boolean(result.saved));
      status('アンケートを保存しました。変更・削除はいつでもできます。','success');
    }));
    byId('delete').addEventListener('click', () => busy(async () => {
      if (!confirm('保存したアンケート回答を削除しますか？')) return;
      await call('DELETE');
      for (const id of fields) byId(id).value = '';
      for (const input of experienceInputs) input.checked = false;
      byId('consent').checked = false; byId('delete').hidden = true;
      showAnswered(false);
      status('アンケート回答を削除しました。','success');
    }));
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const result = await call('GET');
        const complete = fill(result);
        showAnswered(Boolean(result.saved && complete));
        if (result.saved && !complete) status('未選択の項目を選び、改めて保存してください。');
      } catch(error) {
        showAnswered(false);
        status(error.message || '回答状況を確認できません', 'error');
      }
    });
  })();
