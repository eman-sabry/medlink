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

  const columns = [
    {
      header: "رقم الملف",
      accessor: "file_no",
      className: "font-black text-primary px-4 py-3 min-w-[100px]",
    },
    {
      header: "اسم المريض",
      render: (patient) => (
        <div className="flex items-center gap-2 font-bold text-foreground min-w-[180px]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <span className="font-extrabold">{patient.full_name}</span>
        </div>
      ),
      className: "px-4 py-3",
    },
    {
      header: "الجنس",
      accessor: "gender",
      className:
        "text-muted-foreground font-medium hidden lg:table-cell px-4 py-3",
    },
    {
      header: "تاريخ الميلاد",
      accessor: "date_of_birth",
      className:
        "text-muted-foreground font-medium hidden xl:table-cell px-4 py-3",
    },
    {
      header: "رقم الهاتف",
      render: (patient) => (
        <span className="font-mono" dir="ltr">
          {patient.phone || "—"}
        </span>
      ),
      className:
        "text-muted-foreground font-medium hidden xl:table-cell px-4 py-3",
    },
    {
      header: "الانضمام",
      render: (patient) => patient.joined_date || "—",
      className:
        "text-muted-foreground font-medium hidden md:table-cell px-4 py-3",
    },
    {
      header: "آخر موعد",
      render: (patient) => patient.last_appointment || "—",
      className:
        "text-muted-foreground font-medium hidden md:table-cell px-4 py-3",
    },
    {
      header: "الحالة",
      render: (patient) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold inline-block whitespace-nowrap ${getStatusColor(
            patient.status,
          )}`}
        >
          {patient.status}
        </span>
      ),
      className: "px-4 py-3",
    },
    {
      header: "الإجراءات",
      render: (patient) => {
        const phoneNo = patient.phone || "201000000000";
        const whatsappUrl = `https://wa.me/${phoneNo}?text=${encodeURIComponent(
          `مرحباً ${patient.full_name}، نود التواصل معك بخصوص مركز MedLink OS.`,
        )}`;

        return (
          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
            <a
              href={`tel:${phoneNo}`}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary transition-all"
              title="اتصال هاتفي"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
              title="مراسلة واتساب"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => onViewDetails(patient.id)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
              title="عرض الملف"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <PermissionGuard permission="patients:edit">
              <button
                type="button"
                onClick={() => onEdit(patient)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-500 hover:bg-primary/15 hover:text-primary transition-all cursor-pointer"
                title="تعديل"
              >
                <Edit className="h-4 w-4" />
              </button>
            </PermissionGuard>
            <PermissionGuard permission="patients:delete">
              <button
                type="button"
                onClick={() => setDeleteId(patient.id)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-500 hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </PermissionGuard>
          </div>
        );
      },
      className: "text-center px-4 py-3 min-w-[180px]",
    },
  ];

  return (
    <>
      <div className="w-full overflow-x-auto">
        <ReusableTable
          columns={columns}
          data={patients}
          rowsPerPage={10}
          emptyMessage="لا توجد بيانات مرضى مطابقة للبحث."
        />
      </div>

      <DeletePatientModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
