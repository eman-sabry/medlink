import { useMemo, useState } from "react";
import { usePackageTemplates } from "../hooks/usePackageTemplates";
import { usePatientPackages } from "../hooks/usePatientPackages";
import { usePatients } from "../hooks/usePatients";
import { PackageCard } from "../components/PackageCard";
import { PackageSubscribersModal } from "../components/packages/PackageSubscribersModal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import {
  PACKAGE_FORM_FIELDS,
  buildPackagePayload,
} from "../helpers/packageTemplates.helpers";
import { ACTIVE_INACTIVE_FILTER_OPTIONS } from "../helpers/statusFilters";
import { Plus, TrendingUp, Users, Zap } from "lucide-react";

export default function PackageTemplatesPage() {
  const {
    packages,
    isLoading,
    handleAddPackage,
    handleUpdatePackage,
    handleDeletePackage,
  } = usePackageTemplates();
  const { patientPackages } = usePatientPackages();
  const { patients } = usePatients();

  const activeSubscriptionsByTemplate = useMemo(() => {
    const map = new Map();
    patientPackages
      .filter((p) => p.computedStatus === "Active")
      .forEach((p) => map.set(p.package_template_id, (map.get(p.package_template_id) ?? 0) + 1));
    return map;
  }, [patientPackages]);

  const packageStats = useMemo(() => {
    const activeSubscriptions = patientPackages.filter((p) => p.computedStatus === "Active").length;
    const revenue = patientPackages.reduce((sum, p) => sum + (p.price_snapshot ?? 0), 0);
    let bestSellerId = null;
    let bestSellerCount = 0;
    activeSubscriptionsByTemplate.forEach((count, templateId) => {
      if (count > bestSellerCount) {
        bestSellerCount = count;
        bestSellerId = templateId;
      }
    });
    const bestSellerName = packages.find((p) => p.id === bestSellerId)?.name ?? "لا يوجد بعد";
    return { activeSubscriptions, revenue, bestSellerName };
  }, [patientPackages, activeSubscriptionsByTemplate, packages]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewingSubscribersFor, setViewingSubscribersFor] = useState(null);

  const handleOpenAdd = () => {
    setEditingPackage(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setIsFormModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (id) => {
    setPackageToDelete(id);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!packageToDelete) return;
    try {
      setIsDeleting(true);
      await handleDeletePackage(packageToDelete);
      setDeleteModalOpen(false);
      setPackageToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    const payload = buildPackagePayload(formData);
    if (editingPackage) {
      await handleUpdatePackage({ id: editingPackage.id, updatedData: payload });
    } else {
      await handleAddPackage(payload);
    }
  };

  const filteredPackages = useMemo(
    () =>
      packages.filter((p) => {
        const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [packages, searchQuery, statusFilter],
  );

  return (
    <div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      dir="rtl"
      onClick={() => setActiveMenuId(null)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-bold">
            الباقات والأسعار
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            الباقات العلاجية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            الباقات المتاحة للمرضى وأسعارها — إجمالي الاشتراكات النشطة
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>باقة جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              اشتراكات نشطة
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {packageStats.activeSubscriptions}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              إيراد الباقات
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block font-mono">
              {packageStats.revenue.toLocaleString("en-US")} <span className="text-xs font-normal">ج.م</span>
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              الأكثر مبيْعاً
            </span>
            <span className="text-lg font-extrabold text-foreground mt-1 block truncate">
              {packageStats.bestSellerName}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث باسم الباقة..."
          variant="boxed"
          className="flex-1"
        />
        <StatusFilterDropdown
          options={ACTIVE_INACTIVE_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
        />
      </div>

      {isLoading ? (
        <LoadingState message="جاري تحميل الباقات العلاجية..." rounded="rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                activeSubscriptions={activeSubscriptionsByTemplate.get(pkg.id) ?? 0}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                activeMenuId={activeMenuId}
                onToggleMenu={setActiveMenuId}
                onViewSubscribers={setViewingSubscribersFor}
              />
            ))
          ) : (
            <EmptyState message="لا توجد باقات علاجية مطابقة للبحث." colSpanFull />
          )}
        </div>
      )}

      {isFormModalOpen && (
        <ReusableForm
          title={editingPackage ? "تعديل الباقة العلاجية" : "إضافة باقة جديدة"}
          fields={PACKAGE_FORM_FIELDS}
          initialData={
            editingPackage || {
              name: "",
              price: "",
              discount_percent: "",
              session_count: "",
              status: "Active",
            }
          }
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      <PackageSubscribersModal
        isOpen={Boolean(viewingSubscribersFor)}
        packageTemplate={viewingSubscribersFor}
        patientPackages={patientPackages}
        patients={patients}
        onClose={() => setViewingSubscribersFor(null)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الباقة العلاجية"
        description="هل أنت متأكد من رغبتك في حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف الباقة"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
