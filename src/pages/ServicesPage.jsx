import { useMemo, useState } from "react";
import { useServices } from "../hooks/useServices";
import { ServiceCard } from "../components/ServiceCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { ACTIVE_INACTIVE_FILTER_OPTIONS } from "../helpers/statusFilters";
import {
  Stethoscope,
  Plus,
  Loader2,
  DollarSign,
  Clock,
  Tag,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function ServicesPage() {
  const {
    services,
    isLoading,
    handleAddService,
    handleUpdateService,
    handleDeleteService,
  } = useServices();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeMenuId, setActiveMenuId] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingService(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setEditingService(srv);
    setIsFormModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteClick = (id) => {
    setServiceToDelete(id);
    setDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      setIsDeleting(true);
      await handleDeleteService(serviceToDelete);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    const payload = {
      ...formData,
      default_price: Number(formData.default_price),
      duration_minutes: Number(formData.duration_minutes),
    };

    if (editingService) {
      await handleUpdateService({
        id: editingService.id,
        updatedData: payload,
      });
    } else {
      await handleAddService(payload);
    }
  };

  const filteredServices = useMemo(
    () =>
      services.filter((s) => {
        const matchesSearch =
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || s.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [services, searchQuery, statusFilter],
  );

  const categoryOptions = [
    { label: "استشارات", value: "استشارات" },
    { label: "علاج طبيعي", value: "علاج طبيعي" },
    { label: "جلسات ليزر", value: "جلسات ليزر" },
    { label: "تأهيل وتخسيس", value: "تأهيل وتخسيس" },
    { label: "أخرى", value: "أخرى" },
  ];

  const serviceFormFields = [
    {
      name: "name",
      label: "اسم الخدمة",
      type: "text",
      placeholder: "مثال: خدمة علاجية رقم 1",
      icon: Stethoscope,
    },
    {
      name: "category",
      label: "فئة الخدمة",
      type: "select",
      icon: Tag,
      options: categoryOptions,
    },
    {
      name: "description",
      label: "وصف الخدمة",
      type: "textarea",
      placeholder: "اكتب وصفاً موجزاً لما تقدمه هذه الخدمة...",
      icon: FileText,
    },
    {
      name: "default_price",
      label: "السعر الافتراضي (ج.م)",
      type: "number",
      placeholder: "300",
      icon: DollarSign,
    },
    {
      name: "duration_minutes",
      label: "المدة (بالدقائق)",
      type: "number",
      placeholder: "35",
      icon: Clock,
    },
    {
      name: "status",
      label: "حالة الخدمة",
      type: "select",
      icon: CheckCircle2,
      options: [
        { label: "نشطة (Active)", value: "Active" },
        { label: "غير نشطة (Inactive)", value: "Inactive" },
      ],
    },
  ];

  return (
    <div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      dir="rtl"
      onClick={() => setActiveMenuId(null)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-bold">
            المالية والخدمات
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            الخدمات العلاجية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة الخدمات الطبية المتاحة وأسعارها ومدة الجلسات
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>خدمة جديدة</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث باسم الخدمة أو الفئة..."
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
        <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-card rounded-3xl border border-border">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جاري تحميل الخدمات...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                activeMenuId={activeMenuId}
                onToggleMenu={setActiveMenuId}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground font-medium bg-card border border-border rounded-3xl shadow-sm">
              لا توجد خدمات علاجية مطابقة للبحث.
            </div>
          )}
        </div>
      )}

      {isFormModalOpen && (
        <ReusableForm
          title={editingService ? "تعديل الخدمة العلاجية" : "إضافة خدمة جديدة"}
          fields={serviceFormFields}
          initialData={
            editingService || {
              name: "",
              category: "استشارات",
              description: "",
              default_price: "",
              duration_minutes: "",
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
        title="حذف الخدمة العلاجية"
        description="هل أنت متأكد من رغبتك في حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="نعم، احذف الخدمة"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
