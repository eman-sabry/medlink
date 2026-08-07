import { useState } from "react";
import { useSessionMedicines } from "../hooks/useSessionMedicines";
import { toast } from "../utils/toast";
import { SESSION_TABS } from "../helpers/sessionDetails.helpers";
import { TabBar } from "../components/session-details/TabBar";
import { PatientSummaryCard } from "../components/session-details/PatientSummaryCard";
import { AssessmentTab } from "../components/session-details/AssessmentTab";
import { PrescriptionTab } from "../components/session-details/PrescriptionTab";
import { HistoryTab } from "../components/session-details/HistoryTab";
import { PatientInfoTab } from "../components/session-details/PatientInfoTab";

export default function SessionDetailsPage({ sessionData, onBack }) {
  const [activeTab, setActiveTab] = useState("assessment");

  const [painScale, setPainScale] = useState(4);
  const [romScale, setRomScale] = useState(70);
  const [strengthScale, setStrengthScale] = useState(70);
  const [clinicalNotes, setClinicalNotes] = useState(
    "تحسن ملحوظ في حركة المفصل مع التزام تام بالتمارين المنزلية.",
  );
  const [instructions, setInstructions] = useState(
    "إجهاد المفصل المصاب.\nالكمادات الباردة عند وجود تورم.\nالتمارين المنزلية الموصوفة بانتظام.",
  );

  const { medicines, addMedicine, updateMedicine, deleteMedicine } =
    useSessionMedicines([
      {
        id: 1,
        name: "مسكن ومضاد للالتهاب (عند الحاجة)",
        dose: "قرص واحد",
        duration: "5 أيام",
        notes: "بعد الأكل",
      },
    ]);

  const handleSaveAssessment = () => {
    toast.success("تمت إضافة الملاحظة الطبية بنجاح");
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto text-right font-sans bg-background min-h-screen">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/25 transition-all cursor-pointer"
        >
          ← العودة لقائمة الجلسات
        </button>
      )}

      <PatientSummaryCard sessionData={sessionData} />

      <TabBar tabs={SESSION_TABS} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "assessment" && (
        <AssessmentTab
          painScale={painScale}
          setPainScale={setPainScale}
          romScale={romScale}
          setRomScale={setRomScale}
          strengthScale={strengthScale}
          setStrengthScale={setStrengthScale}
          clinicalNotes={clinicalNotes}
          setClinicalNotes={setClinicalNotes}
          onSaveAssessment={handleSaveAssessment}
        />
      )}

      {activeTab === "prescription" && (
        <PrescriptionTab
          patientName={sessionData?.patient_name}
          medicines={medicines}
          onAddMedicine={addMedicine}
          onChangeMedicine={updateMedicine}
          onDeleteMedicine={deleteMedicine}
          instructions={instructions}
          setInstructions={setInstructions}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab doctorName={sessionData?.doctor_name} />
      )}

      {activeTab === "patient" && <PatientInfoTab sessionData={sessionData} />}
    </div>
  );
}
