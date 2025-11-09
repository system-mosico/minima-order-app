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

### インストール

```bash
npm install
```

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

Firebaseの設定は `src/firebase/config.ts` にあります。本番環境では環境変数を使用することを推奨します。

## デプロイ

### Firebase Hosting

```bash
npm run build
npm run deploy
```

## ライセンス

ISC
