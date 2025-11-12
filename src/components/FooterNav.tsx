import React from "react";
import { useRouter } from "next/router";

interface FooterNavProps {
  activeTab?: string;
  tableNumber?: string | null;
  onTabChange?: (tab: string) => void;
  cartCount?: number;
}

export default function FooterNav({ activeTab, tableNumber, onTabChange, cartCount = 0 }: FooterNavProps) {
  const router = useRouter();

  const navItems = [
    { id: "add", label: "注文追加", path: "/menu" },
    { id: "cart", label: "注文かご", path: "/menu" },
    { id: "history", label: "注文履歴", path: "/menu" },
    { id: "call", label: "店員呼出", path: "/menu" },
    { id: "checkout", label: "会計する", path: "/checkout" },
  ];

  const handleNavClick = (item: { id: string; label: string; path: string }) => {
    if (item.id === "checkout" && tableNumber) {
      router.push(`${item.path}?table=${tableNumber}`);
    } else if (item.id === "add" || item.id === "cart" || item.id === "history") {
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
    <div className="bg-green-600 px-2 py-3 fixed bottom-0 left-0 right-0 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCart = item.id === "cart";
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`relative flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-yellow-400 border-2 border-green-700"
                  : "bg-green-600 border-2 border-transparent"
              }`}
            >
              <span className={`text-xs font-semibold ${isActive ? "text-green-700" : "text-white"}`}>
                {item.label}
              </span>
              {isCart && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
