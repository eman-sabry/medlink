import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  LayoutGrid,
  HeartPulse,
  CalendarDays,
  Activity,
  FileText,
  PhoneCall,
  Wallet,
  History,
} from "lucide-react";
import { usePatientProfile } from "../hooks/usePatientProfile";
import { usePatientPackages } from "../hooks/usePatientPackages";
import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../permissions/permissions";
import { AssignPackageModal } from "../components/patients/AssignPackageModal";
import { PatientHeader } from "../components/patients/details/PatientHeader";
import { PatientOverview } from "../components/patients/details/PatientOverview";
import { PatientMedicalInfo } from "../components/patients/details/PatientMedicalInfo";
import { PatientAppointmentHistory } from "../components/patients/details/PatientAppointmentHistory";
import { PatientSessionHistory } from "../components/patients/details/PatientSessionHistory";
import { PatientPrescriptions } from "../components/patients/details/PatientPrescriptions";
import { PatientFollowUps } from "../components/patients/details/PatientFollowUps";
import { PatientFinancialSummary } from "../components/patients/details/PatientFinancialSummary";
import { PatientActivityTimeline } from "../components/patients/details/PatientActivityTimeline";
import { TabToggleGroup } from "../components/ui/TabToggleGroup";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";

function PatientDetailsSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-muted" />
    </div>
  );
}

export default function PatientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const canViewBilling = hasPermission(user || role, "billing:view");
  const canAssignPackage = hasPermission(user || role, "packages:assign");
  const [activeTab, setActiveTab] = useState("overview");
  const [isAssignPackageOpen, setIsAssignPackageOpen] = useState(false);

  const { packageTemplates, assignPackage, isAssigning: isAssigningPackage } = usePatientPackages();

  const {
    isLoading,
    isError,
    refetch,
    patient,
    age,
    doctors,
    appointments,
    sessions,
    currentOccupancy,
    medicalHistory,
    followUps,
    internalNotes,
    reassessments,
    packages,
    invoices,
    services,
    prescriptions,
    stats,
    activityTimeline,
    updatePatient,
    addAppointment,
    updateAppointment,
    addPrescription,
    addInternalNote,
  } = usePatientProfile(id);

  if (isLoading && !patient) {
    return <PatientDetailsSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState message="تعذّر تحميل بيانات المريض. تأكد من تشغيل JSON Server." onRetry={refetch} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <EmptyState message="لم يتم العثور على هذا المريض" />
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="text-sm font-bold text-primary hover:underline cursor-pointer"
        >
          العودة لقائمة المرضى
        </button>
      </div>
    );
  }

  const hasFinancialData = canViewBilling && (invoices.length > 0 || packages.length > 0);

  const tabs = [
    { key: "overview", label: "نظرة عامة", icon: LayoutGrid },
    { key: "medical", label: "المعلومات الطبية", icon: HeartPulse },
    { key: "appointments", label: "المواعيد", icon: CalendarDays },
    { key: "sessions", label: "الجلسات", icon: Activity },
    { key: "prescriptions", label: "الروشتات", icon: FileText },
    { key: "followups", label: "المتابعات", icon: PhoneCall },
    ...(hasFinancialData ? [{ key: "financial", label: "الماليات", icon: Wallet }] : []),
    { key: "activity", label: "سجل النشاط", icon: History },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      <button
        type="button"
        onClick={() => navigate("/patients")}
        className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-all cursor-pointer"
      >
        <ArrowRight className="h-3.5 w-3.5" />
        العودة لقائمة المرضى
      </button>

      <PatientHeader
        patient={patient}
        age={age}
        appointments={appointments}
        doctors={doctors}
        updatePatient={updatePatient}
        addAppointment={addAppointment}
        updateAppointment={updateAppointment}
        addInternalNote={addInternalNote}
      />

      <TabToggleGroup tabs={tabs} value={activeTab} onChange={setActiveTab} className="flex-wrap" />

      {activeTab === "overview" && (
        <PatientOverview
          patient={patient}
          age={age}
          stats={stats}
          currentOccupancy={currentOccupancy}
          packages={packages}
          canAssignPackage={canAssignPackage}
          onSubscribeToPackage={() => setIsAssignPackageOpen(true)}
        />
      )}

      {activeTab === "medical" && (
        <PatientMedicalInfo
          medicalHistory={medicalHistory}
          internalNotes={internalNotes}
          reassessments={reassessments}
        />
      )}

      {activeTab === "appointments" && <PatientAppointmentHistory appointments={appointments} />}

      {activeTab === "sessions" && <PatientSessionHistory sessions={sessions} />}

      {activeTab === "prescriptions" && (
        <PatientPrescriptions
          prescriptions={prescriptions}
          sessions={sessions}
          addPrescription={addPrescription}
        />
      )}

      {activeTab === "followups" && <PatientFollowUps followUps={followUps} />}

      {activeTab === "financial" && hasFinancialData && (
        <PatientFinancialSummary
          invoices={invoices}
          packages={packages}
          services={services}
          outstandingBalance={stats.outstandingBalance}
        />
      )}

      {activeTab === "activity" && <PatientActivityTimeline events={activityTimeline} />}

      <AssignPackageModal
        isOpen={isAssignPackageOpen}
        patientName={patient.full_name}
        packageTemplates={packageTemplates}
        isSubmitting={isAssigningPackage}
        onClose={() => setIsAssignPackageOpen(false)}
        onAssign={({ packageTemplateId, paymentMethod, startDate }) =>
          assignPackage({ patientId: patient.id, packageTemplateId, paymentMethod, startDate })
        }
      />
    </div>
  );
}
