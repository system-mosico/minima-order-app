import { useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";

export default function Home() {
  const [selectedPeople, setSelectedPeople] = useState<number | null>(null);
  const [tableNumber] = useState<string>("1");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const handlePeopleSelect = (num: number) => {
    setSelectedPeople(num);
    setShowConfirmDialog(true);
  };

  const handleConfirmYes = () => {
    if (selectedPeople) {
      router.push(`/menu?table=${tableNumber}&people=${selectedPeople}`);
    }
  };

  const handleConfirmNo = () => {
    setShowConfirmDialog(false);
    setSelectedPeople(null);
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

      {/* 人数確認ダイアログ */}
      {showConfirmDialog && selectedPeople && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full shadow-2xl border-2 border-green-600 pointer-events-auto">
            <p className="text-center text-lg font-semibold text-gray-800 mb-6">
              {selectedPeople === 9 ? "9人以上でご利用ですね？" : `${selectedPeople}名でご利用ですね？`}
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleConfirmNo}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
              >
                いいえ
              </button>
              <button
                onClick={handleConfirmYes}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フッターナビゲーション */}
      <FooterNav tableNumber={tableNumber} />
    </div>
  );
}
