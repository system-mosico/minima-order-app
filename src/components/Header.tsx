import React from "react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <div className="bg-cyan-500 text-white py-4 px-4">
      <h2 className="text-center text-xl font-bold">{title}</h2>
    </div>
  );
}

