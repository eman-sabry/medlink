import { useState } from "react";
import {
  UserCheck,
  Edit,
  Trash2,
  Phone,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { DeletePatientModal } from "./DeletePatientModal";
import { ReusableTable } from "../ui/ReusableTable";
import { PermissionGuard } from "../../guards/PermissionGuard";

export function PatientTable({ patients, onEdit, onDelete, onViewDetails }) {
  const [deleteId, setDeleteId] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-500";
      case "Inactive":
        return "bg-amber-500/10 text-amber-500";
      case "Archived":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  // تعريف أعمدة جدول المرضى مع كيفية عرض كل خلية
  const columns = [
    {
      header: "رقم الملف",
      accessor: "file_no",
      className: "font-black text-primary truncate w-[12%]",
    },
    {
      header: "اسم المريض",
      render: (patient) => (
        <div className="flex items-center gap-2 font-bold text-foreground truncate">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <UserCheck className="h-3.5 w-3.5" />
          </div>
          <span className="truncate">{patient.full_name}</span>
        </div>
      ),
      className: "w-[25%]",
    },
    {
      header: "الجنس",
      accessor: "gender",
      className:
        "text-muted-foreground font-medium hidden lg:table-cell w-[8%]",
    },
    {
      header: "تاريخ الميلاد",
      accessor: "date_of_birth",
      className:
        "text-muted-foreground font-medium hidden xl:table-cell w-[11%]",
    },
    {
      header: "الرقم القومي",
      accessor: "national_id",
      className:
        "text-muted-foreground font-medium hidden xl:table-cell w-[13%]",
    },
    {
      header: "الانضمام",
      render: (patient) => patient.joined_date || "—",
      className:
        "text-muted-foreground font-medium hidden md:table-cell w-[11%]",
    },
    {
      header: "آخر موعد",
      render: (patient) => patient.last_appointment || "—",
      className:
        "text-muted-foreground font-medium hidden md:table-cell w-[11%]",
    },
    {
      header: "الحالة",
      render: (patient) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${getStatusColor(
            patient.status,
          )}`}
        >
          {patient.status}
        </span>
      ),
      className: "w-[15%]",
    },
    {
      header: "الإجراءات",
      render: (patient) => {
        const phoneNo = patient.phone || "201000000000";
        const whatsappUrl = `https://wa.me/${phoneNo}?text=${encodeURIComponent(
          `مرحباً ${patient.full_name}، نود التواصل معك بخصوص مركز MedLink OS.`,
        )}`;

        return (
          <div className="flex items-center justify-center gap-1">
            <a
              href={`tel:${phoneNo}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary transition-all"
              title="اتصال هاتفي"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
              title="مراسلة واتساب"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onViewDetails(patient.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
              title="عرض الملف"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <PermissionGuard permission="patients:edit">
              <button
                type="button"
                onClick={() => onEdit(patient)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-500 hover:bg-primary/15 hover:text-primary transition-all cursor-pointer"
                title="تعديل"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
            </PermissionGuard>
            <PermissionGuard permission="patients:delete">
              <button
                type="button"
                onClick={() => setDeleteId(patient.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-500 hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
                title="حذف"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </PermissionGuard>
          </div>
        );
      },
      className: "text-center w-[28%]",
    },
  ];

  return (
    <>
      <ReusableTable
        columns={columns}
        data={patients}
        rowsPerPage={10}
        emptyMessage="لا توجد بيانات مرضى مطابقة للبحث."
      />

      <DeletePatientModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
