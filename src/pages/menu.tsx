import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { CartItem, Order, MenuItem, ORDER_STATUS } from "../types";
import { MENU_ITEMS } from "../constants/menuItems";
import { sortOrdersByDate } from "../utils/orderUtils";
import Header from "../components/Header";
import NumberInput from "../components/NumberInput";
import TenKey from "../components/TenKey";
import FooterNav from "../components/FooterNav";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Menu() {
  const [menuNumber, setMenuNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [people, setPeople] = useState<number | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("add");
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string; price: number } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // router.isReadyがtrueになった時点で、URLパラメータからタブを設定（最初に実行）
  useEffect(() => {
    if (router.isReady) {
      const { tab } = router.query;
      if (tab && typeof tab === "string" && (tab === "add" || tab === "cart" || tab === "history")) {
        setActiveTab(tab);
      }
    }
  }, [router.isReady, router.query.tab]);

  useEffect(() => {
    const { table, people: peopleParam } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
    }
    if (peopleParam && typeof peopleParam === "string") {
      setPeople(Number(peopleParam));
    }
  }, [router.query]);

  useEffect(() => {
    if (activeTab === "history" && tableNumber) {
      fetchOrderHistory();
    }
  }, [activeTab, tableNumber]);

  // タブが切り替わった時に注文確定メッセージを非表示にする
  useEffect(() => {
    if (activeTab !== "cart" && orderPlaced) {
      setOrderPlaced(false);
    }
  }, [activeTab]);

  const fetchOrderHistory = useCallback(async () => {
    if (!tableNumber) return;
    
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("tableNumber", "==", Number(tableNumber))
      );
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        orders.push({
          id: doc.id,
          ...data,
          // statusが存在しない場合はデフォルト値を設定（既存データとの互換性）
          status: data.status || ORDER_STATUS.PENDING,
        } as Order);
      });
      setOrderHistory(sortOrdersByDate(orders));
    } catch (error: any) {
      console.error("注文履歴取得エラー:", error);
      alert("注文履歴の取得に失敗しました: " + (error.message || "Unknown error"));
    } finally {
      setLoadingHistory(false);
    }
  }, [tableNumber]);

  const addToCart = useCallback(() => {
    const num = Number(menuNumber);
    if (!num || !MENU_ITEMS[num]) {
      alert("メニュー番号が見つかりません");
      setMenuNumber("");
      return;
    }

    const item = MENU_ITEMS[num];
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
  }, [menuNumber, cart]);

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart.map((item: CartItem) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item: CartItem) => item.id !== id));
  };

  const getTotal = useMemo(() => {
    return cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const handleOrder = async () => {
    // 数量が0より大きいアイテムがあるかチェック
    const hasValidItems = cart.some((item) => item.quantity > 0);
    if (!hasValidItems) {
      alert("カートが空です");
      return;
    }
    if (!tableNumber || !people) {
      alert("テーブル番号または人数が取得できませんでした");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmOrder = async () => {
    setShowConfirmDialog(false);
    setLoading(true);
    try {
      // 数量が0より大きいアイテムのみを注文に含める
      const validCartItems = cart.filter((item) => item.quantity > 0);
      
      // 有効なアイテムがない場合は注文を送信しない（メッセージは表示しない）
      if (validCartItems.length === 0) {
        setLoading(false);
        return;
      }

      const orderData = {
        cart: validCartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        tableNumber: Number(tableNumber),
        people: people,
        total: getTotal,
        status: ORDER_STATUS.PENDING,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      setOrderPlaced(true);
      setCart([]);
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

  const getCartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* タブ切り替え表示 */}
      {activeTab === "add" && (
        <>
          <Header title="メニュー帳の番号を入力してください" />
          
          {/* ロゴエリア / 商品名表示エリア（高さ固定） */}
          <div className="py-4 px-4 min-h-[140px] flex flex-col justify-center">
            {menuNumber && MENU_ITEMS[Number(menuNumber)] ? (
              <div className="space-y-3">
                <div className="bg-green-100 px-4 py-3 rounded-lg">
                  <p className="text-xl font-bold text-green-600 text-left">
                    {MENU_ITEMS[Number(menuNumber)].name}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const item = MENU_ITEMS[Number(menuNumber)];
                      setSelectedItem(item);
                      setQuantity(1);
                      setActiveTab("quantity");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                  >
                    次へ進む
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-block border-2 border-green-600 rounded-full px-8 py-6">
                  <h1 className="text-2xl font-bold text-green-600">Minima Order</h1>
                </div>
              </div>
            )}
          </div>

          {/* 番号入力ボックス */}
          <NumberInput value={menuNumber} placeholder="メニュー番号" />

          {/* テンキー */}
          <div className="flex-1">
            <TenKey
              value={menuNumber}
              onChange={setMenuNumber}
              onDelete={handleDelete}
              maxLength={3}
            />
          </div>
        </>
      )}

      {activeTab === "quantity" && selectedItem && (
        <>
          <Header title="数量を選択してください。" />
          
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
            {/* 商品名と価格（数量選択の直上） */}
            <div className="flex justify-between items-center w-full max-w-md px-4 py-4 mb-4">
              <p className="text-xl font-bold text-green-600 text-left">
                {selectedItem.name}
              </p>
              <p className="text-xl font-bold text-gray-800 text-right">
                ¥{(selectedItem.price * quantity).toLocaleString()}
              </p>
            </div>

            {/* 数量選択（画面中央） */}
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-16 h-16 bg-green-600 text-white rounded-lg font-bold text-3xl flex items-center justify-center active:bg-green-700 transition-colors"
              >
                −
              </button>
              <div className="w-24 h-16 bg-white border-2 border-green-600 rounded-lg flex items-center justify-center">
                <span className="text-4xl font-bold text-green-600">{quantity}</span>
              </div>
              <button
                onClick={() => setQuantity(Math.min(9, quantity + 1))}
                className="w-16 h-16 bg-green-600 text-white rounded-lg font-bold text-3xl flex items-center justify-center active:bg-green-700 transition-colors"
              >
                ＋
              </button>
            </div>

            {/* ボタンエリア（数量選択の直下） */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setQuantity(1);
                  setActiveTab("add");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-4 rounded-lg text-lg transition-colors"
              >
                戻る
              </button>
              <button
                onClick={() => {
                  const existingItem = cart.find((cartItem) => cartItem.id === selectedItem.id);
                  
                  if (existingItem) {
                    setCart(
                      cart.map((cartItem) =>
                        cartItem.id === selectedItem.id
                          ? { ...cartItem, quantity: cartItem.quantity + quantity }
                          : cartItem
                      )
                    );
                  } else {
                    setCart([...cart, { ...selectedItem, quantity: quantity }]);
                  }
                  setSelectedItem(null);
                  setQuantity(1);
                  setMenuNumber("");
                  setActiveTab("cart");
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-lg transition-colors"
              >
                注文かごへ追加する
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "cart" && (
        <>
          <Header title="他に注文があれば「追加」、なければ「注文」" />
          
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>カートは空です</p>
              </div>
            ) : (
              <div className="space-y-3 max-w-md mx-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{item.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-10 h-10 bg-green-600 text-white rounded font-bold text-lg flex items-center justify-center"
                        >
                          −
                        </button>
                        <div className="w-12 h-10 bg-white border border-gray-300 rounded flex items-center justify-center font-semibold text-lg">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-10 h-10 bg-green-600 text-white rounded font-bold text-lg flex items-center justify-center"
                        >
                          ＋
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t-2 border-gray-300 mt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-800">
                      {cart.filter((item) => item.quantity > 0).length}点
                    </span>
                    <span className="font-bold text-gray-800">
                      合計 {getTotal.toLocaleString()}円(税込)
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button
                    onClick={() => setActiveTab("add")}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg transition-colors"
                  >
                    追加
                  </button>
                  <button
                    onClick={handleOrder}
                    disabled={loading || !cart.some((item) => item.quantity > 0) || orderPlaced}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg text-lg transition-colors"
                  >
                    {loading
                      ? "送信中..."
                      : orderPlaced
                      ? "注文済み"
                      : "注文"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "history" && (
        <>
          <div className="sticky top-0 z-50">
            <Header title="お帰りの際は[お会計へ進む]をタップ" />
            {/* 注文リストヘッダー */}
            <div className="sticky top-[56px] z-40 bg-gray-200 px-4 py-2 grid grid-cols-3 gap-2 text-sm font-semibold text-gray-700 border-b border-gray-300">
              <div>メニュー名</div>
              <div className="text-center">数量</div>
              <div className="text-right">価格</div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-100 pb-20">
            {loadingHistory ? (
              <div className="text-center py-12 text-gray-500">
                <p>読み込み中...</p>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>注文履歴がありません</p>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-white">
                
                {/* メニューアイテムリスト（すべての注文履歴をまとめて表示） */}
                <div className="divide-y divide-gray-200">
                  {orderHistory.flatMap((order) =>
                    order.cart.map((item, index) => (
                      <div key={`${order.id}-${index}`} className="px-4 py-3 grid grid-cols-3 gap-2 text-sm">
                        <div className="text-gray-800">{item.name}</div>
                        <div className="text-center text-gray-800">{item.quantity}</div>
                        <div className="text-right text-gray-800">
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* 注文サマリー（全体の合計） */}
                <div className="px-4 py-4 border-t-2 border-gray-300 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {orderHistory.reduce((sum, order) => 
                      sum + order.cart.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
                    )}点
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    合計 {orderHistory.reduce((sum, order) => sum + order.total, 0).toLocaleString()}円(税込)
                  </span>
                </div>
                
                {/* お会計へ進むボタン */}
                <div className="px-4 pb-4">
                  <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg text-lg transition-colors"
                    onClick={() => {
                      setShowCheckoutDialog(true);
                    }}
                  >
                    お会計へ進む
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          message="ご注文はすべて入力済みですか？送信します。"
          onConfirm={confirmOrder}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}

      {/* 注文確定メッセージ */}
      {orderPlaced && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 w-full shadow-2xl border-2 border-green-600 pointer-events-auto">
            <p className="text-center text-2xl font-bold text-green-600">
              ご注文ありがとうございます
            </p>
          </div>
        </div>
      )}

      {showCheckoutDialog && (
        <ConfirmDialog
          message="お会計に進みますか？"
          onConfirm={() => {
            setShowCheckoutDialog(false);
            if (tableNumber) {
              router.push(`/checkout?table=${tableNumber}`);
            } else {
              alert("テーブル番号が取得できませんでした");
            }
          }}
          onCancel={() => setShowCheckoutDialog(false)}
        />
      )}
      
      {/* フッターナビゲーション */}
      <FooterNav 
        activeTab={activeTab} 
        tableNumber={tableNumber} 
        onTabChange={setActiveTab}
        cartCount={getCartItemCount}
      />
    </div>
  );
}
