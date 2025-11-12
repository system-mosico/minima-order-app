import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";

export default function People() {
  const [selectedPeople, setSelectedPeople] = useState<number | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
    } else if (router.isReady) {
      // テスト用: テーブル番号が取得できない場合、デフォルトでテーブル1を使用
      setTableNumber("1");
    }
  }, [router.query, router.isReady]);

  const handlePeopleSelect = (num: number) => {
    setSelectedPeople(num);
    if (tableNumber) {
      router.push(`/menu?table=${tableNumber}&people=${num}`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Header title="何名様(全員)でご利用ですか?" />
      
      {/* 人数選択ボタン */}
      <div className="flex-1 px-4 py-8">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePeopleSelect(num)}
              className="bg-gray-100 border border-gray-300 rounded-lg py-6 text-xl font-semibold text-green-600 active:bg-gray-200 transition-colors"
            >
              {num === 9 ? (
                <div>
                  <div>9人</div>
                  <div className="text-sm">以上</div>
                </div>
              ) : (
                `${num}人`
              )}
            </button>
          ))}
        </div>
      </div>

      {/* フッターナビゲーション */}
      <FooterNav tableNumber={tableNumber} />
    </div>
  );
}
