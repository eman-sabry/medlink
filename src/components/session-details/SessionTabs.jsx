import { useState } from "react";
import { LayoutGrid, ClipboardList, Stethoscope, FileText, History, Receipt } from "lucide-react";
import { TabToggleGroup } from "../ui/TabToggleGroup";
import { OverviewTab } from "./OverviewTab";
import { AssessmentTab } from "./AssessmentTab";
import { TreatmentTab } from "./TreatmentTab";
import { PrescriptionTab } from "./PrescriptionTab";

import { HistoryTab } from "./HistoryTab";
import { BillingTab } from "./BillingTab";

const EMPTY_CLINICAL_NOTES = {
  assessment: "",
  symptoms: "",
  painLevel: 0,
  rangeOfMotion: "",
  treatmentPerformed: "",
  exercises: "",
  observations: "",
  progress: "",
  recommendations: "",
};
const EMPTY_MEDICINE = { name: "", dosage: "", frequency: "", duration: "" };

const TABS = [
  { key: "overview", label: "نظرة عامة", icon: LayoutGrid },
  { key: "assessment", label: "التقييم", icon: ClipboardList },
  { key: "treatment", label: "العلاج والملاحظات", icon: Stethoscope },
  { key: "prescription", label: "الروشتة", icon: FileText },
  { key: "history", label: "السجل", icon: History },
  { key: "billing", label: "الفاتورة", icon: Receipt },
];

export function SessionTabs({
  patient,
  medicalHistory,
  appointment,
  doctor,
  service,
  room,
  bed,
  rooms,
  beds,
  onAssignRoom,
  onAssignBed,
  patientPackages,
  isCompleted,
  existingUsageForSession,
  treatmentSession,
  onSaveClinicalNotes,
  isSavingClinicalNotes,
  onSavePrescription,
  isSavingPrescription,
  onPrintPrescription,
  previousSessions,
  sessionActivity,
  invoice,
  coveringPackageForSession,
  onPrintInvoice,
  canEdit,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const [clinicalForm, setClinicalForm] = useState(() => ({
    ...EMPTY_CLINICAL_NOTES,
    ...treatmentSession?.clinical_notes,
  }));
  const updateClinical = (key, value) => setClinicalForm((prev) => ({ ...prev, [key]: value }));

  const [diagnosis, setDiagnosis] = useState(() => treatmentSession?.prescription?.diagnosis ?? "");
  const [prescriptionNotes, setPrescriptionNotes] = useState(() => treatmentSession?.prescription?.notes ?? "");
  const [medicines, setMedicines] = useState(() =>
    treatmentSession?.prescription?.medicines?.length
      ? treatmentSession.prescription.medicines
      : [{ ...EMPTY_MEDICINE }],
  );

  const hasPrescription = Boolean(treatmentSession?.prescription?.diagnosis);

  const handleSavePrescription = () => {
    if (!diagnosis.trim()) return;
    onSavePrescription({
      diagnosis: diagnosis.trim(),
      notes: prescriptionNotes.trim(),
      medicines: medicines.filter((m) => m.name.trim()),
    });
  };

  return (
    <div className="space-y-5">
      <TabToggleGroup
        tabs={TABS}
        value={activeTab}
        onChange={setActiveTab}
        className="flex-wrap"
      />

      {activeTab === "overview" && (
        <OverviewTab
          patient={patient}
          medicalHistory={medicalHistory}
          appointment={appointment}
          doctor={doctor}
          service={service}
          room={room}
          bed={bed}
          rooms={rooms}
          beds={beds}
          onAssignRoom={onAssignRoom}
          onAssignBed={onAssignBed}
          patientPackages={patientPackages}
          isCompleted={isCompleted}
          existingUsageForSession={existingUsageForSession}
        />
      )}

      {activeTab === "assessment" && (
        <AssessmentTab
          form={clinicalForm}
          onChange={updateClinical}
          onSave={() => onSaveClinicalNotes(clinicalForm)}
          isSaving={isSavingClinicalNotes}
          canEdit={canEdit}
        />
      )}

      {activeTab === "treatment" && (
        <TreatmentTab
          form={clinicalForm}
          onChange={updateClinical}
          onSave={() => onSaveClinicalNotes(clinicalForm)}
          isSaving={isSavingClinicalNotes}
          canEdit={canEdit}
        />
      )}

      {activeTab === "prescription" && (
        <PrescriptionTab
          diagnosis={diagnosis}
          setDiagnosis={setDiagnosis}
          notes={prescriptionNotes}
          setNotes={setPrescriptionNotes}
          medicines={medicines}
          setMedicines={setMedicines}
          hasPrescription={hasPrescription}
          onSave={handleSavePrescription}
          isSaving={isSavingPrescription}
          onPrint={onPrintPrescription}
          canEdit={canEdit}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          previousSessions={previousSessions}
          sessionActivity={sessionActivity}
        />
      )}

      {activeTab === "billing" && (
        <BillingTab
          invoice={invoice}
          coveringPackage={coveringPackageForSession}
          onPrintInvoice={onPrintInvoice}
        />
      )}
    </div>
  );
}
