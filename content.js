// コンテンツスクリプト - ページ内の選択を処理

// 選択されたテキストを取得
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelection') {
    const selection = window.getSelection();
    sendResponse({ text: selection.toString() });
  }
});

// 右クリック時の画像情報を保存
document.addEventListener('contextmenu', (e) => {
  if (e.target.tagName === 'IMG') {
    // 画像の情報を保存（backgroundスクリプトで使用）
    chrome.storage.session.set({ lastImageUrl: e.target.src });
  }
}, true);
