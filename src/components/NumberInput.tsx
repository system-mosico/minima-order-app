import React from "react";

interface NumberInputProps {
  value: string;
  placeholder?: string;
}

export default function NumberInput({ value, placeholder = "" }: NumberInputProps) {
  return (
    <div className="px-4 py-2">
      <div className="bg-white border-2 border-green-600 rounded-lg py-3">
        <div className="text-center text-5xl font-bold text-green-600 min-h-[30px] flex items-center justify-center">
          {value || <span className="text-gray-300 text-3xl">{placeholder}</span>}
        </div>
      </div>
    </div>
  );
}

