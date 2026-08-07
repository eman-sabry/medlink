import { memo, useState } from "react";
import {
  User,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  Shield,
  Phone,
  MessageCircle,
  ExternalLink,
  Clock,
  UserPlus,
} from "lucide-react";
import { DeletePatientModal } from "./DeletePatientModal"; // استيراد مكون الحذف المستقل
import { PermissionGuard } from "../../guards/PermissionGuard";

function PatientCardImpl({ patient, onEdit, onDelete, onViewDetails }) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Inactive":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Archived":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const phoneNo = patient.phone || "201000000000";
  const whatsappUrl = `https://wa.me/${phoneNo}?text=${encodeURIComponent(`مرحباً ${patient.full_name}، نود التواصل معك بخصوص مركز MedLink OS.`)}`;

  const handleConfirmDelete = () => {
    onDelete(patient.id);
    setIsDeleteOpen(false);
  };

  return (
    <>
      <div className="group rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all space-y-4">
        {/* رأس الكرت */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-primary px-2 py-0.5 rounded-lg bg-primary/10">
                  {patient.file_no}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(patient.status)}`}
                >
                  {patient.status}
                </span>
              </div>
              <h3 className="font-extrabold text-foreground text-base mt-1 group-hover:text-primary transition-colors">
                {patient.full_name}
              </h3>
            </div>
          </div>

          {/* أزرار التعديل والحذف */}
          <div className="flex items-center gap-1.5">
            <PermissionGuard permission="patients:edit">
              <button
                type="button"
                onClick={() => onEdit(patient)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary transition-all cursor-pointer"
                title="تعديل"
              >
                <Edit className="h-4 w-4" />
              </button>
            </PermissionGuard>
            <PermissionGuard permission="patients:delete">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* تفاصيل البيانات */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-xs">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Shield className="h-4 w-4 text-primary shrink-0" />
            <span>{patient.gender}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Calendar className="h-4 w-4 text-primary shrink-0" />
            <span>{patient.date_of_birth}</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-muted-foreground font-medium">
            <CreditCard className="h-4 w-4 text-primary shrink-0" />
            <span className="truncate">القومي: {patient.national_id}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <UserPlus className="h-4 w-4 text-primary shrink-0" />
            <span>انضمام: {patient.joined_date || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <span>آخر موعد: {patient.last_appointment || "—"}</span>
          </div>
        </div>

        {/* شريط الأزرار السريعة (اتصال، واتساب، ملف المريض) */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          {/* زر الاتصال */}
          <a
            href={`tel:${phoneNo}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted/60 text-foreground hover:bg-primary/10 hover:text-primary text-xs font-bold transition-all"
            title="اتصال هاتفي"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>اتصال</span>
          </a>

          {/* زر واتساب */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold transition-all"
            title="مراسلة عبر واتساب"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>واتساب</span>
          </a>

          {/* زر الانتقال لصفحة الملف الشخصي للمريض */}
          <button
            type="button"
            onClick={() => onViewDetails(patient.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all cursor-pointer"
            title="عرض الملف"
          >
            <span>الملف</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* نافذة التأكيد من الحذف المستقلة */}
      <DeletePatientModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export const PatientCard = memo(PatientCardImpl);
