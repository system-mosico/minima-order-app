# 日本語フォント設定手順

PDFレシートで日本語を正しく表示するために、Noto Sans JPフォントファイルを設定する必要があります。

## 手順

1. 以下のURLからNoto Sans JP Regularフォントをダウンロードしてください：
   - https://fonts.google.com/noto/specimen/Noto+Sans+JP
   - 「Download family」をクリックしてZIPファイルをダウンロード
   - ZIPファイルを解凍し、`NotoSansJP-Regular.ttf` を取得

2. ダウンロードした `NotoSansJP-Regular.ttf` を以下のディレクトリに配置してください：
   ```
   public/fonts/NotoSansJP-Regular.ttf
   ```

3. ファイルが正しく配置されたか確認：
   ```bash
   file public/fonts/NotoSansJP-Regular.ttf
   ```
   出力が `TrueType font` または `OpenType font` であることを確認してください。

## 注意事項

- フォントファイルが正しく配置されていない場合、PDFレシートの日本語が文字化けする可能性があります
- 現在のコードでは、フォントファイルが読み込めない場合、Robotoフォントで代替されます（日本語は表示されません）

