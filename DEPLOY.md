# Firebaseデプロイ手順書

## 前提条件

1. Firebase CLIがインストールされていること
2. Firebaseプロジェクト「minima-order」にアクセス権限があること
3. Node.jsとnpmがインストールされていること

## セットアップ手順

### 1. Firebase CLIのインストール（未インストールの場合）

```bash
npm install -g firebase-tools
```

### 2. Firebaseにログイン

```bash
firebase login
```

ブラウザが開くので、Googleアカウントでログインしてください。

### 3. プロジェクトの確認

```bash
firebase projects:list
```

「minima-order」プロジェクトが表示されることを確認してください。

### 4. プロジェクトの設定確認

`.firebaserc`ファイルに以下のように設定されていることを確認：

```json
{
  "projects": {
    "default": "minima-order"
  }
}
```

## Firebase Consoleでの設定

### 1. Firestoreセキュリティルールの確認

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「minima-order」を選択
3. 左メニューから「Firestore Database」を選択
4. 「ルール」タブを開く
5. 以下のルールが設定されていることを確認（デプロイ時に自動的に適用されます）：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

### 2. 承認済みドメインの確認

1. Firebase Consoleで「Authentication」を選択
2. 「設定」タブ > 「承認済みドメイン」を確認
3. 以下のドメインが自動的に追加されていることを確認：
   - `localhost`
   - `minima-order.web.app`（Firebase Hostingのデフォルトドメイン）
   - `minima-order.firebaseapp.com`（Firebase Hostingのデフォルトドメイン）
4. カスタムドメインを使用する場合は、ここに追加してください

### 3. Firestore Databaseの作成（未作成の場合）

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. 「本番環境モードで開始」または「テストモードで開始」を選択
4. リージョンを選択（例: `asia-northeast1`（東京））
5. 「有効にする」をクリック

## デプロイ手順

### 1. ビルドとデプロイの実行

```bash
npm run deploy
```

または、個別に実行：

```bash
# ビルド
npm run build

# Firestoreルールのデプロイ
firebase deploy --only firestore:rules

# Hostingのデプロイ
firebase deploy --only hosting
```

### 2. デプロイの確認

デプロイが完了すると、以下のようなURLが表示されます：

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/minima-order/overview
Hosting URL: https://minima-order.web.app
```

### 3. 動作確認

1. デプロイされたURL（例: `https://minima-order.web.app`）にアクセス
2. 各機能をテスト：
   - QRコード読み取り（またはテーブル番号手入力）
   - 人数入力
   - メニュー選択・注文
   - 会計バーコード表示

## トラブルシューティング

### ビルドエラーが発生する場合

```bash
# .nextディレクトリを削除して再ビルド
rm -rf .next out
npm run build
```

### Firestoreルールのデプロイエラー

```bash
# Firestoreルールのみをデプロイ
firebase deploy --only firestore:rules
```

### ホスティングのデプロイエラー

```bash
# ホスティングのみをデプロイ
firebase deploy --only hosting
```

### キャッシュの問題

```bash
# ビルドキャッシュをクリア
rm -rf .next out node_modules/.cache
npm run build
```

## カスタムドメインの設定（オプション）

1. Firebase Consoleで「Hosting」を選択
2. 「カスタムドメインを追加」をクリック
3. ドメイン名を入力
4. DNS設定の指示に従って設定
5. デプロイ後、カスタムドメインでアクセス可能になります

## 更新デプロイ

コードを更新した後、再度デプロイ：

```bash
npm run deploy
```

または、変更内容に応じて：

```bash
# コードのみ更新
npm run build && firebase deploy --only hosting

# Firestoreルールのみ更新
firebase deploy --only firestore:rules
```

## ロールバック

以前のバージョンに戻す場合：

```bash
# デプロイ履歴を確認
firebase hosting:channel:list

# 特定のバージョンにロールバック
firebase hosting:rollback
```

## セキュリティに関する注意事項

現在のFirestoreルールは、誰でも注文を作成・読み取りできる設定になっています。本番環境で使用する場合は、以下の点を検討してください：

1. **認証の追加**: 顧客認証を追加して、注文の作成者を識別
2. **ルールの強化**: 店舗側のみが注文を更新・削除できるようにする
3. **レート制限**: 過度なリクエストを防ぐための制限を追加

## 次のステップ

- [ ] カスタムドメインの設定
- [ ] 認証機能の追加（オプション）
- [ ] 店舗側ダッシュボードの作成（オプション）
- [ ] メニュー管理機能の追加（オプション）

