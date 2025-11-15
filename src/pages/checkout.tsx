import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { OrderItem, Order } from "../types";
import { sortOrdersByDate, timestampToDate } from "../utils/orderUtils";
import pdfMake, { loadJapaneseFont } from "../utils/pdfFonts";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";

export default function Checkout() {
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [generatingReceipt, setGeneratingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = useCallback(async (table: string) => {
    setLoading(true);
    try {
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
      const sortedOrders = sortOrdersByDate(ordersData);
      setOrders(sortedOrders);
      // 既存のレシートURLがある場合は設定（互換性のため）
      if (sortedOrders.length > 0 && sortedOrders[0].receiptUrl) {
        setReceiptUrl(sortedOrders[0].receiptUrl);
      }
    } catch (error: any) {
      console.error("注文取得エラー:", error);
      alert("注文データの取得に失敗しました: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { table } = router.query;
    if (table && typeof table === "string") {
      setTableNumber(table);
      fetchOrders(table);
    }
  }, [router.query, fetchOrders]);

  const handlePaymentCompleted = async () => {
    setPaymentCompleted(true);
  };

  const generateReceiptPDF = async (): Promise<string | null> => {
    if (orders.length === 0) return null;

    try {
      console.log("レシート生成開始");
      
      // 日本語フォントを読み込む
      await loadJapaneseFont();

      const firstOrder = orders[0];
      const createdAt = timestampToDate(firstOrder.createdAt);
      const dateStr = createdAt.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      // 合計金額を計算
      let totalAmount = 0;
      const orderItems: any[] = [];
      orders.forEach((order) => {
        order.cart.forEach((item) => {
          const subtotal = item.price * item.quantity;
          totalAmount += subtotal;
          orderItems.push({
            text: [
              { text: item.name, font: "NotoSansJP" },
              "\n",
              {
                text: `数量: ${item.quantity} × ¥${item.price.toLocaleString()} = ¥${subtotal.toLocaleString()}`,
                fontSize: 10,
                font: "NotoSansJP",
              },
            ],
            margin: [0, 0, 0, 8],
          });
        });
      });

      // PDF定義
      const docDefinition = {
        pageSize: "A4" as const,
        pageOrientation: "portrait" as const,
        pageMargins: [20, 20, 20, 20] as [number, number, number, number],
        defaultStyle: {
          font: "NotoSansJP",
          fontSize: 12,
        },
        content: [
          // 店舗名
          {
            text: "Minima Order",
            fontSize: 16,
            alignment: "center",
            margin: [0, 0, 0, 10],
            font: "NotoSansJP",
          },
          // 注文日時
          {
            text: `注文日時: ${dateStr}`,
            fontSize: 12,
            margin: [0, 0, 0, 8],
            font: "NotoSansJP",
          },
          // テーブル番号
          {
            text: `テーブル番号: ${firstOrder.tableNumber}`,
            fontSize: 12,
            margin: [0, 0, 0, 10],
            font: "NotoSansJP",
          },
          // 注文一覧ヘッダー
          {
            text: "注文一覧",
            fontSize: 12,
            margin: [0, 0, 0, 8],
            font: "NotoSansJP",
          },
          // 注文アイテム
          ...orderItems,
          // 区切り線
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 0,
                x2: 515,
                y2: 0,
                lineWidth: 1,
              },
            ],
            margin: [0, 5, 0, 8],
          },
          // 合計金額
          {
            text: `合計金額: ¥${totalAmount.toLocaleString()}(税込)`,
            fontSize: 14,
            bold: true,
            margin: [0, 0, 0, 10],
            font: "NotoSansJP",
          },
          // 注文ID
          {
            text: `注文ID: ${firstOrder.id}`,
            fontSize: 10,
            margin: [0, 0, 0, 10],
            font: "NotoSansJP",
          },
          // デジタルレシート注記
          {
            text: "※これはデジタルレシートです",
            fontSize: 10,
            font: "NotoSansJP",
          },
        ],
      };

      // createPdf()の前にvfsが正しく設定されているか確認・再設定
      const pdfMakeInstance = pdfMake as any;
      const pdfFontsVfs = pdfFonts as any;
      if (pdfFontsVfs) {
        // vfsにフォントが追加されているか確認
        if (!pdfFontsVfs["NotoSansJP-Regular.ttf"]) {
          console.warn("vfsにフォントが見つかりません。再設定します。");
          // フォントを再読み込み
          await loadJapaneseFont();
        }
        // pdfMake.vfsをpdfFontsと同じ参照に設定
        pdfMakeInstance.vfs = pdfFontsVfs;
      }
      
      // PDFを生成してBlobに変換
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      const pdfBlob = await new Promise<Blob>((resolve, reject) => {
        try {
          pdfDocGenerator.getBlob((blob: Blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("PDF Blobの生成に失敗しました"));
            }
          });
        } catch (error) {
          reject(error);
        }
      });
      // Blob URLを生成して即座に表示可能にする（Storage不要、完全無料）
      const blobUrl = URL.createObjectURL(pdfBlob);

      // Blob URLを返す（Storage不要）
      return blobUrl;
    } catch (error: any) {
      console.error("レシート生成エラー:", error);
      console.error("エラー詳細:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      throw error;
    }
  };

  const handleShowReceipt = async () => {
    if (orders.length === 0) return;

    setGeneratingReceipt(true);
    setReceiptError(null);
    setReceiptUrl(null);
    
    try {
      console.log("レシート表示処理開始");
      const firstOrder = orders[0];
      let url: string | null = firstOrder.receiptUrl || null;

      // URLが存在しない場合は生成
      if (!url) {
        console.log("レシートURLが存在しないため、生成を開始");
        url = await generateReceiptPDF();
        console.log("レシート生成完了、URL:", url);
        
        // 生成されたURLをstateに保存
        if (url) {
          setReceiptUrl(url);
          // ordersの状態も更新
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === firstOrder.id ? { ...order, receiptUrl: url || undefined } : order
            )
          );
        }
      } else {
        console.log("既存のレシートURLを使用:", url);
        setReceiptUrl(url);
      }

      if (url) {
        console.log("PDFを新しいタブで開く");
        // 新しいタブでPDFを開く
        const newWindow = window.open(url, "_blank");
        if (!newWindow) {
          console.warn("ポップアップがブロックされました");
          setReceiptError("ポップアップがブロックされました。ブラウザの設定を確認してください。");
        }
      } else {
        console.error("レシートURLが取得できませんでした");
        setReceiptError("レシートの生成に失敗しました（URLが取得できませんでした）");
      }
    } catch (error: any) {
      console.error("レシート表示エラー:", error);
      console.error("エラー詳細:", {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
      });
      const errorMessage = error.message || error.code || "Unknown error";
      setReceiptError(`レシートの生成に失敗しました: ${errorMessage}`);
    } finally {
      console.log("レシート表示処理完了");
      setGeneratingReceipt(false);
    }
  };

  // 全注文の合計金額を計算
  const getTotalAmount = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  // 全注文のアイテム数を計算
  const getTotalItems = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.cart.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  }, [orders]);

  // 全注文のアイテムをフラット化
  const getAllItems = useMemo((): OrderItem[] => {
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
  }, [orders]);

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
                {getAllItems.map((item) => {
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
                    {getTotalItems}点
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    合計 ¥{getTotalAmount.toLocaleString()}(税込)
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
            <div className="px-4 py-4 bg-white border-t border-gray-200 space-y-3">
              <button
                onClick={handleShowReceipt}
                disabled={generatingReceipt}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg text-lg transition-colors"
              >
                {generatingReceipt ? "レシートを生成中..." : "レシートを表示する"}
              </button>
              
              {/* エラーメッセージ */}
              {receiptError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm font-semibold">{receiptError}</p>
                </div>
              )}
              
              {/* PDFのURLリンク */}
              {receiptUrl && !generatingReceipt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm font-semibold mb-2">レシートPDFのURL:</p>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all text-xs"
                  >
                    {receiptUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* フッターナビゲーション */}
      <FooterNav tableNumber={tableNumber} />
    </div>
  );
}
