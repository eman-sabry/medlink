import {
  FileText,
  ShieldCheck,
  Cake,
  Calendar,
  Phone,
  Clock,
  Hash,
} from "lucide-react";
import { formatDate } from "../../../utils/date";

function InfoField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-bold">{label}</p>
        <p className="text-sm font-bold text-foreground truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

export function PatientPersonalInfo({ patient, age }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
      <h3 className="font-black text-foreground text-sm">المعلومات الشخصية</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <InfoField icon={Hash} label="معرّف المريض" value={patient.id} />
        <InfoField icon={FileText} label="رقم الملف" value={patient.file_no} />
        <InfoField
          icon={ShieldCheck}
          label="الجنس"
          value={patient.gender === "Male" ? "ذكر" : "أنثى"}
        />
        <InfoField
          icon={Cake}
          label="تاريخ الميلاد"
          value={patient.date_of_birth ? `${formatDate(patient.date_of_birth)} (${age ?? "—"} سنة)` : "—"}
        />
        <InfoField icon={Phone} label="رقم الهاتف" value={patient.phone} />
        <InfoField
          icon={Calendar}
          label="تاريخ التسجيل"
          value={patient.joined_date ? formatDate(patient.joined_date) : "—"}
        />
        <InfoField
          icon={Clock}
          label="آخر موعد"
          value={patient.last_appointment ? formatDate(patient.last_appointment) : "—"}
        />
      </div>
    </div>
  );
}
