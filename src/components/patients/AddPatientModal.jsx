import {
  FileText,
  User,
  ShieldCheck,
  Calendar,
  CreditCard,
} from "lucide-react";
import { GENDER_OPTIONS, STATUS_OPTIONS } from "../../constants/formOptions";
import { usePatients } from "../../hooks/usePatients";
import { ReusableForm } from "../ui/ReusableForm";

export function AddPatientModal({ isOpen, onClose }) {
  const { addPatient } = usePatients();

  if (!isOpen) return null;

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
    // إضافة حقل مخفي لتاريخ الانضمام لكي يتم تضمينه تلقائياً في الـ formData عبر الـ ReusableForm
    {
      name: "joined_date",
      type: "hidden",
    },
  ];

  // تمرير تاريخ اليوم مباشرة في القيم الأولية
  const initialData = {
    status: "Active",
    joined_date: new Date().toISOString().split("T")[0],
  };

  const handleSubmit = async (formData) => {
    try {
      await addPatient(formData); // سيحتوي الـ formData على joined_date تلقائياً من الـ initialData والـ fields
    } catch (error) {
      console.error("Failed to add patient:", error);
      throw error;
    }
  };

  return (
    <ReusableForm
      title="إضافة مريض جديد"
      fields={patientFields}
      initialData={initialData}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
