// 設定画面の処理

const instanceUrlInput = document.getElementById('instanceUrl');
const visibilitySelect = document.getElementById('visibility');
const defaultTagsInput = document.getElementById('defaultTags');
const authenticateButton = document.getElementById('authenticateButton');
const revokeButton = document.getElementById('revokeButton');
const saveButton = document.getElementById('saveButton');
const statusDiv = document.getElementById('status');
const authStatusDiv = document.getElementById('authStatus');

// 設定を読み込み
async function loadSettings() {
  const settings = await chrome.storage.local.get([
    'instanceUrl',
    'accessToken',
    'visibility',
    'defaultTags'
  ]);

  if (settings.instanceUrl) {
    instanceUrlInput.value = settings.instanceUrl;
  }

  if (settings.visibility) {
    visibilitySelect.value = settings.visibility;
  }

  if (settings.defaultTags) {
    defaultTagsInput.value = settings.defaultTags;
  }

  updateAuthStatus(settings.accessToken, settings.instanceUrl);
}

// 認証状態を更新
function updateAuthStatus(token, instance) {
  if (token && instance) {
    authStatusDiv.innerHTML = `<p class="success">✓ 認証済み: ${instance}</p>`;
    revokeButton.style.display = 'inline-block';
    statusDiv.innerHTML = '<p class="success">設定が読み込まれました</p>';
  } else {
    authStatusDiv.innerHTML = '<p class="warning">⚠️ 未認証</p>';
    revokeButton.style.display = 'none';
    statusDiv.innerHTML = '<p class="info">MIAuthで認証してください</p>';
  }
}

// MIAuth認証
authenticateButton.addEventListener('click', async () => {
  const instanceUrl = instanceUrlInput.value.trim().replace(/\/$/, '');
  
  if (!instanceUrl) {
    alert('インスタンスURLを入力してください');
    return;
  }

  // URLの検証
  try {
    new URL(instanceUrl);
  } catch (error) {
    alert('有効なURLを入力してください');
    return;
  }

  // セッションIDを生成
  const sessionId = generateSessionId();
  const name = 'Misskey Quick Share';
  const permission = 'write:notes,write:drive';

  // MIAuth URLを生成
  const miauthUrl = `${instanceUrl}/miauth/${sessionId}?name=${encodeURIComponent(name)}&permission=${encodeURIComponent(permission)}`;

  // 新しいタブで認証ページを開く
  const authTab = await chrome.tabs.create({ url: miauthUrl });

  // 認証完了を待つ
  statusDiv.innerHTML = '<p class="info">認証ページが開きました。Misskeyで認証を許可してください...</p>';

  // セッションIDとインスタンスURLを一時保存
  await chrome.storage.local.set({
    pendingSessionId: sessionId,
    pendingInstanceUrl: instanceUrl
  });

  // ポーリングで認証完了を確認
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${instanceUrl}/api/miauth/${sessionId}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.token) {
          // 認証成功
          clearInterval(pollInterval);
          
          await chrome.storage.local.set({
            accessToken: data.token,
            instanceUrl: instanceUrl
          });

          // 一時データを削除
          await chrome.storage.local.remove(['pendingSessionId', 'pendingInstanceUrl']);

          // 認証タブを閉じる
          chrome.tabs.remove(authTab.id);

          statusDiv.innerHTML = '<p class="success">✓ 認証に成功しました！</p>';
          updateAuthStatus(data.token, instanceUrl);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }, 2000);

  // 3分後にポーリングを停止
  setTimeout(() => {
    clearInterval(pollInterval);
    statusDiv.innerHTML = '<p class="warning">認証がタイムアウトしました。もう一度お試しください。</p>';
  }, 180000);
});

// 認証解除
revokeButton.addEventListener('click', async () => {
  if (confirm('認証を解除しますか？')) {
    await chrome.storage.local.remove(['accessToken', 'instanceUrl']);
    updateAuthStatus(null, null);
    statusDiv.innerHTML = '<p class="success">認証を解除しました</p>';
  }
});

// 設定を保存
saveButton.addEventListener('click', async () => {
  const instanceUrl = instanceUrlInput.value.trim().replace(/\/$/, '');
  const visibility = visibilitySelect.value;
  const defaultTags = defaultTagsInput.value.trim();

  await chrome.storage.local.set({
    visibility: visibility,
    defaultTags: defaultTags
  });

  // インスタンスURLも保存（認証済みの場合のみ更新）
  const settings = await chrome.storage.local.get(['accessToken']);
  if (!settings.accessToken && instanceUrl) {
    await chrome.storage.local.set({ instanceUrl: instanceUrl });
  }

  statusDiv.innerHTML = '<p class="success">✓ 設定を保存しました</p>';
  
  setTimeout(() => {
    statusDiv.innerHTML = '';
  }, 3000);
});

// セッションID生成
function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 初期化
loadSettings();
