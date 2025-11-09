import { useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import NumberInput from "../components/NumberInput";
import TenKey from "../components/TenKey";

export default function Home() {
  const [tableNumber, setTableNumber] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!tableNumber || !/^\d+$/.test(tableNumber)) {
      return;
    }
    router.push(`/people?table=${tableNumber}`);
  };

  const handleDelete = () => {
    setTableNumber((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header title="番号を入力してください" />
      
      {/* ロゴエリア */}
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-cyan-600">Minima Order</h1>
      </div>

      {/* 番号入力ボックス */}
      <NumberInput value={tableNumber} placeholder="テーブル番号" />

      {/* テンキー */}
      <div className="flex-1">
        <TenKey
          value={tableNumber}
          onChange={setTableNumber}
          onDelete={handleDelete}
          maxLength={3}
        />
      </div>

      {/* 次へボタン */}
      <div className="px-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!tableNumber || tableNumber.length === 0}
          className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-lg text-lg transition-colors"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
