# クイックデプロイガイド

## デプロイ前の確認事項

✅ ビルドが成功すること（`npm run build`）
✅ Firebase CLIがインストールされていること
✅ Firebaseにログインしていること

## デプロイ手順（3ステップ）

### ステップ1: Firebase CLIのインストールとログイン

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login
```

### ステップ2: Firestore Databaseの作成（初回のみ）

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「minima-order」を選択
3. 左メニューから「Firestore Database」を選択
4. 「データベースを作成」をクリック（未作成の場合）
5. リージョンを選択（推奨: `asia-northeast1`（東京））
6. 「有効にする」をクリック

### ステップ3: デプロイ実行

```bash
npm run deploy
```

これで以下が実行されます：
1. Next.jsアプリのビルド
2. Firestoreセキュリティルールのデプロイ
3. Firebase Hostingへのデプロイ

### デプロイ完了後

デプロイが完了すると、以下のURLでアクセスできます：

- **デフォルトURL**: `https://minima-order.web.app`
- **代替URL**: `https://minima-order.firebaseapp.com`

## 動作確認

1. デプロイされたURLにアクセス
2. 各機能をテスト：
   - QRコード読み取り（またはテーブル番号手入力）
   - 人数入力
   - メニュー選択・注文
   - 会計バーコード表示

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュをクリアして再ビルド
rm -rf .next out node_modules/.cache
npm run build
```

### デプロイエラー

```bash
# Firestoreルールのみデプロイ
firebase deploy --only firestore:rules

# Hostingのみデプロイ
firebase deploy --only hosting
```

### Firestore接続エラー

Firebase Consoleで以下を確認：
1. Firestore Databaseが作成されているか
2. セキュリティルールが正しく設定されているか
3. 承認済みドメインにデプロイ先のドメインが含まれているか

## 更新デプロイ

コードを更新した後：

```bash
npm run deploy
```

詳細は `DEPLOY.md` を参照してください。

