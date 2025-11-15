// 人数選択コンポーネント（共通化）

import { useState } from "react";

interface PeopleSelectorProps {
  onSelect: (num: number) => void;
}

export default function PeopleSelector({ onSelect }: PeopleSelectorProps) {
  const handlePeopleSelect = (num: number) => {
    onSelect(num);
  };

  return (
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
  );
}

