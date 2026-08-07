import {
  FileText,
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
} from "lucide-react";
import { GENDER_OPTIONS, STATUS_OPTIONS } from "../../constants/formOptions";
import { ReusableForm } from "../ui/ReusableForm";
export function EditPatientModal({ isOpen, patient, onClose, onUpdate }) {
  if (!isOpen || !patient) return null;

  const patientFields = [
    {
      name: "file_no",
      label: "رقم الملف",
      type: "text",
      placeholder: "PAT-101",
      icon: FileText,
    },
    {
      name: "full_name",
      label: "اسم المريض الكامل",
      type: "text",
      placeholder: "أدخل اسم المريض...",
      icon: User,
    },
    {
      name: "gender",
      label: "الجنس",
      type: "select",
      options: GENDER_OPTIONS,
      icon: ShieldCheck,
    },
    {
      name: "date_of_birth",
      label: "تاريخ الميلاد",
      type: "date",
      icon: Calendar,
    },
    {
      name: "national_id",
      label: "الرقم القومي",
      type: "text",
      placeholder: "أدخل الرقم القومي...",
      icon: CreditCard,
    },
    {
      name: "status",
      label: "الحالة",
      type: "select",
      options: STATUS_OPTIONS,
      icon: ShieldCheck,
    },
  ];
  const initialData = {
    file_no: patient.file_no ?? "",
    full_name: patient.full_name ?? "",
    gender: patient.gender ?? "",
    date_of_birth: patient.date_of_birth ?? "",
    national_id: patient.national_id ?? "",
    status: patient.status ?? "",
  };

  const handleSubmit = async (formData) => {
    try {
      await onUpdate(patient.id, formData);
    } catch (error) {
      console.error("Failed to update patient:", error);
      throw error;
    }
  };

  return (
    <ReusableForm
      title="تعديل بيانات المريض"
      fields={patientFields}
      initialData={initialData}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
