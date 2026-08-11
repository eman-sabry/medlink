import { History, CalendarClock, BedDouble, Package, Plus } from "lucide-react";
import { StatsGrid } from "../../ui/StatCard";
import { PatientPersonalInfo } from "./PatientPersonalInfo";
import { ActivePackageCard } from "../ActivePackageCard";
import { buildOverviewStatItems } from "../../../helpers/patientProfile.helpers";
import { getActivePackages } from "../../../helpers/patientPackages.helpers";
import { formatDate, formatTime } from "../../../utils/date";

export function PatientOverview({
  patient,
  age,
  stats,
  currentOccupancy,
  packages = [],
  canAssignPackage = false,
  onSubscribeToPackage,
}) {
  const statItems = buildOverviewStatItems(stats);
  const activePackages = getActivePackages(packages);

  return (
    <div className="space-y-6">
      <StatsGrid items={statItems} className="grid-cols-2 sm:grid-cols-4" />

      {currentOccupancy && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
            <BedDouble className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-emerald-700">المريض حالياً في جلسة نشطة</p>
            <p className="text-sm font-bold text-foreground truncate">
              {currentOccupancy.room?.name ?? "غرفة غير محددة"}
              {currentOccupancy.bed ? ` — ${currentOccupancy.bed.label}` : ""}
              {currentOccupancy.session?.actual_started_at || currentOccupancy.session?.starts_at
                ? ` — منذ ${formatTime(currentOccupancy.session.actual_started_at || currentOccupancy.session.starts_at)}`
                : ""}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <History className="h-4.5 w-4.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">آخر زيارة</p>
            <p className="text-sm font-bold text-foreground truncate">
              {stats.lastVisit ? formatDate(stats.lastVisit) : "لا توجد زيارات سابقة"}
            </p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarClock className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">الموعد القادم</p>
            <p className="text-sm font-bold text-foreground truncate">
              {stats.nextAppointment
                ? `${formatDate(stats.nextAppointment.starts_at)} — ${formatTime(stats.nextAppointment.starts_at)} مع ${stats.nextAppointment.doctor_name}`
                : "لا يوجد موعد قادم"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-foreground text-sm flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            الباقات النشطة
          </h3>
          {canAssignPackage && (
            <button
              type="button"
              onClick={onSubscribeToPackage}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              اشتراك في باقة
            </button>
          )}
        </div>
        {activePackages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePackages.map((pkg) => (
              <ActivePackageCard key={pkg.id} pkg={pkg} showFinancials />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-2xl p-4 text-center">
            لا توجد باقة نشطة لهذا المريض حالياً
          </p>
        )}
      </div>

      <PatientPersonalInfo patient={patient} age={age} />
    </div>
  );
}
