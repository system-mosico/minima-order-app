// 注文関連のユーティリティ関数

import { Order } from "../types";

/**
 * 注文を日時でソート（降順：新しい順）
 */
export const sortOrdersByDate = (orders: Order[]): Order[] => {
  return [...orders].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0;
    const bTime = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0;
    return bTime - aTime;
  });
};

/**
 * TimestampをDateに変換
 */
export const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date();
};

