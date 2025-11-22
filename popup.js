// ポップアップの処理

document.addEventListener('DOMContentLoaded', async () => {
  const status = document.getElementById('status');
  const quickPost = document.getElementById('quickPost');
  const postText = document.getElementById('postText');
  const visibility = document.getElementById('visibility');
  const postButton = document.getElementById('postButton');
  const settingsButton = document.getElementById('settingsButton');

  // 設定を取得
  const settings = await chrome.storage.local.get(['instanceUrl', 'accessToken', 'visibility', 'defaultTags']);

  if (!settings.accessToken || !settings.instanceUrl) {
    status.innerHTML = '<p class="warning">⚠️ 認証が必要です</p><p>設定ボタンから認証を行ってください。</p>';
  } else {
    status.innerHTML = `<p class="success">✓ 認証済み: ${settings.instanceUrl}</p>`;
    quickPost.style.display = 'block';
    
    // デフォルトの可視性を設定
    if (settings.visibility) {
      visibility.value = settings.visibility;
    }

    // 選択されたテキストを取得
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
      if (response && response.text) {
        postText.value = response.text;
        if (settings.defaultTags) {
          postText.value += '\n\n' + settings.defaultTags;
        }
      } else if (settings.defaultTags) {
        postText.value = settings.defaultTags;
      }
    } catch (error) {
      // エラーは無視（コンテンツスクリプトが読み込まれていない場合）
    }
  }

  // 投稿ボタン
  postButton.addEventListener('click', async () => {
    const text = postText.value.trim();
    if (!text) {
      alert('投稿内容を入力してください');
      return;
    }

    postButton.disabled = true;
    postButton.textContent = '投稿中...';

    try {
      const response = await fetch(`${settings.instanceUrl}/api/notes/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          i: settings.accessToken,
          text: text,
          visibility: visibility.value
        })
      });

      if (!response.ok) {
        throw new Error('投稿に失敗しました');
      }

      postText.value = '';
      status.innerHTML = '<p class="success">✓ 投稿しました！</p>';
      
      // 3秒後にポップアップを閉じる
      setTimeout(() => {
        window.close();
      }, 1500);
    } catch (error) {
      console.error('Post failed:', error);
      alert('投稿に失敗しました');
    } finally {
      postButton.disabled = false;
      postButton.textContent = '投稿';
    }
  });

  // 設定ボタン
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
