import { useMemo, useState } from "react";
import { useMedicalDevices } from "../hooks/useMedicalDevices";
import { MedicalDevicesTable } from "../components/MedicalDevicesTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingState } from "../components/ui/LoadingState";
import DeviceStats from "../components/DeviceStats";
import { DEVICE_FORM_FIELDS } from "../helpers/medicalDevices.helpers";
import { countBy } from "../utils/stats";
import { Plus } from "lucide-react";

export default function MedicalDevicesPage() {
  const {
    devices,
    isLoading,
    handleAddDevice,
    handleUpdateDevice,
    handleStatusChange,
    handleDeleteDevice,
  } = useMedicalDevices();

  const [searchQuery, setSearchQuery] = useState("");

  // حالات للتحكم في فتح وغلق مودال الفورم وتحديد نوعه (إضافة أو تعديل)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  // حالات مودال التأكيد بالحذف
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // فتح مودال الإضافة
  const handleOpenAdd = () => {
    setEditingDevice(null);
    setIsFormModalOpen(true);
  };

  // فتح مودال التعديل مع تمرير بيانات الجهاز الحالي
  const handleOpenEdit = (dev) => {
    setEditingDevice(dev);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeviceToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete) return;
    try {
      setIsDeleting(true);
      await handleDeleteDevice(deviceToDelete);
      setDeleteModalOpen(false);
      setDeviceToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // دالة الحفظ الموحدة (للإضافة أو التعديل)
  const handleFormSubmit = async (formData) => {
    if (editingDevice) {
      await handleUpdateDevice({ id: editingDevice.id, updatedData: formData });
    } else {
      await handleAddDevice(formData);
    }
  };

  const filteredDevices = useMemo(
    () =>
      devices.filter(
        (d) =>
          d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.room_id?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [devices, searchQuery],
  );

  const deviceCounts = useMemo(
    () => ({
      totalCount: devices.length,
      workingCount: countBy(devices, (d) => d.status === "Operational"),
      maintenanceCount: countBy(devices, (d) => d.status === "Maintenance"),
      outOfServiceCount: countBy(devices, (d) => d.status === "Out-Of-Service"),
    }),
    [devices],
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      {/* عنوان الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-bold">
            المخزون والمعدات
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            الأجهزة الطبية
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            سجل الأجهزة، الأرقام التسلسلية، الغرف، وحالة التشغيل.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة جهاز جديد</span>
        </button>
      </div>

      {/* لوحة الإحصائيات السريعة */}
      <DeviceStats {...deviceCounts} />

      {/* شريط البحث */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="بحث باسم الجهاز، الرقم التسلسلي، أو كود الغرفة..."
      />

      {/* محتوى الجدول أو حالة التحميل */}
      {isLoading ? (
        <LoadingState message="جاري تحميل بيانات الأجهزة الطبية..." />
      ) : (
        <MedicalDevicesTable
          devices={filteredDevices}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteClick}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* مودال الفورم القابل لإعادة الاستخدام (للإضافة والتعديل) */}
      {isFormModalOpen && (
        <ReusableForm
          title={editingDevice ? "تعديل بيانات الجهاز" : "إضافة جهاز طبي جديد"}
          fields={DEVICE_FORM_FIELDS}
          initialData={
            editingDevice || {
              name: "",
              serial_number: "",
              room_id: "",
              status: "Operational",
            }
          }
          onSubmit={handleFormSubmit}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      {/* نافذة التأكيد بالحذف الاحترافية */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الجهاز الطبي"
        description="هل أنت متأكد من رغبتك في حذف هذا الجهاز؟ لا يمكن التراجع عن هذا الإجراء وسيتم إزالته نهائياً من السجلات."
        confirmText="نعم، احذف الجهاز"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
