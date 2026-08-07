import { Printer, Plus } from "lucide-react";
import { MedicineRow } from "./MedicineRow";
import { toast } from "../../utils/toast";

export function PrescriptionTab({
  patientName,
  medicines,
  onAddMedicine,
  onChangeMedicine,
  onDeleteMedicine,
  instructions,
  setInstructions,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-lg font-black text-foreground">
            كتابة الروشتة والأدوية — {patientName || "مريم أحمد صلاح"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            إضافة الأدوية والتعليمات الطبية ثم اضغط طباعة لفتح روشتة منسقة
            وجاهزة.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            toast.success("تمت إضافة الروشتة بنجاح");
            window.print();
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>طباعة الروشتة</span>
        </button>
      </div>

      <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-foreground text-base">
            العلاجات الموصوفة
          </h3>
          <button
            type="button"
            onClick={onAddMedicine}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-all cursor-pointer border border-border"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>إضافة دواء</span>
          </button>
        </div>

        <div className="space-y-3">
          {medicines.map((med) => (
            <MedicineRow
              key={med.id}
              medicine={med}
              onChange={onChangeMedicine}
              onDelete={onDeleteMedicine}
            />
          ))}
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-sm">
        <h3 className="font-extrabold text-foreground text-sm">
          التعليمات والإرشادات الطبية للمريض
        </h3>
        <textarea
          rows="4"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full rounded-2xl border border-border p-4 text-xs md:text-sm bg-muted/40 focus:outline-none focus:border-primary"
        ></textarea>
      </div>
    </div>
  );
}
