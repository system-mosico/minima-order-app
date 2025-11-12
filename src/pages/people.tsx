import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import NumberInput from "../components/NumberInput";
import TenKey from "../components/TenKey";

export default function People() {
  const [people, setPeople] = useState("");
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
    } else if (router.isReady) {
      // テーブル番号が取得できない場合（QRコードが読み取られていない場合）
      alert("テーブルのQRコードを読み取ってアクセスしてください");
      router.push("/");
    }
  }, [router.query, router.isReady]);

  const handleSubmit = () => {
    if (!people || !/^\d+$/.test(people) || Number(people) < 1 || Number(people) > 20) {
      alert("1〜20人の範囲で入力してください");
      return;
    }
    if (!tableNumber) {
      alert("テーブル番号が取得できませんでした。QRコードを読み取ってアクセスしてください。");
      router.push("/");
      return;
    }
    router.push(`/menu?table=${tableNumber}&people=${people}`);
  };

  const handleDelete = () => {
    setPeople((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="番号を入力してください" />
      
      {/* ロゴエリア */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-cyan-600">Minima Order</h1>
        {tableNumber && (
          <p className="text-sm text-gray-600 mt-2">テーブル番号: {tableNumber}</p>
        )}
      </div>

      {/* 番号入力ボックス */}
      <NumberInput value={people} placeholder="利用人数" />

      {/* テンキー */}
      <div className="flex-1">
        <TenKey
          value={people}
          onChange={setPeople}
          onDelete={handleDelete}
          maxLength={2}
        />
      </div>

      {/* 次へボタン */}
      <div className="px-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!people || people.length === 0 || Number(people) < 1 || Number(people) > 20}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-lg text-lg transition-colors"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
