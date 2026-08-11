import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../api/client";
import { useMedicalDevices } from "../hooks/useMedicalDevices";
import { MedicalDevicesTable } from "../components/MedicalDevicesTable";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import DeviceStats from "../components/DeviceStats";
import { getDeviceFormFields } from "../helpers/medicalDevices.helpers";
import { DEVICE_STATUS_FILTER_OPTIONS } from "../helpers/statusFilters";
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

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: () => apiRequest("/rooms"),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const roomOptions = useMemo(
    () => (roomsQuery.data ?? []).map((r) => ({ label: r.name, value: r.id })),
    [roomsQuery.data],
  );
  const deviceFormFields = useMemo(() => getDeviceFormFields(roomOptions), [roomOptions]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setEditingDevice(null);
    setIsFormModalOpen(true);
  };

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

  const handleFormSubmit = async (formData) => {
    if (editingDevice) {
      await handleUpdateDevice({ id: editingDevice.id, updatedData: formData });
    } else {
      await handleAddDevice(formData);
    }
  };

const filteredDevices = useMemo(
  () =>
    devices.filter((d) => {
      const matchesSearch =
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.serial_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.room_id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        d.status?.toLowerCase() === statusFilter?.toLowerCase();

      return matchesSearch && matchesStatus;
    }),
  [devices, searchQuery, statusFilter],
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

      <DeviceStats {...deviceCounts} />

      <div className="flex flex-col  justify-between sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث باسم الجهاز، الرقم التسلسلي، أو كود الغرفة..."
          className="max-w-md flex-1"
        />
        <StatusFilterDropdown
          options={DEVICE_STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
        />
      </div>

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

      {isFormModalOpen && (
        <ReusableForm
          title={editingDevice ? "تعديل بيانات الجهاز" : "إضافة جهاز طبي جديد"}
          fields={deviceFormFields}
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
