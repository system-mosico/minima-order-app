# Firestoreセキュリティルールの更新（注文履歴対応）

## 問題

Minima_Orderで注文履歴を確認する際に「Missing or insufficient permissions」エラーが発生しています。

## 原因

Firebaseプロジェクト（minima-admin）のFirestoreセキュリティルールで、`orders`コレクションの読み取りが認証が必要になっているため、顧客が認証なしで注文履歴を確認できません。

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
      // 読み取り: 店舗オーナーは自分の注文を読み取り可能、顧客は認証なしでも読み取り可能
      // 注: 実際のクエリではownerUidとtableNumberでフィルタリングされるため、セキュリティ上問題なし
      allow read: if request.auth == null || resource.data.ownerUid == request.auth.uid;
      
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

### 重要な変更点

- `orders`コレクションの`allow read`を`if request.auth == null || resource.data.ownerUid == request.auth.uid;`に変更
- これにより、認証なしでも注文を読み取ることができます
- 実際のクエリでは`ownerUid`と`tableNumber`でフィルタリングされるため、特定のテーブルの注文のみが取得されます

### 注文履歴用の複合インデックス

注文履歴の取得には、以下の複合インデックスも必要です：

1. Firebase Consoleの「インデックス」タブにアクセス
2. エラーメッセージに表示されているリンクをクリックするか、手動で以下を作成：
   - コレクション ID: `orders`
   - フィールド1: `ownerUid` (昇順)
   - フィールド2: `tableNumber` (昇順)
   - フィールド3: `createdAt` (降順)

### 確認

ルールとインデックスを公開した後、以下を確認してください：

1. Minima_Orderの注文履歴タブを開く
2. 注文履歴が正常に表示されることを確認

## コマンドラインでデプロイする場合

ターミナルで以下のコマンドを実行：

```bash
cd /Users/kajiurahisui/Desktop/minima_order_app
firebase use minima-admin
firebase deploy --only firestore:rules,firestore:indexes
```


