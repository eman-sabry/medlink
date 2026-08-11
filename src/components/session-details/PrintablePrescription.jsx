import { calculateAge } from "../../helpers/patientProfile.helpers";
import { formatDate } from "../../utils/date";

export function PrintablePrescription({ prescription, patient, doctor, centerSettings }) {
  if (!prescription) return null;
  const age = patient ? calculateAge(patient.date_of_birth) : null;

  return (
    <div className="hidden print:block text-black" dir="rtl">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">{centerSettings?.name ?? "MedLink"}</h1>
          {centerSettings?.address && <p className="text-sm mt-1">{centerSettings.address}</p>}
          {centerSettings?.phone && <p className="text-sm" dir="ltr">{centerSettings.phone}</p>}
        </div>
        <div className="text-left">
          <h2 className="text-xl font-black">روشتة طبية</h2>
          <p className="text-sm mt-1">التاريخ: {formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p className="font-bold mb-1">بيانات المريض</p>
          <p>{patient?.full_name ?? "—"}</p>
          <p>رقم الملف: {patient?.file_no ?? "—"}</p>
          {age != null && <p>العمر: {age} سنة</p>}
        </div>
        <div>
          <p className="font-bold mb-1">الطبيب المعالج</p>
          <p>{doctor?.full_name ?? "—"}</p>
          {doctor?.specialty && <p>{doctor.specialty}</p>}
        </div>
      </div>

      <div className="mb-6">
        <p className="font-bold mb-1 text-sm">التشخيص</p>
        <p className="text-sm">{prescription.diagnosis}</p>
      </div>

      {prescription.medicines?.length > 0 && (
        <table className="w-full text-sm border-collapse mb-6 invoice-print-table">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="py-2 text-right">الدواء</th>
              <th className="py-2 text-center">الجرعة</th>
              <th className="py-2 text-center">التكرار</th>
              <th className="py-2 text-left">المدة</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines.map((med, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="py-2">{med.name}</td>
                <td className="py-2 text-center">{med.dosage || "—"}</td>
                <td className="py-2 text-center">{med.frequency || "—"}</td>
                <td className="py-2 text-left">{med.duration || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {prescription.notes && (
        <div className="text-sm mb-10">
          <p className="font-bold mb-1">ملاحظات وتعليمات</p>
          <p>{prescription.notes}</p>
        </div>
      )}

      <div className="flex justify-end mt-16">
        <div className="text-center text-sm">
          <div className="w-48 border-t border-black pt-1.5">توقيع الطبيب</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 border-t border-gray-300 pt-3 mt-10">تم إصدار هذه الروشتة إلكترونياً عبر نظام MedLink OS.</p>
    </div>
  );
}
