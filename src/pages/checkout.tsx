import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const Barcode = dynamic(() => import("react-barcode"), { ssr: false });

export default function Checkout() {
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [barcodeValue, setBarcodeValue] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
      // テーブル番号とタイムスタンプを組み合わせてバーコード値を生成
      const timestamp = Date.now();
      setBarcodeValue(`TABLE${table}_${timestamp}`);
    }
  }, [router.query]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">会計</h1>
        {tableNumber && (
          <p className="text-center text-gray-600 mb-8">テーブル番号: {tableNumber}</p>
        )}

        <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-6">
          <p className="text-center text-sm text-gray-600 mb-4">
            レジでこのバーコードを提示してください
          </p>
          {barcodeValue && (
            <div className="flex justify-center">
              <Barcode
                value={barcodeValue}
                format="CODE128"
                width={2}
                height={80}
                displayValue={true}
                fontSize={16}
              />
            </div>
          )}
          {tableNumber && (
            <p className="text-center mt-4 text-lg font-semibold text-gray-800">
              テーブル番号: {tableNumber}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            戻る
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            新しい注文を開始
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 バーコードをレジスタッフに提示すると、会計が完了します
          </p>
        </div>
      </div>
    </div>
  );
}

