import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { useSessionDetails } from "../hooks/useSessionDetails";
import { LoadingState } from "../components/ui/LoadingState";
import { PrintableInvoice } from "../components/invoices/PrintableInvoice";
import { printInvoice } from "../helpers/invoicePrint.helpers";
import { printPrescription } from "../helpers/prescriptionPrint.helpers";
import { useInvoice } from "../hooks/useInvoice";

import { SessionHeader } from "../components/session-details/SessionHeader";
import { SessionActions } from "../components/session-details/SessionActions";
import { SessionTimer } from "../components/session-details/SessionTimer";
import { SessionTabs } from "../components/session-details/SessionTabs";
import { PrintablePrescription } from "../components/session-details/PrintablePrescription";

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export default function SessionDetailsPage({ appointmentId }) {
  const { role } = useAuth();
  const {
    isLoading,
    appointment,
    treatmentSession,
    patient,
    doctor,
    service,
    room,
    bed,
    rooms,
    beds,
    durationSeconds,
    isOwnSession,
    patientPackages,
    coveringPackageForSession,
    medicalHistory,
    existingUsageForSession,
    invoice,
    previousSessions,
    sessionActivity,
    startSession,
    isStarting,
    endSession,
    isEnding,
    saveClinicalNotes,
    isSavingClinicalNotes,
    savePrescription,
    isSavingPrescription,
    assignRoom,
    assignBed,
  } = useSessionDetails(appointmentId);

  const centerSettingsQuery = useResource("center_settings", "/center_settings");
  const centerSettings = centerSettingsQuery.data?.[0] ?? null;

  const [printInvoiceId, setPrintInvoiceId] = useState(null);
  const [isPrintingPrescription, setIsPrintingPrescription] = useState(false);

  const printingInvoiceHook = useInvoice(printInvoiceId);

  if (isLoading) {
    return <LoadingState message="جاري تحميل تفاصيل الجلسة..." rounded="rounded-3xl" />;
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h2 className="text-xl font-black text-foreground">عذراً، لم يتم العثور على هذه الجلسة</h2>
      </div>
    );
  }

  if (!isOwnSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <h2 className="text-xl font-black text-foreground">لا تملك صلاحية الوصول لهذه الجلسة</h2>
        <p className="text-sm text-muted-foreground">هذه الجلسة تابعة لطبيب آخر.</p>
      </div>
    );
  }

  const canManage = role === "Owner" || role === "Doctor";

  const handlePrintPrescription = () => printPrescription(setIsPrintingPrescription);

  return (
    <>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 print:hidden" dir="rtl">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <SessionHeader appointment={appointment} doctor={doctor} room={room} bed={bed} />
            <SessionActions
              appointment={appointment}
              canManage={canManage}
              isOwnSession={isOwnSession}
              isStarting={isStarting}
              isEnding={isEnding}
              onStart={startSession}
              onEnd={endSession}
            />
          </div>
          <SessionTimer appointment={appointment} treatmentSession={treatmentSession} durationSeconds={durationSeconds} />
        </div>

        <SessionTabs
          patient={patient}
          medicalHistory={medicalHistory}
          appointment={appointment}
          doctor={doctor}
          service={service}
          room={room}
          bed={bed}
          rooms={rooms}
          beds={beds}
          onAssignRoom={assignRoom}
          onAssignBed={assignBed}
          patientPackages={patientPackages}
          isCompleted={appointment.status === "Completed"}
          existingUsageForSession={existingUsageForSession}
          treatmentSession={treatmentSession}
          onSaveClinicalNotes={saveClinicalNotes}
          isSavingClinicalNotes={isSavingClinicalNotes}
          onSavePrescription={savePrescription}
          isSavingPrescription={isSavingPrescription}
          onPrintPrescription={handlePrintPrescription}
          previousSessions={previousSessions}
          sessionActivity={sessionActivity}
          invoice={invoice}
          coveringPackageForSession={coveringPackageForSession}
          onPrintInvoice={(inv) => printInvoice(setPrintInvoiceId, inv.id)}
          canEdit={canManage}
        />
      </div>

      {printInvoiceId && (
        <PrintableInvoice invoice={printingInvoiceHook.invoice} centerSettings={centerSettings} />
      )}
      {isPrintingPrescription && (
        <PrintablePrescription
          prescription={treatmentSession?.prescription}
          patient={patient}
          doctor={doctor}
          centerSettings={centerSettings}
        />
      )}
    </>
  );
}
