import { Link } from "react-router-dom";
import { User, Phone, Cake, VenetianMask, FileText, ExternalLink } from "lucide-react";
import { calculateAge } from "../../helpers/patientProfile.helpers";

const GENDER_LABELS = { Male: "ذكر", Female: "أنثى" };

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-muted/40 text-xs">
      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-bold text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export function SessionPatientCard({ patient, medicalHistory = [] }) {
  if (!patient) return null;
  const age = calculateAge(patient.date_of_birth);

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black text-foreground text-base">{patient.full_name}</p>
            <p className="text-xs text-muted-foreground">ملف رقم {patient.file_no}</p>
          </div>
        </div>
        <Link
          to={`/patients/${patient.id}`}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[11px] transition-all cursor-pointer shrink-0"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          ملف المريض
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoChip icon={Phone} label="الهاتف" value={patient.phone} />
        <InfoChip icon={Cake} label="العمر" value={age != null ? `${age} سنة` : "—"} />
        <InfoChip icon={VenetianMask} label="النوع" value={GENDER_LABELS[patient.gender] ?? patient.gender} />
        <InfoChip icon={FileText} label="الحالة" value={patient.status === "Active" ? "نشط" : patient.status} />
      </div>

      {medicalHistory.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/5 ring-1 ring-amber-500/15 text-xs space-y-1.5">
          <p className="font-bold text-amber-700 dark:text-amber-400">معلومات طبية مهمة</p>
          {medicalHistory.map((m) => (
            <p key={m.id} className="text-muted-foreground leading-relaxed">{m.description}</p>
          ))}
        </div>
      )}
    </div>
  );
}
