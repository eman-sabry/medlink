import { useMemo, useState } from "react";
import { useMaintenance } from "../hooks/useMaintenance";
import { MaintenanceTable } from "../components/MaintenanceTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingState } from "../components/ui/LoadingState";
import { StatsGrid } from "../components/ui/StatCard";
import { MAINTENANCE_FORM_FIELDS } from "../helpers/maintenance.helpers";
import { countBy, sumBy } from "../utils/stats";
import { Wrench, CheckCircle2, Clock, Plus, DollarSign } from "lucide-react";

export default function MaintenancePage() {
  const {
    maintenanceEntries,
    isLoading,
    handleAddMaintenance,
    handleUpdateMaintenance,
    handleStatusChange,
    handleDeleteMaintenance,
  } = useMaintenance();

  const [searchQuery, setSearchQuery] = useState("");

  // حالات للتحكم في المودال والفورم (إضافة أو تعديل)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // حالات مودال التأكيد بالحذف
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // فتح مودال الإضافة
  const handleOpenAdd = () => {
    setEditingEntry(null);
    setIsFormModalOpen(true);
  };

  // فتح مودال التعديل مع تمرير بيانات السجل الحالي
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setEntryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      setIsDeleting(true);
      await handleDeleteMaintenance(entryToDelete);
      setDeleteModalOpen(false);
      setEntryToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // دالة الحفظ الموحدة (للإضافة أو التعديل)
  const handleFormSubmit = async (formData) => {
    if (editingEntry) {
      await handleUpdateMaintenance({
        id: editingEntry.id,
        updatedData: formData,
      });
    } else {
      await handleAddMaintenance(formData);
    }
  };

  // تصفية السجلات حسب البحث
  const filteredEntries = useMemo(
    () =>
      maintenanceEntries.filter(
        (item) =>
          item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.device_id?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [maintenanceEntries, searchQuery],
  );

  const statsItems = useMemo(() => {
    const totalCost = sumBy(maintenanceEntries, (item) => item.cost);
    return [
      {
        key: "total",
        label: "إجمالي السجلات",
        value: maintenanceEntries.length,
        icon: Wrench,
        iconWrapperClassName: "bg-primary/10 text-primary",
      },
      {
        key: "completed",
        label: "المكتملة (Completed)",
        value: countBy(maintenanceEntries, (d) => d.status === "Completed"),
        icon: CheckCircle2,
        valueClassName: "text-emerald-600",
        iconWrapperClassName: "bg-emerald-500/10 text-emerald-600",
      },
      {
        key: "pending",
        label: "قيد الانتظار",
        value: countBy(
          maintenanceEntries,
          (d) => d.status === "Pending" || d.status === "Maintenance",
        ),
        icon: Clock,
        valueClassName: "text-amber-500",
        iconWrapperClassName: "bg-amber-500/10 text-amber-500",
      },
      {
        key: "cost",
        label: "إجمالي التكاليف",
        value: totalCost,
        suffix: "ج.م",
        icon: DollarSign,
        valueClassName: "text-indigo-600",
        iconWrapperClassName: "bg-indigo-500/10 text-indigo-600",
      },
    ];
  }, [maintenanceEntries]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* عنوان الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-bold">
            الإدارة الفنية والصيانة
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            سجلات صيانة الأجهزة
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            متابعة أعطال الأجهزة، تكاليف الإصلاح، وحالة الصيانة الدورية.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة سجل صيانة</span>
        </button>
      </div>

      {/* لوحة الإحصائيات السريعة */}
      <StatsGrid items={statsItems} />

      {/* شريط البحث والفلترة */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث بسبب الصيانة أو معرف الجهاز..."
        />
      </div>

      {/* جدول البيانات أو حالة التحميل */}
      {isLoading ? (
        <LoadingState message="جاري تحميل سجلات الصيانة..." />
      ) : (
        <MaintenanceTable
          maintenanceEntries={filteredEntries}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* مودال الفورم الموحد (إضافة وتعديل) */}
      {isFormModalOpen && (
        <ReusableForm
          title={editingEntry ? "تعديل سجل الصيانة" : "إضافة سجل صيانة جديد"}
          fields={MAINTENANCE_FORM_FIELDS}
          initialData={
            editingEntry || {
              device_id: "",
              reason: "",
              cost: "",
              status: "Completed",
              completed_at: "",
            }
          }
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      {/* نافذة التأكيد بالحذف */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف سجل الصيانة"
        description="هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء وسيتم إزالته نهائياً من السجلات."
        confirmText="نعم، احذف السجل"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
