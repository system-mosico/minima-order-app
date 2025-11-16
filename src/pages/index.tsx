import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";
import PeopleSelector from "../components/PeopleSelector";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Home() {
  const [selectedPeople, setSelectedPeople] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [ownerUid, setOwnerUid] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // URLパラメータからownerUidとtableIdを取得し、テーブル情報を取得
  useEffect(() => {
    if (!router.isReady) return;

    const { ownerUid: ownerUidParam, tableId: tableIdParam } = router.query;
    
    let currentOwnerUid: string | null = null;
    if (ownerUidParam && typeof ownerUidParam === "string") {
      currentOwnerUid = ownerUidParam;
      setOwnerUid(ownerUidParam);
    }
    
    if (tableIdParam && typeof tableIdParam === "string") {
      setTableId(tableIdParam);
      // テーブル情報を取得
      fetchTableInfo(tableIdParam, currentOwnerUid);
    } else {
      setLoading(false);
    }
  }, [router.isReady, router.query]);

      // テーブル情報を取得
      const fetchTableInfo = async (id: string, uid: string | null) => {
        try {
          const tableRef = doc(db, "tables", id);
          const tableSnap = await getDoc(tableRef);
          
          if (tableSnap.exists()) {
            const tableData = tableSnap.data();
            setTableNumber(tableData.tableNumber || null);
            
            // セッションIDを取得して保存（既存のテーブルにセッションIDがない場合は生成）
            let currentSessionId = tableData.currentSessionId || null;
            if (!currentSessionId) {
              // 既存のテーブルにセッションIDがない場合は生成（マイグレーション）
              currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              // 注意: ここでは更新しない（Minima_Admin側で管理）
              console.warn("テーブルにセッションIDがありません。Minima_Admin側でセッションIDを設定してください。");
            }
            
            if (currentSessionId) {
              sessionStorage.setItem("sessionId", currentSessionId);
            }
            
            // セッションストレージに保存（他のページでも使用するため）
            if (uid) {
              sessionStorage.setItem("ownerUid", uid);
            }
            sessionStorage.setItem("tableId", id);
            sessionStorage.setItem("tableNumber", tableData.tableNumber || "");
          } else {
            console.error("テーブル情報が見つかりません");
            alert("テーブル情報が見つかりませんでした");
          }
        } catch (error: any) {
          console.error("テーブル情報取得エラー:", error);
          alert("テーブル情報の取得に失敗しました: " + (error.message || "Unknown error"));
        } finally {
          setLoading(false);
        }
      };

  const handlePeopleSelect = useCallback((num: number) => {
    setSelectedPeople(num);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmYes = useCallback(() => {
    if (selectedPeople && tableNumber) {
      // セッションストレージに人数を保存
      if (typeof window !== "undefined") {
        sessionStorage.setItem("people", selectedPeople.toString());
      }
      
      // ownerUidとtableIdも含めて遷移
      const params = new URLSearchParams({
        table: tableNumber,
        people: selectedPeople.toString(),
      });
      if (ownerUid) params.append("ownerUid", ownerUid);
      if (tableId) params.append("tableId", tableId);
      router.push(`/menu?${params.toString()}`);
    }
  }, [selectedPeople, tableNumber, ownerUid, tableId, router]);

  const handleConfirmNo = useCallback(() => {
    setShowConfirmDialog(false);
    setSelectedPeople(null);
  }, []);

  const confirmMessage = selectedPeople === 9 
    ? "9人以上でご利用ですね？" 
    : `${selectedPeople}名でご利用ですね？`;

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <Header title="何名様(全員)でご利用ですか?" />
      
      <div className="flex-1 px-4 py-8">
        <PeopleSelector onSelect={handlePeopleSelect} />
      </div>

      {showConfirmDialog && selectedPeople && (
        <ConfirmDialog
          message={confirmMessage}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      ) : (
        <>
          <FooterNav tableNumber={tableNumber || ""} />
        </>
      )}
    </div>
  );
}
