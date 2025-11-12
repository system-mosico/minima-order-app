import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // URLパラメータからテーブル番号を取得
    const { table } = router.query;
    
    if (table && typeof table === "string") {
      // テーブル番号が取得できたら人数入力ページへ自動遷移
      router.push(`/people?table=${table}`);
    } else if (router.isReady) {
      // テーブル番号が取得できない場合（QRコードが読み取られていない場合）
      // エラーメッセージを表示
      alert("テーブルのQRコードを読み取ってアクセスしてください");
    }
  }, [router.query, router.isReady]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-cyan-600 mb-4">Minima Order</h1>
        <p className="text-gray-600">読み込み中...</p>
      </div>
    </div>
  );
}
