// 注文関連のユーティリティ関数

import { Order, OrderStatus, ORDER_STATUS } from "../types";
import { Timestamp } from "firebase/firestore";

/**
 * 注文を日時でソート（降順：新しい順）
 */
export const sortOrdersByDate = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
};

/**
 * TimestampをDateに変換
 */
export const timestampToDate = (timestamp: Timestamp): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  // フォールバック（互換性のため）
  if ((timestamp as any)?.seconds) {
    return new Date((timestamp as any).seconds * 1000);
  }
  return new Date();
};

/**
 * ステータスの日本語表示名を取得
 */
export const getStatusLabel = (status: OrderStatus): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "注文済み";
    case ORDER_STATUS.CONFIRMED:
      return "確認済み";
    case ORDER_STATUS.PREPARING:
      return "調理中";
    case ORDER_STATUS.READY:
      return "準備完了";
    case ORDER_STATUS.COMPLETED:
      return "完了";
    case ORDER_STATUS.CANCELLED:
      return "キャンセル";
    default:
      return status;
  }
};

/**
 * ステータスの色クラスを取得（Tailwind CSS用）
 */
export const getStatusColorClass = (status: OrderStatus): string => {
  switch (status) {
    case ORDER_STATUS.PENDING:
      return "bg-yellow-100 text-yellow-800";
    case ORDER_STATUS.CONFIRMED:
      return "bg-blue-100 text-blue-800";
    case ORDER_STATUS.PREPARING:
      return "bg-orange-100 text-orange-800";
    case ORDER_STATUS.READY:
      return "bg-green-100 text-green-800";
    case ORDER_STATUS.COMPLETED:
      return "bg-gray-100 text-gray-800";
    case ORDER_STATUS.CANCELLED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

