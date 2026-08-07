import { FileText, Activity } from "lucide-react";
import { AssessmentSlider } from "../ui/AssessmentSlider";

export function AssessmentTab({
  painScale,
  setPainScale,
  romScale,
  setRomScale,
  strengthScale,
  setStrengthScale,
  clinicalNotes,
  setClinicalNotes,
  onSaveAssessment,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-5 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-lg font-black text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            تسجيل مؤشرات إعادة التقييم الجلسة الحالية
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            قم بتحريك المؤشرات أدناه لتحديث القياسات السريرية بناءً على فحص اليوم
            للحالة.
          </p>
        </div>
        <button
          type="button"
          onClick={onSaveAssessment}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          <span>حفظ التقييم المحدث</span>
        </button>
      </div>

      <AssessmentSlider
        title="درجة الألم (VAS Scale)"
        subtitle="من 0 (لا يوجد ألم) إلى 10 (أسوأ ألم متصور)"
        value={painScale}
        onChange={setPainScale}
        min={0}
        max={10}
        unit=" / 10"
        minLabel="0 - مريح تماماً"
        midLabel="5 - ألم متوسط"
        maxLabel="10 - ألم حاد ومبرح"
      />

      <AssessmentSlider
        title="مدى الحركة (Range of Motion - ROM)"
        subtitle="النسبة المئوية لمدى حركة المفصل مقارنة بالحركة الطبيعية"
        value={romScale}
        onChange={setRomScale}
        min={0}
        max={100}
        unit="%"
        minLabel="0% - متيبس كلياً"
        midLabel="50% - حركة متوسطة"
        maxLabel="100% - حركة طبيعية وكاملة"
      />

      <AssessmentSlider
        title="القوة العضلية (Muscle Strength)"
        subtitle="تقييم قدرة العضلات المحيطة على مقاومة الحركة"
        value={strengthScale}
        onChange={setStrengthScale}
        min={0}
        max={100}
        unit="%"
        minLabel="0% - انعدام الحركة"
        midLabel="50% - قوة متوسطة"
        maxLabel="100% - قوة عضلية كاملة"
      />

      <div className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-sm">
        <h3 className="font-extrabold text-foreground text-sm">
          ملاحظات التقييم السريري وخطة التطوير
        </h3>
        <textarea
          rows="3"
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          className="w-full rounded-2xl border border-border p-3 text-xs md:text-sm bg-muted/40 focus:outline-none focus:border-primary"
        ></textarea>
      </div>
    </div>
  );
}
