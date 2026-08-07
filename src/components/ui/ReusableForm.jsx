import { X, Loader2 } from "lucide-react";
import { useState } from "react";
import { CustomSelect } from "./CustomSelect";

export function ReusableForm({
  title,
  fields,
  initialData = {},
  onSubmit,
  onClose,
}) {
  const [formData, setFormData] = useState(() => {
    const initialValues = {};
    fields.forEach((field) => {
      initialValues[field.name] = initialData[field.name] || "";
    });
    return initialValues;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents full page reload
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] h-autu">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-xl font-black text-foreground tracking-wide">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => {
              const IconComponent = field.icon;
              return (
                <div
                  key={field.name}
                  className="space-y-1.5 col-span-full sm:col-span-1"
                >
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                    {IconComponent && (
                      <IconComponent className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{field.label}</span>
                  </label>

                  {field.type === "select" && field.options ? (
                    <CustomSelect
                      value={formData[field.name]}
                      onChange={(val) =>
                        handleCustomSelectChange(field.name, val)
                      }
                      options={field.options}
                      placeholder={`اختر ${field.label}...`}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder || ""}
                      required
                      className="w-full h-12 rounded-2xl border border-border bg-background px-4 text-sm text-foreground focus:outline-hidden focus:border-primary transition-all shadow-xs"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>حفظ البيانات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
