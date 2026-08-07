import { useMemo, useState } from "react";
import { usePackageTemplates } from "../hooks/usePackageTemplates";
import { PackageCard } from "../components/PackageCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import {
  PACKAGE_FORM_FIELDS,
  buildPackagePayload,
} from "../helpers/packageTemplates.helpers";
import { Plus, TrendingUp, Users, Zap } from "lucide-react";

export default function PackageTemplatesPage() {
  const {
    packages,
    isLoading,
    handleAddPackage,
    handleUpdatePackage,
    handleDeletePackage,
  } = usePackageTemplates();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      packages.filter((p) =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [packages, searchQuery],
  );

  const activeCount = useMemo(
    () => packages.filter((p) => p.status === "Active").length,
    [packages],
  );

  return (
    <div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      dir="rtl"
      onClick={() => setActiveMenuId(null)}
    >
      {/* عنوان الصفحة */}
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

      {/* لوحة الإحصائيات العلوية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              اشتراكات نشطة
            </span>
            <span className="text-2xl font-bold text-foreground mt-1 block">
              {activeCount * 12}
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
              ١٧٥,١٥٠ <span className="text-xs font-normal">ج.م</span>
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
            <span className="text-lg font-extrabold text-foreground mt-1 block">
              جلسة مفردة
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Zap className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="بحث باسم الباقة..."
        variant="boxed"
      />

      {/* عرض الكروت باستخدام الكومبوننت المنفصل */}
      {isLoading ? (
        <LoadingState message="جاري تحميل الباقات العلاجية..." rounded="rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.length > 0 ? (
            filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                activeMenuId={activeMenuId}
                onToggleMenu={setActiveMenuId}
              />
            ))
          ) : (
            <EmptyState message="لا توجد باقات علاجية مطابقة للبحث." colSpanFull />
          )}
        </div>
      )}

      {/* مودال الفورم الموحد */}
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
