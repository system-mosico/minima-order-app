import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// メニューアイテムの定義（実際の運用ではFirebaseから取得）
const menuItems: { [key: number]: { id: number; name: string; price: number } } = {
  1: { id: 1, name: "マルゲリータピザ", price: 1200 },
  2: { id: 2, name: "シーザーサラダ", price: 800 },
  3: { id: 3, name: "カルボナーラ", price: 1100 },
  4: { id: 4, name: "ミートパスタ", price: 1300 },
  5: { id: 5, name: "ハンバーグ", price: 1500 },
  6: { id: 6, name: "オムライス", price: 900 },
  7: { id: 7, name: "コーラ", price: 300 },
  8: { id: 8, name: "オレンジジュース", price: 300 },
  9: { id: 9, name: "ビール", price: 500 },
  10: { id: 10, name: "アイスクリーム", price: 400 },
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function Menu() {
  const [menuNumber, setMenuNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [people, setPeople] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { table, people: peopleParam } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
    }
    if (peopleParam && typeof peopleParam === "string") {
      setPeople(Number(peopleParam));
    }
  }, [router.query]);

  const addToCart = () => {
    const num = Number(menuNumber);
    if (!num || !menuItems[num]) {
      alert("メニュー番号が見つかりません");
      setMenuNumber("");
      return;
    }

    const item = menuItems[num];
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }

    setMenuNumber("");
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item: CartItem) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item: CartItem) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item: CartItem) => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      alert("カートが空です");
      return;
    }
    if (!tableNumber || !people) {
      alert("テーブル番号または人数が取得できませんでした");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          tableNumber: Number(tableNumber),
          people: people,
          total: getTotal(),
        }),
      });

      if (!response.ok) throw new Error("注文に失敗しました");
      
      const data = await response.json();
      setOrderPlaced(true);
      setCart([]);
      
      // 注文確定後、追加注文可能にする
      setTimeout(() => {
        setOrderPlaced(false);
      }, 3000);
    } catch (error) {
      alert("注文の送信に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    router.push(`/checkout?table=${tableNumber}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">メニュー</h1>
          {tableNumber && people && (
            <p className="text-center text-gray-600 text-sm">
              テーブル: {tableNumber} | 人数: {people}人
            </p>
          )}
        </div>

        {/* メニュー番号入力 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">メニュー番号を入力</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={menuNumber}
              onChange={(e) => setMenuNumber(e.target.value)}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") {
                  addToCart();
                }
              }}
              placeholder="例: 1"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-xl text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addToCart}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
              追加
            </button>
          </div>
          {menuNumber && menuItems[Number(menuNumber)] && (
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
              <p className="font-semibold text-gray-800">
                {menuItems[Number(menuNumber)].name}
              </p>
              <p className="text-gray-600">¥{menuItems[Number(menuNumber)].price.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* カート */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">カート</h2>
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">カートは空です</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">¥{item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full font-bold"
                    >
                      ＋
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">合計</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ¥{getTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 注文確定ボタン */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="max-w-md mx-auto space-y-2">
            <button
              onClick={handleOrder}
              disabled={loading || cart.length === 0 || orderPlaced}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors text-lg"
            >
              {loading
                ? "送信中..."
                : orderPlaced
                ? "注文確定済み"
                : "注文確定"}
            </button>
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              会計する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
