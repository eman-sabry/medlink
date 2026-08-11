import { useCallback, useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentModal } from "../components/AppointmentModal";
import { DeleteAppointmentModal } from "../components/DeleteAppointmentModal";
import { AppointmentDetailsModal } from "../components/AppointmentDetailsModal";
import { AppointmentsStats } from "../components/AppointmentsStats";
import { AppointmentCard } from "../components/AppointmentCard";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { formatDate, formatTime } from "../utils/date";
import { filterAppointments } from "../helpers/appointmentFilters";
import { STATUS_FILTER_OPTIONS } from "../helpers/appointmentStatus.helpers";
import { PermissionGuard } from "../guards/PermissionGuard";

export default function AppointmentsPage() {
  const {
    appointments,
    stats,
    patients,
    doctors,
    isLoading,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    isDeleting,
  } = useAppointments();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsApp, setSelectedDetailsApp] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const filteredAppointments = useMemo(
    () => filterAppointments(appointments, { searchTerm, statusFilter, dateFilter }),
    [appointments, searchTerm, statusFilter, dateFilter],
  );

  const handleUpdateStatus = useCallback(
    async (app, newStatus) => {
      try {
        await updateAppointment({
          id: app.id,
          data: { ...app, status: newStatus },
        });
      } catch (err) {
        console.error("Failed updating appointment status:", err);
      }
    },
    [updateAppointment],
  );

  const handleEditAppointment = useCallback((appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  }, []);

  const handleRequestDelete = useCallback((id) => {
    setAppointmentToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  const handleViewAppointmentDetails = useCallback((appointment) => {
    setSelectedDetailsApp(appointment);
    setIsDetailsModalOpen(true);
  }, []);

  const handleSaveModal = async (data) => {
    try {
      let saved;
      if (editingAppointment) {
        saved = await updateAppointment({ id: editingAppointment.id, data });
      } else {
        saved = await addAppointment(data);
      }
      setIsModalOpen(false);
      setEditingAppointment(null);
      return saved;
    } catch (err) {
      console.error("Failed saving appointment:", err);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      try {
        await deleteAppointment(appointmentToDelete);
      } catch (err) {
        console.error("Failed deleting appointment:", err);
      } finally {
        setIsDeleteModalOpen(false);
        setAppointmentToDelete(null);
      }
    }
  };

 

  return (
    <div className="space-y-6 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto text-right">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            <CalendarDays className="h-3.5 w-3.5" />
            جدول المواعيد
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            مواعيد المركز
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            تابع حالة وصول المرضى، تسجيل الحضور، ومتابعة الجلسات اليومية بسهولة.
          </p>
        </div>

        <PermissionGuard permission="appointments:add">
          <button
            type="button"
            onClick={() => {
              setEditingAppointment(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span>حجز موعد جديد</span>
          </button>
        </PermissionGuard>
      </div>

      <AppointmentsStats
        stats={stats}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3.5 items-center justify-between ">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="بحث باسم المريض، رقم الملف، الهاتف، أو الطبيب المعالج..."
          className="lg:w-96"
        />

        <div className="flex flex-col sm:flex-row gap-3.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-48">
            <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              dir="ltr"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full h-12 pl-8 pr-11 rounded-2xl bg-muted/40 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer transition-all"
              title="تصفية حسب التاريخ"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="absolute left-3 pr-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          <StatusFilterDropdown
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <LoadingState message="جاري تحميل جدول المواعيد..." />
      ) : (
        <div className="space-y-3.5">
          <div className="text-xs font-bold text-muted-foreground px-2 flex items-center justify-between">
            <span>قائمة المواعيد المسجلة</span>
            <span className="bg-muted px-2.5 py-0.5 rounded-full text-foreground">
              {filteredAppointments.length} موعد
            </span>
          </div>

          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((app) => (
              <AppointmentCard
                key={app.id}
                app={app}
                onUpdateStatus={handleUpdateStatus}
                onEdit={handleEditAppointment}
                onDelete={handleRequestDelete}
                onViewDetails={handleViewAppointmentDetails}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))
          ) : (
            <EmptyState message="لا توجد مواعيد مطابقة للبحث." />
          )}
        </div>
      )}
      {/* Modals */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveModal}
        appointmentToEdit={editingAppointment}
        patients={patients}
        doctors={doctors}
      />

      <AppointmentDetailsModal
        isOpen={isDetailsModalOpen}
        appointment={selectedDetailsApp}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedDetailsApp(null);
        }}
      />

      <DeleteAppointmentModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
