# Firestoreセキュリティルールの更新手順

## 問題

Minima_Orderでテーブル情報を取得する際に「Missing or insufficient permissions」エラーが発生しています。

## 原因

Firebaseプロジェクト（minima-admin）のFirestoreセキュリティルールで、`tables`コレクションの読み取りが認証なしで許可されていない可能性があります。

## 解決方法

Firebase ConsoleでFirestoreのセキュリティルールを更新してください。

### 手順

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「minima-admin」を選択
3. 左メニューから「Firestore Database」をクリック
4. 「ルール」タブをクリック
5. 以下のルールをコピー＆ペーストして「公開」をクリック

### 完全なルール（コピー＆ペースト用）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ordersコレクション: 自分の店舗の注文のみ作成可能
    match /orders/{orderId} {
      // 読み取り: 店舗オーナーのみ（認証が必要）
      allow read: if request.auth != null && resource.data.ownerUid == request.auth.uid;
      
      // 作成: 認証なしでも作成可能（顧客が注文するため）
      // 必須フィールドの存在をチェック
      allow create: if request.resource.data.ownerUid != null 
                    && request.resource.data.items != null 
                    && request.resource.data.total != null
                    && request.resource.data.createdAt != null;
      
      // 更新・削除: 店舗オーナーのみ
      allow update, delete: if request.auth != null && resource.data.ownerUid == request.auth.uid;
    }
    
    // menusコレクション: メニュー情報
    match /menus/{menuId} {
      // 読み取り: 認証なしでも可能（顧客がメニューを閲覧するため）
      allow read: if true;
      
      // 書き込み: 店舗オーナーのみ
      allow write: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;
    }
    
    // tablesコレクション: テーブル情報
    match /tables/{tableId} {
      // 読み取り: 認証なしでも可能（顧客がテーブル情報を取得するため）
      allow read: if true;
      
      // 書き込み: 店舗オーナーのみ
      allow write: if request.auth != null && request.resource.data.ownerUid == request.auth.uid;
    }
  }
}
```

### 重要なポイント

- `tables`コレクションの`allow read: if true;`により、認証なしでもテーブル情報を読み取ることができます
- これにより、Minima_Order側でQRコードから取得した`tableId`を使ってテーブル情報を取得できます

### 確認

ルールを公開した後、以下を確認してください：

1. Minima_OrderのQRコードURLを再度開く
2. テーブル情報が正常に取得できることを確認
3. 人数選択画面が表示されることを確認

## コマンドラインでデプロイする場合

ターミナルで以下のコマンドを実行：

```bash
cd /Users/kajiurahisui/Desktop/minima_order_app
firebase use minima-admin
firebase deploy --only firestore:rules
```


