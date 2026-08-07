export function PatientInfoTab({ sessionData }) {
  const rows = [
    { label: "اسم المريض:", value: sessionData?.patient_name },
    { label: "رقم الهاتف:", value: sessionData?.patient_phone || "غير متوفر" },
    { label: "رقم الملف:", value: sessionData?.patient_file_no || "غير متوفر" },
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <h2 className="text-lg font-black text-foreground">بيانات المريض الأساسية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
        {rows.map((row) => (
          <div
            key={row.label}
            className="p-3 rounded-xl bg-muted/40 flex justify-between"
          >
            <span className="text-muted-foreground font-bold">{row.label}</span>
            <span className="font-extrabold text-foreground">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
