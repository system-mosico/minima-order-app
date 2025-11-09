import React from "react";

interface TenKeyProps {
  value: string;
  onChange: (value: string) => void;
  onDelete: () => void;
  maxLength?: number;
}

export default function TenKey({ value, onChange, onDelete, maxLength = 10 }: TenKeyProps) {
  const handleNumberClick = (num: string) => {
    if (value.length < maxLength) {
      onChange(value + num);
    }
  };

  const handleDelete = () => {
    if (value.length > 0) {
      onDelete();
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 px-4 pb-4">
      {/* 1-9 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => handleNumberClick(num.toString())}
          className="bg-white border border-gray-200 rounded-lg py-6 text-3xl font-semibold text-cyan-600 active:bg-gray-50 active:shadow-inner transition-all"
        >
          {num}
        </button>
      ))}
      
      {/* 0 と 削除 */}
      <div className="col-span-2">
        <button
          onClick={() => handleNumberClick("0")}
          className="w-full bg-white border border-gray-200 rounded-lg py-6 text-3xl font-semibold text-cyan-600 active:bg-gray-50 active:shadow-inner transition-all"
        >
          0
        </button>
      </div>
      <button
        onClick={handleDelete}
        className="bg-white border border-gray-200 rounded-lg py-6 text-lg font-semibold text-cyan-600 active:bg-gray-50 active:shadow-inner transition-all"
      >
        削除
      </button>
    </div>
  );
}

