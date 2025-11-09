import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { cart, tableNumber, people, total } = req.body;
  
  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: "カートが空です" });
  }
  if (!tableNumber || !people) {
    return res.status(400).json({ error: "テーブル番号または人数が不足しています" });
  }

  try {
    const orderData = {
      cart,
      tableNumber: Number(tableNumber),
      people: Number(people),
      total: total || cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: "pending",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), orderData);
    res.status(200).json({ 
      message: "注文が確定しました", 
      orderId: docRef.id,
      tableNumber: orderData.tableNumber,
    });
  } catch (error: any) {
    console.error("注文エラー:", error);
    res.status(500).json({ error: "注文の送信に失敗しました: " + (error.message || "Unknown error") });
  }
}
