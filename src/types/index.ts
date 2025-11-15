// 共通型定義
import { Timestamp } from "firebase/firestore";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

// 注文ステータスの定義
export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

// 注文ステータスの定数（Admin側とOrder側で共通使用）
export const ORDER_STATUS = {
  PENDING: "pending" as const,      // 注文済み（デフォルト）
  CONFIRMED: "confirmed" as const,   // 確認済み
  PREPARING: "preparing" as const,   // 調理中
  READY: "ready" as const,          // 準備完了
  COMPLETED: "completed" as const,  // 完了
  CANCELLED: "cancelled" as const,   // キャンセル
} as const;

export interface Order {
  id: string;
  cart: OrderItem[];
  tableNumber: number;              // テーブル番号（number型で統一）
  people: number;                    // 人数
  total: number;                     // 合計金額
  status: OrderStatus;               // 注文ステータス（明確な型定義）
  createdAt: Timestamp;              // 作成日時（Firebase Timestamp型で統一）
  receiptUrl?: string;                // レシートURL（オプショナル）
}

