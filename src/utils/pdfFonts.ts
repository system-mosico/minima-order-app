// pdfmake用の日本語フォント設定

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// デフォルトのフォントを設定
// pdfFontsは直接vfsオブジェクトをエクスポートしている
if (pdfMake && pdfFonts) {
  pdfMake.vfs = pdfFonts as any;
}

// デフォルトフォントを設定
pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

// 日本語フォントを読み込んで追加
let japaneseFontLoaded = false;

export const loadJapaneseFont = async (): Promise<void> => {
  if (japaneseFontLoaded) return;

  try {
    console.log("日本語フォント読み込み開始");
    
    // まず、ローカルのフォントファイルを試す
    let fontResponse = await fetch("/fonts/NotoSansJP-Regular.ttf?v=" + Date.now(), {
      cache: "no-store",
    });
    
    // ローカルファイルが存在しない、またはHTMLが返された場合はGoogle Fonts APIから取得
    if (!fontResponse.ok || fontResponse.headers.get("content-type")?.includes("text/html")) {
      console.log("ローカルフォントファイルが見つかりません。Google Fonts APIから取得します。");
      
      // Google FontsのCSSからフォントURLを取得（TTF形式を優先）
      const cssResponse = await fetch("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap", {
        cache: "no-store",
      });
      const cssText = await cssResponse.text();
      console.log("Google Fonts CSS取得完了");
      
      // CSSからTTF形式のフォントURLを抽出（複数の形式がある場合、TTFを優先）
      const ttfUrlMatch = cssText.match(/url\(([^)]+\.ttf[^)]*)\)/);
      const woff2UrlMatch = cssText.match(/url\(([^)]+\.woff2[^)]*)\)/);
      
      let fontUrl: string | null = null;
      if (ttfUrlMatch && ttfUrlMatch[1]) {
        fontUrl = ttfUrlMatch[1].replace(/['"]/g, '');
        console.log("CSSから抽出したTTF URL:", fontUrl);
      } else if (woff2UrlMatch && woff2UrlMatch[1]) {
        // TTFが見つからない場合はWOFF2を試す（pdfmakeはWOFF2をサポートしていないため、エラーになる可能性がある）
        fontUrl = woff2UrlMatch[1].replace(/['"]/g, '');
        console.log("CSSから抽出したWOFF2 URL (TTFが見つかりませんでした):", fontUrl);
        console.warn("WOFF2形式はpdfmakeでサポートされていません。TTF形式のフォントファイルを手動で配置することを推奨します。");
      }
      
      if (fontUrl) {
        fontResponse = await fetch(fontUrl, {
          cache: "no-store",
        });
      } else {
        throw new Error("Google Fonts CSSからフォントURLを抽出できませんでした");
      }
    }
    
    if (!fontResponse.ok) {
      throw new Error(`フォントファイルの読み込みに失敗: ${fontResponse.status}`);
    }
    
    // ArrayBufferとして読み込む
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    
    // フォントファイルが正しく読み込まれたか確認（TTFファイルの先頭は0x00 01 00 00またはOTTO）
    const uint8Array = new Uint8Array(fontArrayBuffer);
    const headerBytes = Array.from(uint8Array.slice(0, 4));
    const header = headerBytes
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ');
    
    // TTFファイルの有効なヘッダーをチェック
    // TTF: 0x00 01 00 00 または 0x74 72 75 65 (true)
    // OTF: 0x4f 54 54 4f (OTTO)
    const isValidTTF = headerBytes[0] === 0x00 && headerBytes[1] === 0x01 && headerBytes[2] === 0x00 && headerBytes[3] === 0x00;
    const isValidOTF = headerBytes[0] === 0x4f && headerBytes[1] === 0x54 && headerBytes[2] === 0x54 && headerBytes[3] === 0x4f;
    
    if (!isValidTTF && !isValidOTF) {
      // フォントファイルが正しく読み込まれていない場合、エラーを投げずに警告を表示
      console.warn("フォントファイルの形式が正しくありません。");
      console.warn("期待されるヘッダー: 00 01 00 00 (TTF) または 4f 54 54 4f (OTF)");
      console.warn("実際のヘッダー:", header);
      console.warn("Robotoフォントで代替します。");
      // エラーを投げずに、Robotoフォントで代替する
      japaneseFontLoaded = true; // 再試行を防ぐ
      if (!pdfMake.fonts?.NotoSansJP) {
        pdfMake.fonts = {
          ...pdfMake.fonts,
          NotoSansJP: {
            normal: "Roboto-Regular.ttf",
            bold: "Roboto-Medium.ttf",
            italics: "Roboto-Italic.ttf",
            bolditalics: "Roboto-MediumItalic.ttf",
          },
        };
      }
      return; // エラーを投げずに終了
    }
    
    // ArrayBufferをBase64に変換（大きなファイルでも安全に処理）
    const fontBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error("Base64エンコードに失敗"));
        }
      };
      reader.onerror = () => reject(new Error("ファイル読み込みエラー"));
      reader.readAsDataURL(new Blob([fontArrayBuffer], { type: "font/ttf" }));
    });

    // pdfMakeのvfsにフォントを追加
    // pdfFontsは直接vfsオブジェクトなので、pdfFonts自体に追加
    const pdfFontsVfs = pdfFonts as any;
    if (pdfFontsVfs) {
      pdfFontsVfs["NotoSansJP-Regular.ttf"] = fontBase64;
      // pdfMake.vfsも同じ参照に設定
      pdfMake.vfs = pdfFontsVfs;
    } else {
      // フォールバック: pdfMake.vfsに直接追加
      if (!pdfMake.vfs) {
        pdfMake.vfs = {};
      }
      pdfMake.vfs["NotoSansJP-Regular.ttf"] = fontBase64;
    }

    // フォントを登録
    pdfMake.fonts = {
      ...pdfMake.fonts,
      NotoSansJP: {
        normal: "NotoSansJP-Regular.ttf",
        bold: "NotoSansJP-Regular.ttf", // 太字も同じフォントを使用
        italics: "NotoSansJP-Regular.ttf",
        bolditalics: "NotoSansJP-Regular.ttf",
      },
    };

    japaneseFontLoaded = true;
    console.log("日本語フォント読み込み完了");
  } catch (error) {
    console.error("日本語フォントの読み込みエラー:", error);
    // エラーが発生しても、デフォルトフォントで続行
    // フォールバックとしてRobotoフォントを使用
    if (!pdfMake.fonts?.NotoSansJP) {
      pdfMake.fonts = {
        ...pdfMake.fonts,
        NotoSansJP: {
          normal: "Roboto-Regular.ttf",
          bold: "Roboto-Medium.ttf",
          italics: "Roboto-Italic.ttf",
          bolditalics: "Roboto-MediumItalic.ttf",
        },
      };
    }
  }
};

export default pdfMake;

