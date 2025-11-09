import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { tableNumber } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ error: "Table number is required" });
    }

    res.status(200).json({ message: "Table number received", tableNumber });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
