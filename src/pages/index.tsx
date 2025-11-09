import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

export default function Home() {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScan = async () => {
    try {
      setError(null);
      setScanning(true);
      
      // クライアントサイドでのみインポート
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // QRコードからテーブル番号を取得
          // フォーマット: "table:1" または単に "1"
          const match = decodedText.match(/table[:\s]*(\d+)/i) || decodedText.match(/^(\d+)$/);
          if (match) {
            const tableNum = match[1];
            setTableNumber(tableNum);
            scanner.stop();
            setScanning(false);
            router.push(`/people?table=${tableNum}`);
          } else {
            setError("有効なテーブル番号が見つかりませんでした");
          }
        },
        (errorMessage) => {
          // エラーは無視（継続的にスキャン）
        }
      );
    } catch (err: any) {
      setError(err.message || "カメラへのアクセスに失敗しました");
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleManualInput = () => {
    const input = prompt("テーブル番号を入力してください:");
    if (input && /^\d+$/.test(input)) {
      router.push(`/people?table=${input}`);
    } else if (input) {
      alert("有効なテーブル番号を入力してください");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Minima Order</h1>
        <p className="text-center text-gray-600 mb-8">テーブルのQRコードを読み取ってください</p>

        {!scanning ? (
          <div className="space-y-4">
            <button
              onClick={startScan}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              QRコードをスキャン
            </button>
            <button
              onClick={handleManualInput}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              テーブル番号を手入力
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div id="reader" className="w-full"></div>
            <button
              onClick={stopScan}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              スキャンを停止
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {tableNumber && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center">
            テーブル番号: {tableNumber} を認識しました
          </div>
        )}
      </div>
    </div>
  );
}

