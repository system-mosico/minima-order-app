import React from "react";
import { useRouter } from "next/router";

interface FooterNavProps {
  activeTab?: string;
  tableNumber?: string | null;
  onTabChange?: (tab: string) => void;
}

export default function FooterNav({ activeTab, tableNumber, onTabChange }: FooterNavProps) {
  const router = useRouter();

  const navItems = [
    { id: "add", label: "注文追加", icon: "1️⃣", path: "/menu" },
    { id: "cart", label: "注文かご", icon: "2️⃣", path: "/menu" },
    { id: "history", label: "注文履歴", icon: "3️⃣", path: "/menu" },
    { id: "call", label: "店員呼出", icon: "4️⃣", path: "/menu" },
    { id: "checkout", label: "会計する", icon: "5️⃣", path: "/checkout" },
  ];

  const handleNavClick = (item: { id: string; label: string; path: string }) => {
    if (item.id === "checkout" && tableNumber) {
      router.push(`${item.path}?table=${tableNumber}`);
    } else if (item.id === "add" || item.id === "cart") {
      // メニューページ内でタブ切り替え
      if (router.pathname === "/menu" && onTabChange) {
        onTabChange(item.id);
      } else if (router.pathname !== "/menu") {
        router.push(item.path);
      }
    } else {
      // その他の機能は今後実装
      alert(`${item.label}機能は今後実装予定です`);
    }
  };

  return (
    <div className="bg-cyan-500 px-2 py-3 fixed bottom-0 left-0 right-0">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
              activeTab === item.id
                ? "bg-white border-2 border-orange-500"
                : "bg-white border-2 border-transparent"
            }`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className={`text-xs font-semibold ${activeTab === item.id ? "text-orange-500" : "text-cyan-600"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

