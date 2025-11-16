# Minima Order

モバイルオーダー／セルフ注文アプリ

## 概要

飲食店の顧客（テーブル利用者）向けのモバイルオーダーアプリです。スマートフォンのブラウザで完結し、QRコードを読み取ってテーブル番号を認識し、紙メニューの番号を入力して注文できます。

## 機能

- **QRコード読み取り**: テーブルに設置されたQRコードを読み取ってテーブル番号を取得
- **人数入力**: 利用人数を入力
- **メニュー番号入力**: 紙メニューの番号を入力して商品を選択
- **カート機能**: 複数商品をまとめて注文可能、数量調整・削除機能
- **追加注文**: 注文後でも追加注文可能
- **会計機能**: バーコードを表示してレジで提示

## 技術スタック

- **フレームワーク**: Next.js 16.0.1 (Pages Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **データベース**: Firebase Firestore
- **QRコード**: html5-qrcode
- **バーコード**: react-barcode

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または yarn
- Firebaseプロジェクト（Minima_Adminと同じプロジェクトを使用）

### インストール

```bash
npm install
```

### 環境変数の設定

Minima_Adminと同じFirebaseプロジェクトを使用するため、`.env.local`ファイルを作成してFirebase設定を追加してください。

プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を記入してください：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAgeHreGY29lH8uri73GTaFa9UOdv3xTig
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=minima-admin.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=minima-admin
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=minima-admin.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=896370773667
NEXT_PUBLIC_FIREBASE_APP_ID=1:896370773667:web:85c502b5939b3e7a06b916
```

**注意**: これらの値はMinima_Admin側の`.env.local`と同じ値を使用してください。

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

### スマホからアクセスする方法

1. PCとスマホを同じWi-Fiネットワークに接続してください
2. 開発サーバー起動時に表示されるNetworkアドレス（例: `http://172.16.7.246:3000`）を確認
3. スマホのブラウザでそのNetworkアドレスにアクセス

**注意**: 
- カメラ機能（QRコード読み取り）を使用する場合は、HTTPSが必要な場合があります
- ローカルネットワーク経由でのアクセスのため、ファイアウォールの設定を確認してください

### ビルド

```bash
npm run build
npm start
```

## プロジェクト構造

```
src/
├── pages/
│   ├── index.tsx          # ホームページ（QRコード読み取り）
│   ├── people.tsx         # 人数入力ページ
│   ├── menu.tsx           # メニュー選択・カートページ
│   ├── checkout.tsx       # 会計ページ（バーコード表示）
│   ├── _app.tsx           # アプリケーションのルートコンポーネント
│   ├── _document.tsx      # カスタムドキュメント
│   └── api/
│       ├── order.ts       # 注文API
│       └── table.ts       # テーブルAPI
├── firebase/
│   └── config.ts          # Firebase設定
└── styles/
    └── globals.css         # グローバルスタイル
```

## Firebase設定

Firebaseの設定は `src/firebase/config.ts` にあります。環境変数から読み込むようになっています。

**重要**: Minima_Adminと同じFirebaseプロジェクト（`minima-admin`）を使用する必要があります。これにより、以下の連携が可能になります：

- Minima_Adminで登録したメニューがMinima_Orderに反映される
- Minima_Orderで作成した注文がMinima_Adminの注文管理に反映される
- Minima_Adminで生成したQRコードからMinima_Orderにアクセスできる

## デプロイ

### Firebase Hosting

```bash
npm run build
npm run deploy
```

## ライセンス

ISC
