// コンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  // テキスト選択時のメニュー
  chrome.contextMenus.create({
    id: 'shareTextToMisskey',
    title: 'Misskeyに投稿',
    contexts: ['selection']
  });

  // 画像選択時のメニュー
  chrome.contextMenus.create({
    id: 'shareImageToMisskey',
    title: 'Misskeyに投稿',
    contexts: ['image']
  });
});

// コンテキストメニューのクリック処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'shareTextToMisskey') {
    await handleTextShare(info, tab);
  } else if (info.menuItemId === 'shareImageToMisskey') {
    await handleImageShare(info, tab);
  }
});

// テキスト投稿処理
async function handleTextShare(info, tab) {
  const selectedText = info.selectionText;
  
  // 設定を取得
  const settings = await chrome.storage.local.get(['instanceUrl', 'accessToken', 'visibility', 'defaultTags']);
  
  if (!settings.accessToken || !settings.instanceUrl) {
    // 認証が必要
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    return;
  }

  // 投稿内容を作成
  let text = selectedText;
  if (settings.defaultTags) {
    text += '\n\n' + settings.defaultTags;
  }

  await postToMisskey(settings.instanceUrl, settings.accessToken, text, null, settings.visibility || 'public');
}

// 画像投稿処理
async function handleImageShare(info, tab) {
  const imageUrl = info.srcUrl;
  
  // 設定を取得
  const settings = await chrome.storage.local.get(['instanceUrl', 'accessToken', 'visibility', 'defaultTags']);
  
  if (!settings.accessToken || !settings.instanceUrl) {
    // 認証が必要
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    return;
  }

  try {
    // 画像をダウンロード
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // 画像をアップロード
    const fileId = await uploadFile(settings.instanceUrl, settings.accessToken, blob);
    
    // 投稿内容を作成
    let text = '';
    if (settings.defaultTags) {
      text = settings.defaultTags;
    }

    await postToMisskey(settings.instanceUrl, settings.accessToken, text, [fileId], settings.visibility || 'public');
  } catch (error) {
    console.error('Image upload failed:', error);
    showNotification('画像のアップロードに失敗しました');
  }
}

// ファイルアップロード
async function uploadFile(instanceUrl, accessToken, blob) {
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('i', accessToken);

  const response = await fetch(`${instanceUrl}/api/drive/files/create`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  const data = await response.json();
  return data.id;
}

// Misskeyに投稿
async function postToMisskey(instanceUrl, accessToken, text, fileIds, visibility) {
  const payload = {
    i: accessToken,
    text: text,
    visibility: visibility
  };

  if (fileIds && fileIds.length > 0) {
    payload.fileIds = fileIds;
  }

  try {
    const response = await fetch(`${instanceUrl}/api/notes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Post failed');
    }

    showNotification('Misskeyに投稿しました！');
  } catch (error) {
    console.error('Post failed:', error);
    showNotification('投稿に失敗しました');
  }
}

// 通知を表示
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'Misskey Quick Share',
    message: message
  });
}

// メッセージリスナー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    // コンテンツスクリプトからの選択テキスト取得要求
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, (response) => {
        sendResponse(response);
      });
    });
    return true;
  }
});
