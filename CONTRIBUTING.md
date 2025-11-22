# 貢献ガイド

Misskey Quick Shareへの貢献を検討いただきありがとうございます！

## 貢献方法

### バグ報告

バグを発見した場合は、[Issues](https://github.com/yunfie-twitter/misskey-quick-share/issues)で報告してください。

報告には以下の情報を含めてください：

- 問題の説明
- 再現手順
- 期待される動作
- 実際の動作
- スクリーンショット（あれば）
- ブラウザバージョン
- OS

### 機能リクエスト

新しい機能の提案も[Issues](https://github.com/yunfie-twitter/misskey-quick-share/issues)で受け付けています。

提案には以下の情報を含めてください：

- 機能の説明
- 使用ケース
- 期待される動作
- モックアップ（あれば）

### プルリクエスト

プルリクエストは歓迎です！以下の手順で送ってください：

1. このリポジトリをフォーク
2. 新しいブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

#### コードスタイル

- JavaScriptの標準的なコーディングスタイルに従う
- インデントは2スペース
- セミコロンを使用
- コメントは日本語または英語
- ファイルの最後に空行を追加

#### コミットメッセージ

コミットメッセージは以下の形式で：

```
[type] 簡潔な説明

詳細な説明（任意）
```

**typeの例:**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントの変更
- `style`: コードスタイルの変更（機能に影響なし）
- `refactor`: リファクタリング
- `test`: テストの追加または修正
- `chore`: ビルドプロセスや補助ツールの変更

### テスト

変更を送る前に、以下を確認してください：

1. Chromeで拡張機能を読み込んで動作すること
2. MIAuth認証が正常に動作すること
3. テキスト投稿が正常に動作すること
4. 画像投稿が正常に動作すること
5. 設定画面が正常に動作すること

## 開発環境のセットアップ

### 必要なもの

- Google ChromeまたはChromiumベースのブラウザ
- テキストエディタ（VS Code、Sublime Textなど）
- Git

### 開発モードでのインストール

1. リポジトリをクローン
```bash
git clone https://github.com/yunfie-twitter/misskey-quick-share.git
cd misskey-quick-share
```

2. Chromeで `chrome://extensions/` を開く

3. 右上の「デベロッパーモード」を有効化

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. クローンしたディレクトリを選択

6. コードを変更した後、拡張機能ページで「更新」ボタンをクリック

## プロジェクト構造

```
misskey-quick-share/
├── manifest.json          # 拡張機能のメタデータ
├── background.js          # バックグラウンドスクリプト
├── content.js             # コンテンツスクリプト
├── popup.html             # ポップアップUI
├── popup.js               # ポップアップロジック
├── settings.html          # 設定画面UI
├── settings.js            # 設定画面ロジック
├── styles.css             # 共通スタイル
├── icons/                 # アイコンディレクトリ
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              # プロジェクト説明
├── CONTRIBUTING.md        # 貢献ガイド
└── LICENSE                # ライセンス
```

## 主要なファイルの説明

### manifest.json
拡張機能の設定、権限、エントリーポイントを定義。

### background.js
- コンテキストメニューの作成
- テキスト/画像投稿処理
- Misskey APIとの通信
- 通知表示

### content.js
ページ内の選択テキストや画像情報を取得。

### popup.html & popup.js
拡張機能アイコンをクリックした時のポップアップUIとロジック。

### settings.html & settings.js
- MIAuth認証フロー
- 設定管理（可視性、タグなど）
- アクセストークン管理

### styles.css
全体のスタイリング、ダークモード対応。

## コミュニティ

質問や提案があれば、お気軽に[Issues](https://github.com/yunfie-twitter/misskey-quick-share/issues)でお問い合わせください。

また、Twitterで[@yunfie_misskey](https://twitter.com/yunfie_misskey)にメンションを送ることもできます。

## ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。
