import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import FooterNav from "../components/FooterNav";
import PeopleSelector from "../components/PeopleSelector";
import ConfirmDialog from "../components/ConfirmDialog";

const TABLE_NUMBER = "1";

export default function Home() {
  const [selectedPeople, setSelectedPeople] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  const handlePeopleSelect = useCallback((num: number) => {
    setSelectedPeople(num);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmYes = useCallback(() => {
    if (selectedPeople) {
      router.push(`/menu?table=${TABLE_NUMBER}&people=${selectedPeople}`);
    }
  }, [selectedPeople, router]);

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

      <FooterNav tableNumber={TABLE_NUMBER} />
    </div>
  );
}
