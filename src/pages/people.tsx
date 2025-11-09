import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function People() {
  const [people, setPeople] = useState(1);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
    }
  }, [router.query]);

  const handleSubmit = () => {
    if (people < 1 || people > 20) {
      alert("1〜20人の範囲で入力してください");
      return;
    }
    if (!tableNumber) {
      alert("テーブル番号が取得できませんでした");
      return;
    }
    router.push(`/menu?table=${tableNumber}&people=${people}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">利用人数を入力</h1>
        {tableNumber && (
          <p className="text-center text-gray-600 mb-2">テーブル番号: {tableNumber}</p>
        )}
        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">人数</label>
            <input
              type="number"
              value={people}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= 20) {
                  setPeople(val);
                }
              }}
              min="1"
              max="20"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setPeople(Math.max(1, people - 1))}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                −
              </button>
              <button
                onClick={() => setPeople(Math.min(20, people + 1))}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                ＋
              </button>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            次へ
          </button>
        </div>
      </div>
    </div>
  );
}
