import { memo } from "react";
import { Trash2 } from "lucide-react";

const FIELDS = [
  { name: "name", label: "الدواء / العلاج", span: "md:col-span-4" },
  { name: "dose", label: "الجرعة", span: "md:col-span-3" },
  { name: "duration", label: "المدة", span: "md:col-span-2" },
  { name: "notes", label: "ملاحظات", span: "md:col-span-2" },
];

function MedicineRowImpl({ medicine, onChange, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-muted/40 p-4 rounded-2xl border border-border">
      {FIELDS.map((field) => (
        <div key={field.name} className={field.span}>
          <label className="text-[10px] text-muted-foreground font-bold block mb-1">
            {field.label}
          </label>
          <input
            type="text"
            value={medicine[field.name]}
            onChange={(e) => onChange(medicine.id, field.name, e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs"
          />
        </div>
      ))}
      <div className="md:col-span-1 flex justify-center pt-5">
        <button
          type="button"
          onClick={() => onDelete(medicine.id)}
          className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const MedicineRow = memo(MedicineRowImpl);
