import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = () => {
    if (!tableNumber || !/^\d+$/.test(tableNumber)) {
      setError("有効なテーブル番号を入力してください");
      return;
    }
    router.push(`/people?table=${tableNumber}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Minima Order</h1>
        <p className="text-center text-gray-600 mb-8">テーブル番号を入力してください</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">テーブル番号</label>
            <input
              type="number"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setError(null);
              }}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  handleSubmit();
                }
              }}
              placeholder="例: 1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            次へ
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            💡 テーブルに設置されたQRコードを読み取ってアクセスした場合も、テーブル番号を入力してください
          </p>
        </div>
      </div>
    </div>
  );
}

