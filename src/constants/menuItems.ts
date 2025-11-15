// メニューアイテムの定義（実際の運用ではFirebaseから取得）

import { MenuItem } from "../types";

export const MENU_ITEMS: { [key: number]: MenuItem } = {
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

