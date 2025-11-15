import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db, storage } from "../firebase/config";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { jsPDF } from "jspdf";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  cart: OrderItem[];
  tableNumber: number;
  people: number;
  total: number;
  status: string;
  createdAt: any;
  receiptUrl?: string;
}

export default function Checkout() {
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
      fetchOrders(table);
    }
  }, [router.query]);

  const fetchOrders = async (table: string) => {
    setLoading(true);
    try {
      // インデックス不要: whereのみで取得し、クライアント側でソート
      const q = query(
        collection(db, "orders"),
        where("tableNumber", "==", Number(table))
      );
      const querySnapshot = await getDocs(q);
      const ordersData: Order[] = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data(),
        } as Order);
      });
      // クライアント側でソート（createdAtがTimestampの場合）
      ordersData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
        const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
        return bTime - aTime; // 降順（新しい順）
      });
      setOrders(ordersData);
    } catch (error: any) {
      console.error("注文取得エラー:", error);
      alert("注文データの取得に失敗しました: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCompleted = async () => {
    setPaymentCompleted(true);
  };

  const generateReceiptPDF = async (): Promise<string | null> => {
    if (orders.length === 0) return null;

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // フォントサイズ設定
      const fontSize = 12;
      const smallFontSize = 10;
      let yPos = 20;

      // 店舗名
      doc.setFontSize(16);
      doc.text("Minima Order", 105, yPos, { align: "center" });
      yPos += 10;

      // 注文日時
      doc.setFontSize(fontSize);
      const firstOrder = orders[0];
      const createdAt = firstOrder.createdAt?.toDate?.() || new Date(firstOrder.createdAt?.seconds * 1000 || Date.now());
      const dateStr = createdAt.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`注文日時: ${dateStr}`, 20, yPos);
      yPos += 8;

      // テーブル番号
      doc.text(`テーブル番号: ${firstOrder.tableNumber}`, 20, yPos);
      yPos += 10;

      // 注文一覧ヘッダー
      doc.setFontSize(fontSize);
      doc.text("注文一覧", 20, yPos);
      yPos += 8;

      // 注文アイテム
      doc.setFontSize(smallFontSize);
      let totalAmount = 0;
      orders.forEach((order) => {
        order.cart.forEach((item) => {
          const subtotal = item.price * item.quantity;
          totalAmount += subtotal;
          doc.text(`${item.name}`, 25, yPos);
          doc.text(`数量: ${item.quantity} × ¥${item.price.toLocaleString()} = ¥${subtotal.toLocaleString()}`, 25, yPos + 5);
          yPos += 10;
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
        });
      });

      yPos += 5;
      doc.setFontSize(fontSize);
      doc.text("────────────────────────", 20, yPos);
      yPos += 8;

      // 合計金額
      doc.setFontSize(14);
      doc.text(`合計金額: ¥${totalAmount.toLocaleString()}(税込)`, 20, yPos);
      yPos += 10;

      // 注文ID
      doc.setFontSize(smallFontSize);
      doc.text(`注文ID: ${firstOrder.id}`, 20, yPos);
      yPos += 10;

      // デジタルレシート注記
      doc.setFontSize(smallFontSize);
      doc.text("※これはデジタルレシートです", 20, yPos);

      // PDFをBlobに変換
      const pdfBlob = doc.output("blob");

      // Firebase Storageにアップロード
      const fileName = `receipts/${firstOrder.id}_${Date.now()}.pdf`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, pdfBlob);

      // ダウンロードURLを取得
      const downloadURL = await getDownloadURL(storageRef);

      // Firestoreの注文データにレシートURLを保存
      await updateDoc(doc(db, "orders", firstOrder.id), {
        receiptUrl: downloadURL,
      });

      return downloadURL;
    } catch (error: any) {
      console.error("レシート生成エラー:", error);
      throw error;
    }
  };

  const handleShowReceipt = async () => {
    if (orders.length === 0) return;

    setGeneratingReceipt(true);
    try {
      const firstOrder = orders[0];
      let receiptUrl = firstOrder.receiptUrl;

      // URLが存在しない場合は生成
      if (!receiptUrl) {
        receiptUrl = await generateReceiptPDF();
      }

      if (receiptUrl) {
        // 新しいタブでPDFを開く
        window.open(receiptUrl, "_blank");
      } else {
        alert("レシートの生成に失敗しました");
      }
    } catch (error: any) {
      console.error("レシート表示エラー:", error);
      alert("レシートの生成に失敗しました: " + (error.message || "Unknown error"));
    } finally {
      setGeneratingReceipt(false);
    }
  };

  // 全注文の合計金額を計算
  const getTotalAmount = () => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  };

  // 全注文のアイテム数を計算
  const getTotalItems = () => {
    return orders.reduce((sum, order) => sum + order.cart.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  };

  // 全注文のアイテムをフラット化
  const getAllItems = (): OrderItem[] => {
    const itemMap = new Map<number, OrderItem>();
    orders.forEach((order) => {
      order.cart.forEach((item) => {
        const existing = itemMap.get(item.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemMap.set(item.id, { ...item });
        }
      });
    });
    return Array.from(itemMap.values());
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Header title="この画面をレジでお知らせください" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">注文データがありません</p>
        </div>
      ) : (
        <>
          {/* 注文詳細一覧 */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-100">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm">
              <div className="divide-y divide-gray-200">
                {getAllItems().map((item) => {
                  const subtotal = item.price * item.quantity;
                  return (
                    <div key={item.id} className="px-4 py-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-base font-semibold text-gray-800 flex-1">{item.name}</p>
                        <p className="text-base font-semibold text-gray-800 ml-2">
                          ¥{subtotal.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ¥{item.price.toLocaleString()}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* 合計金額 */}
              <div className="px-4 py-4 border-t-2 border-gray-300 bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold text-gray-800">
                    {getTotalItems()}点
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    合計 ¥{getTotalAmount().toLocaleString()}(税込)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 支払い完了済みボタン（支払い完了前のみ表示） */}
          {!paymentCompleted && (
            <div className="px-4 py-4 bg-white border-t border-gray-200">
              <button
                onClick={handlePaymentCompleted}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg text-lg transition-colors"
              >
                支払い完了済み
              </button>
            </div>
          )}

          {/* レシート表示ボタン（支払い完了後に表示） */}
          {paymentCompleted && (
            <div className="px-4 py-4 bg-white border-t border-gray-200">
              <button
                onClick={handleShowReceipt}
                disabled={generatingReceipt}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg text-lg transition-colors"
              >
                {generatingReceipt ? "レシートを生成中..." : "レシートを表示する"}
              </button>
            </div>
          )}
        </>
      )}

      {/* フッターナビゲーション */}
      <FooterNav tableNumber={tableNumber} />
    </div>
  );
}
