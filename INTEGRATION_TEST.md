# Minima_Order と Minima_Admin の連携動作確認手順

## 前提条件

- ✅ Minima_OrderとMinima_Adminが同一Firebaseプロジェクト（minima-admin）を使用
- ✅ `.env.local`ファイルが正しく設定されている
- ✅ 両方の開発サーバーが起動している
  - Minima_Order: http://localhost:3000
  - Minima_Admin: http://localhost:3001

## 動作確認手順

### 1. Minima_Admin側の準備

#### 1-1. ログイン
1. http://localhost:3001 にアクセス
2. Googleアカウントでログイン

#### 1-2. メニューの登録
1. 「メニュー管理」ページにアクセス
2. 以下のようなメニューを登録：
   - 商品番号: `1`
   - 商品名: `マルゲリータピザ`
   - 価格: `1200`
3. 複数のメニューを登録（商品番号2, 3, 4...など）

#### 1-3. テーブルの登録
1. 「QRコード」ページにアクセス
2. テーブル番号を入力（例: `1`）
3. 「追加」をクリック
4. 生成されたQRコードを確認
5. QRコードの下に表示されているURLを確認
   - 形式: `http://localhost:3000/?ownerUid={ownerUid}&tableId={tableId}`

### 2. QRコード連携の確認

#### 2-1. QRコードの読み取り
1. スマートフォンまたはブラウザでQRコードを読み取る
2. または、QRコードの下に表示されているURLを直接ブラウザで開く
3. Minima_Orderのホームページ（人数選択画面）が表示されることを確認

#### 2-2. URLパラメータの確認
1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブで以下を実行：
   ```javascript
   new URLSearchParams(window.location.search).get('ownerUid')
   new URLSearchParams(window.location.search).get('tableId')
   ```
3. `ownerUid`と`tableId`が正しく取得できていることを確認

### 3. メニュー連携の確認

#### 3-1. メニューの表示
1. Minima_Orderで人数を選択してメニューページに進む
2. メニュー番号入力画面で、Minima_Adminで登録した商品番号を入力
3. 商品名と価格が正しく表示されることを確認

#### 3-2. メニューの取得確認
1. ブラウザの開発者ツールを開く（F12）
2. Consoleタブで以下を実行：
   ```javascript
   // Firestoreからメニューが取得されているか確認
   // （実際の確認はFirebase Consoleで行う）
   ```
3. Firebase Consoleで`menus`コレクションを確認
   - `ownerUid`でフィルタリングされていることを確認

### 4. 注文連携の確認

#### 4-1. 注文の作成
1. Minima_Orderで商品を選択してカートに追加
2. 注文を確定
3. 注文が正常に送信されることを確認

#### 4-2. Minima_Admin側での確認
1. Minima_Adminの「注文管理」ページにアクセス
2. 作成した注文が表示されることを確認
3. 以下の情報が正しく表示されることを確認：
   - テーブル番号
   - 注文内容（商品名、数量、価格）
   - 合計金額
   - 注文日時

#### 4-3. 注文データの構造確認
1. Firebase Consoleで`orders`コレクションを確認
2. 作成された注文ドキュメントを開く
3. 以下のフィールドが含まれていることを確認：
   - `ownerUid`: 店舗の所有者UID
   - `tableId`: テーブルID
   - `tableNumber`: テーブル番号（文字列）
   - `items`: 注文アイテムの配列
     - `name`: 商品名
     - `price`: 価格
     - `qty`: 数量
     - `itemNumber`: 商品番号
   - `total`: 合計金額
   - `status`: `"accepted"`
   - `createdAt`: 数値タイムスタンプ

### 5. リアルタイム更新の確認

#### 5-1. 注文のリアルタイム反映
1. Minima_Adminの「注文管理」ページを開いたままにする
2. Minima_Orderで新しい注文を作成
3. Minima_Admin側で注文が自動的に表示されることを確認（ページをリロードする必要はない）

#### 5-2. ホームページの更新確認
1. Minima_Adminの「ホーム」ページにアクセス
2. 今日の注文サマリーと売上が更新されることを確認

## トラブルシューティング

### エラー: テーブル情報が見つかりません
- **原因**: `tableId`が正しく取得できていない、またはFirestoreにテーブルが存在しない
- **対処**: 
  - URLパラメータに`tableId`が含まれているか確認
  - Minima_Adminでテーブルが正しく登録されているか確認

### エラー: メニューの取得に失敗しました
- **原因**: `ownerUid`が取得できていない、またはFirestoreのセキュリティルールの問題
- **対処**:
  - URLパラメータに`ownerUid`が含まれているか確認
  - Firestoreのセキュリティルールで`menus`コレクションの読み取りが許可されているか確認

### エラー: 注文の送信に失敗しました
- **原因**: Firestoreのセキュリティルールの問題、または必須フィールドが不足
- **対処**:
  - Firestoreのセキュリティルールで`orders`コレクションの作成が許可されているか確認
  - ブラウザのConsoleでエラーメッセージを確認

### エラー: Firestoreインデックスの作成が必要です
- **原因**: 複合クエリ（`ownerUid` + `tableNumber` + `createdAt`）にインデックスが必要
- **対処**:
  - エラーメッセージに表示されているリンクからインデックスを作成
  - または、Firebase Consoleで手動でインデックスを作成

## 確認項目チェックリスト

- [ ] Minima_Adminでログインできた
- [ ] メニューを登録できた
- [ ] テーブルを登録できた
- [ ] QRコードが生成された
- [ ] QRコードからMinima_Orderにアクセスできた
- [ ] URLパラメータ（`ownerUid`、`tableId`）が正しく取得できた
- [ ] Minima_Orderでメニューが表示された
- [ ] 商品番号でメニューを検索できた
- [ ] 注文を作成できた
- [ ] Minima_Adminの注文管理に注文が表示された
- [ ] 注文データの構造が正しい
- [ ] リアルタイムで注文が反映された


