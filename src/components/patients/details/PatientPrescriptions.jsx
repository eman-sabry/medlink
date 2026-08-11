import { useMemo, useState } from "react";
import { FileText, Pill, Plus } from "lucide-react";
import { EmptyState } from "../../ui/EmptyState";
import { PermissionGuard } from "../../../guards/PermissionGuard";
import { AddPrescriptionModal } from "./AddPrescriptionModal";
import { formatDate } from "../../../utils/date";

export function PatientPrescriptions({ prescriptions, sessions, addPrescription }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const targetSession = useMemo(
    () => [...sessions].find((s) => !s.prescription?.diagnosis),
    [sessions],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-foreground text-sm">الروشتات والوصفات الطبية</h3>
        {targetSession && (
          <PermissionGuard permission="prescriptions:add">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة روشتة
            </button>
          </PermissionGuard>
        )}
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState message="لا توجد روشتات مسجّلة لهذا المريض بعد" />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{p.diagnosis}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.doctorName} — {p.serviceName} — {formatDate(p.date)}
                    </p>
                  </div>
                </div>
              </div>

              {p.medicines.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.medicines.map((med, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40 text-xs">
                      <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{med.name}</p>
                        <p className="text-muted-foreground truncate">
                          {[med.dosage, med.frequency, med.duration].filter(Boolean).join(" — ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {p.notes && <p className="text-xs text-muted-foreground leading-relaxed">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <AddPrescriptionModal
        isOpen={isAddOpen}
        session={targetSession}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addPrescription}
      />
    </div>
  );
}
