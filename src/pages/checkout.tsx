import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";

export default function Checkout() {
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [barcodeValue, setBarcodeValue] = useState<string>("");
  const [BarcodeComponent, setBarcodeComponent] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // クライアントサイドでのみバーコードコンポーネントを読み込む
    if (typeof window !== "undefined") {
      import("react-barcode").then((mod) => {
        setBarcodeComponent(() => mod.default);
      });
    }
  }, []);

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
      // テーブル番号とタイムスタンプを組み合わせてバーコード値を生成
      const timestamp = Date.now();
      setBarcodeValue(`TABLE${table}_${timestamp}`);
    }
  }, [router.query]);

  const handleDetails = () => {
    // 明細表示機能は今後実装
    alert("明細表示機能は今後実装予定です");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Header title="この画面をレジでお知らせください" />

      {/* ロゴエリア（上部） */}
      <div className="py-4 px-4 min-h-[140px] flex flex-col justify-center">
        <div className="text-center">
          <div className="inline-block border-2 border-green-600 rounded-full px-8 py-6">
            <h1 className="text-2xl font-bold text-green-600">Minima Order</h1>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        {/* バーコード（ロゴとボタンの間の中央） */}
        <div className="w-full max-w-xs mt-auto mb-auto">
          {barcodeValue && BarcodeComponent && (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg transform scale-75">
                <BarcodeComponent
                  value={barcodeValue}
                  format="CODE128"
                  width={2}
                  height={80}
                  displayValue={true}
                  fontSize={16}
                />
              </div>
              {/* バーコードの下の数字 */}
              <p className="mt-2 text-lg font-mono text-gray-800 text-center">
                {barcodeValue.replace(/[^0-9]/g, "")}
              </p>
            </div>
          )}
          {barcodeValue && !BarcodeComponent && (
            <div className="flex justify-center p-4">
              <p className="text-gray-600">バーコードを読み込み中...</p>
            </div>
          )}
        </div>

        {/* 明細を表示するボタン */}
        <button
          onClick={handleDetails}
          className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors mb-4"
        >
          明細を表示する
        </button>

        {/* 注釈 */}
        <p className="text-center text-xs text-gray-600">
          ※この画面は、お会計後に自動的に閉じます。
        </p>
      </div>

      {/* フッターナビゲーション */}
      <FooterNav tableNumber={tableNumber} />
    </div>
  );
}

