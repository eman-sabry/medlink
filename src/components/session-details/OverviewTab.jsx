import { SessionPatientCard } from "./SessionPatientCard";
import { SessionInfoCard } from "./SessionInfoCard";
import { PackageSummary } from "./PackageSummary";

export function OverviewTab({
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
}) {
  return (
    <div className="space-y-5">
      <SessionPatientCard patient={patient} medicalHistory={medicalHistory} />
      <PackageSummary
        packages={patientPackages}
        isCompleted={isCompleted}
        existingUsage={existingUsageForSession}
      />

      <SessionInfoCard
        appointment={appointment}
        doctor={doctor}
        service={service}
        room={room}
        bed={bed}
        rooms={rooms}
        beds={beds}
        onAssignRoom={onAssignRoom}
        onAssignBed={onAssignBed}
      />
    </div>
  );
}
