import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, Users, Phone, CalendarDays, CalendarX, ArrowLeft } from "lucide-react";
import { PACKAGE_STATUS_META, PACKAGE_PAYMENT_STATUS_LABELS } from "../../helpers/patientPackages.helpers";
import { EmptyState } from "../ui/EmptyState";
import { formatDate } from "../../utils/date";

export function PackageSubscribersModal({ isOpen, packageTemplate, patientPackages = [], patients = [], onClose }) {
  const navigate = useNavigate();

  const subscribers = useMemo(() => {
    if (!packageTemplate) return [];
    const patientsById = new Map(patients.map((p) => [p.id, p]));
    return patientPackages
      .filter((pkg) => pkg.package_template_id === packageTemplate.id)
      .map((pkg) => ({ ...pkg, patient: patientsById.get(pkg.patient_id) ?? null }))
      .sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0));
  }, [packageTemplate, patientPackages, patients]);

  if (!isOpen || !packageTemplate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col" dir="rtl">
        <div className="flex items-center justify-between border-b border-border p-6 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-foreground truncate">{packageTemplate.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {subscribers.length} {subscribers.length === 1 ? "مشترك" : "مشتركين"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-3">
          {subscribers.length === 0 ? (
            <EmptyState message="لا يوجد مشتركون في هذه الباقة حتى الآن" rounded="rounded-2xl" />
          ) : (
            subscribers.map((sub) => {
              const meta = PACKAGE_STATUS_META[sub.computedStatus] ?? PACKAGE_STATUS_META.Active;
              return (
                <div
                  key={sub.id}
                  onClick={() => sub.patient && navigate(`/patients/${sub.patient.id}`)}
                  className="p-4 rounded-2xl bg-muted/40 space-y-3 cursor-pointer hover:bg-muted/70 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">
                        {sub.patient?.full_name ?? "مريض غير معروف"}
                      </p>
                      <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground rotate-180 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>

                  {sub.patient?.phone && (
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {sub.patient.phone}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-card">
                      <p className="text-muted-foreground">الإجمالي</p>
                      <p className="font-black text-foreground">{sub.sessions_total}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-card">
                      <p className="text-muted-foreground">مستخدَم</p>
                      <p className="font-black text-amber-600">{sub.sessions_used_cache ?? 0}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-card">
                      <p className="text-muted-foreground">متبقي</p>
                      <p className="font-black text-emerald-600">{sub.remainingSessions}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      <span>{sub.start_date ? formatDate(sub.start_date) : "—"}</span>
                      <span>—</span>
                      <CalendarX className="h-3 w-3 text-primary" />
                      <span>{sub.end_date ? formatDate(sub.end_date) : "بلا انتهاء"}</span>
                    </div>
                    <span className="font-bold text-foreground">
                      {PACKAGE_PAYMENT_STATUS_LABELS[sub.payment_status] ?? sub.payment_status ?? "—"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
