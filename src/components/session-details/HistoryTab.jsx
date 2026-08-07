export function HistoryTab({ doctorName }) {
  return (
    <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
      <h2 className="text-lg font-black text-foreground">سجل الجلسات السابقة</h2>
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-muted/40 border border-border flex justify-between items-center text-xs">
          <div>
            <p className="font-bold text-foreground">
              الجلسة السابقة - تأهيل العلاج الطبيعي
            </p>
            <p className="text-muted-foreground">المعالج: {doctorName}</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-600 font-bold px-3 py-1 rounded-full">
            مكتملة
          </span>
        </div>
      </div>
    </div>
  );
}
