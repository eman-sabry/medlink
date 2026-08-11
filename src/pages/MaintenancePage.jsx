import { useMemo, useState } from "react";
import { useMaintenance } from "../hooks/useMaintenance";
import { MaintenanceTable } from "../components/MaintenanceTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import { StatsGrid } from "../components/ui/StatCard";
import { MAINTENANCE_FORM_FIELDS } from "../helpers/maintenance.helpers";
import { MAINTENANCE_STATUS_FILTER_OPTIONS } from "../helpers/statusFilters";
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
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setIsFormModalOpen(true);
  };

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

  const filteredEntries = useMemo(
    () =>
      maintenanceEntries.filter((item) => {
        const matchesSearch =
          item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.device_id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [maintenanceEntries, searchQuery, statusFilter],
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

      <StatsGrid items={statsItems} />

      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-card p-4 rounded-2xl border border-border">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث بسبب الصيانة أو معرف الجهاز..."
          className="flex-1"
        />
        <StatusFilterDropdown
          options={MAINTENANCE_STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          triggerClassName="w-full md:w-44 h-12 px-4 text-xs"
        />
      </div>

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
