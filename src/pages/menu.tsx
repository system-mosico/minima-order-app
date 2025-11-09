import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Header from "../components/Header";
import NumberInput from "../components/NumberInput";
import TenKey from "../components/TenKey";
import FooterNav from "../components/FooterNav";

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
  const [activeTab, setActiveTab] = useState<string>("add");
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
      const orderData = {
        cart: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        tableNumber: Number(tableNumber),
        people: people,
        total: getTotal(),
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      setOrderPlaced(true);
      setCart([]);
      
      setTimeout(() => {
        setOrderPlaced(false);
      }, 3000);
    } catch (error: any) {
      console.error("注文エラー:", error);
      alert("注文の送信に失敗しました: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setMenuNumber((prev) => prev.slice(0, -1));
  };

  const handleNumberEnter = () => {
    if (menuNumber) {
      addToCart();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Header title="番号を入力してください" />
      
      {/* ロゴエリア */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-cyan-600">Minima Order</h1>
        {tableNumber && people && (
          <p className="text-xs text-gray-600 mt-1">テーブル: {tableNumber} | 人数: {people}人</p>
        )}
      </div>

      {/* タブ切り替え表示 */}
      {activeTab === "add" && (
        <>
          {/* 番号入力ボックス */}
          <NumberInput value={menuNumber} placeholder="メニュー番号" />

          {/* 選択されたメニュー表示 */}
          {menuNumber && menuItems[Number(menuNumber)] && (
            <div className="px-4 pb-2">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                <p className="font-semibold text-gray-800 text-center">
                  {menuItems[Number(menuNumber)].name}
                </p>
                <p className="text-gray-600 text-center text-sm">
                  ¥{menuItems[Number(menuNumber)].price.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* テンキー */}
          <div className="flex-1">
            <TenKey
              value={menuNumber}
              onChange={setMenuNumber}
              onDelete={handleDelete}
              maxLength={3}
            />
          </div>

          {/* 追加ボタン */}
          <div className="px-4 pb-4">
            <button
              onClick={handleNumberEnter}
              disabled={!menuNumber || menuNumber.length === 0}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-lg text-lg transition-colors"
            >
              追加
            </button>
          </div>
        </>
      )}

      {activeTab === "cart" && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <h2 className="text-xl font-bold text-cyan-600 mb-4 text-center">注文かご</h2>
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>カートは空です</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-600">¥{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-cyan-600"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full font-bold text-cyan-600"
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
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">合計</span>
                  <span className="text-2xl font-bold text-cyan-600">
                    ¥{getTotal().toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOrder}
                disabled={loading || cart.length === 0 || orderPlaced}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg mt-4"
              >
                {loading
                  ? "送信中..."
                  : orderPlaced
                  ? "注文確定済み"
                  : "注文確定"}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* フッターナビゲーション */}
      <FooterNav activeTab={activeTab} tableNumber={tableNumber} onTabChange={setActiveTab} />
    </div>
  );
}


