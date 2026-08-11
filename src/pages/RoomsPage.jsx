import { useMemo, useState } from "react";
import { useRooms } from "../hooks/useRooms";
import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../permissions/permissions";
import { RoomCard } from "../components/rooms/RoomCard";
import { AssignPatientToBedModal } from "../components/rooms/AssignPatientToBedModal";
import { AddBedModal } from "../components/rooms/AddBedModal";
import { ManageRoomDevicesModal } from "../components/rooms/ManageRoomDevicesModal";
import { StatsGrid } from "../components/ui/StatCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { ROOM_FORM_FIELDS, groupByRoomId, getBedOccupant, computeRoomDisplayStatus } from "../helpers/rooms.helpers";
import { ROOM_STATUS_FILTER_OPTIONS } from "../helpers/statusFilters";
import { countBy } from "../utils/stats";
import {
  Building2,
  Plus,
  CheckCircle2,
  Users,
  Wrench,
  Ban,
} from "lucide-react";

export default function RoomsPage() {
  const { role } = useAuth();
  const canManage = hasPermission(role, "rooms:manage");

  const {
    rooms,
    beds,
    devices,
    equipment,
    treatmentSessions,
    patients,
    appointments,
    isLoading,
    handleAddRoom,
    handleUpdateRoom,
    handleUpdateRoomStatus,
    handleUpdateBedStatus,
    handleDeleteRoom,
    handleAddBed,
    isAddingBed,
    handleDeleteBed,
    assignPatientToBed,
    isAssigningPatient,
    releaseBed,
  } = useRooms();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignContext, setAssignContext] = useState(null); // { roomId, bedId } | null
  const [bedRoomTarget, setBedRoomTarget] = useState(null); 
  const [deviceRoomTarget, setDeviceRoomTarget] = useState(null); 

  const bedsByRoom = useMemo(() => groupByRoomId(beds), [beds]);
  const devicesByRoom = useMemo(() => groupByRoomId(devices), [devices]);
  const equipmentByRoom = useMemo(() => groupByRoomId(equipment), [equipment]);
  const enrichedBeds = useMemo(
    () => beds.map((bed) => ({ ...bed, occupant: getBedOccupant(bed, treatmentSessions, patients, appointments) })),
    [beds, treatmentSessions, patients, appointments],
  );
  const enrichedBedsByRoom = useMemo(() => groupByRoomId(enrichedBeds), [enrichedBeds]);

  const roomStats = useMemo(() => {
    const displayStatuses = rooms.map((r) => computeRoomDisplayStatus(r, bedsByRoom.get(r.id) ?? []));
    const totalRooms = rooms.length;
    const occupiedRooms = countBy(displayStatuses, (s) => s === "Occupied");
    const availableRooms = countBy(displayStatuses, (s) => s === "Available");
    const cleaningRooms = countBy(displayStatuses, (s) => s === "Cleaning");
    const outOfServiceRooms = countBy(displayStatuses, (s) => s === "OutOfService");
    const occupancyPercentage = Math.round((occupiedRooms / (totalRooms || 1)) * 100);
    return { totalRooms, occupiedRooms, availableRooms, cleaningRooms, outOfServiceRooms, occupancyPercentage };
  }, [rooms, bedsByRoom]);

  const { totalRooms, occupiedRooms, availableRooms, cleaningRooms, outOfServiceRooms, occupancyPercentage } = roomStats;

  const statsItems = useMemo(
    () => [
      {
        key: "total",
        label: "إجمالي الغرف",
        value: totalRooms,
        icon: Building2,
        iconWrapperClassName: "bg-primary/15 text-primary",
        gradient: "from-primary/[0.07] via-transparent to-transparent",
        active: statusFilter === "all",
        onClick: () => setStatusFilter("all"),
      },
      {
        key: "occupied",
        label: "مشغولة",
        value: occupiedRooms,
        icon: Users,
        iconWrapperClassName: "bg-rose-500/15 text-rose-600",
        gradient: "from-rose-500/[0.07] via-transparent to-transparent",
        active: statusFilter === "Occupied",
        onClick: () => setStatusFilter("Occupied"),
      },
      {
        key: "available",
        label: "متاحة",
        value: availableRooms,
        icon: CheckCircle2,
        iconWrapperClassName: "bg-emerald-500/15 text-emerald-600",
        gradient: "from-emerald-500/[0.07] via-transparent to-transparent",
        active: statusFilter === "Available",
        onClick: () => setStatusFilter("Available"),
      },
      {
        key: "cleaning",
        label: "تحت التنظيف",
        value: cleaningRooms,
        icon: Wrench,
        iconWrapperClassName: "bg-amber-500/15 text-amber-600",
        gradient: "from-amber-500/[0.07] via-transparent to-transparent",
        active: statusFilter === "Cleaning",
        onClick: () => setStatusFilter("Cleaning"),
      },
      {
        key: "outOfService",
        label: "خارج الخدمة",
        value: outOfServiceRooms,
        icon: Ban,
        iconWrapperClassName: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
        gradient: "from-zinc-500/[0.07] via-transparent to-transparent",
        active: statusFilter === "OutOfService",
        onClick: () => setStatusFilter("OutOfService"),
      },
    ],
    [totalRooms, occupiedRooms, availableRooms, cleaningRooms, outOfServiceRooms, statusFilter],
  );

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        const matchesSearch =
          room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.type?.toLowerCase().includes(searchQuery.toLowerCase());
        const displayStatus = computeRoomDisplayStatus(room, bedsByRoom.get(room.id) ?? []);
        const matchesStatus = statusFilter === "all" || displayStatus === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [rooms, bedsByRoom, searchQuery, statusFilter],
  );

  const handleDeleteClick = (id) => {
    setRoomToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete) return;
    try {
      setIsDeleting(true);
      await handleDeleteRoom(roomToDelete);
      setDeleteModalOpen(false);
      setRoomToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddRoomSubmit = async (formData) => {
    if (roomToEdit) {
      await handleUpdateRoom({ id: roomToEdit.id, updatedData: { ...roomToEdit, ...formData } });
    } else {
      await handleAddRoom(formData);
    }
  };

  const handleRoomStatusChange = (id, status) => handleUpdateRoomStatus({ id, status });
  const handleBedStatusChange = (id, status) => handleUpdateBedStatus({ id, status });
  const handleReleaseBed = (bedId) => releaseBed({ bedId });
  const handleAssignPatient = (room, bed) => setAssignContext({ roomId: room?.id ?? null, bedId: bed?.id ?? null });

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-bold">
            إدارة الموارد
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            إدارة الغرف والأسرة
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {totalRooms} غرف تشغيلية — نسبة الإشغال الحالية{" "}
            {occupancyPercentage}%
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleAssignPatient(null, null)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-card border border-border text-foreground font-bold text-xs shadow-sm hover:bg-muted/60 transition-all cursor-pointer whitespace-nowrap"
            >
              <Users className="h-4 w-4" />
              <span>تعيين مريض لسرير</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة غرفة جديدة</span>
            </button>
          </div>
        )}
      </div>

      <StatsGrid items={statsItems} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-5" />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث باسم الغرفة أو النوع..."
          variant="boxed"
          className="flex-1"
        />
        <StatusFilterDropdown
          options={ROOM_STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
        />
      </div>

      {isLoading ? (
        <LoadingState message="جاري تحميل بيانات الغرف..." rounded="rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                beds={enrichedBedsByRoom.get(room.id) ?? []}
                devices={devicesByRoom.get(room.id) ?? []}
                equipment={equipmentByRoom.get(room.id) ?? []}
                canManage={canManage}
                onAssignPatient={handleAssignPatient}
                onReleaseBed={handleReleaseBed}
                onChangeBedStatus={handleBedStatusChange}
                onDeleteBed={handleDeleteBed}
                onChangeRoomStatus={handleRoomStatusChange}
                onAddBed={setBedRoomTarget}
                onManageDevices={setDeviceRoomTarget}
                onEditRoom={setRoomToEdit}
                onDeleteRoom={handleDeleteClick}
              />
            ))
          ) : (
            <EmptyState message="لا توجد غرف مطابقة لكلمة البحث." colSpanFull />
          )}
        </div>
      )}

      {(isAddModalOpen || roomToEdit) && (
        <ReusableForm
          title={roomToEdit ? "تعديل الغرفة" : "إضافة غرفة جديدة"}
          fields={ROOM_FORM_FIELDS}
          initialData={roomToEdit ?? { name: "", type: "Consultation", status: "Available" }}
          onSubmit={handleAddRoomSubmit}
          onClose={() => {
            setIsAddModalOpen(false);
            setRoomToEdit(null);
          }}
        />
      )}

      <AssignPatientToBedModal
        key={assignContext ? `${assignContext.roomId ?? "any"}-${assignContext.bedId ?? "any"}` : "assign-closed"}
        isOpen={!!assignContext}
        rooms={rooms}
        beds={beds}
        patients={patients}
        initialRoomId={assignContext?.roomId}
        initialBedId={assignContext?.bedId}
        isSubmitting={isAssigningPatient}
        onClose={() => setAssignContext(null)}
        onAssign={assignPatientToBed}
      />

      <AddBedModal
        key={bedRoomTarget?.id ?? "add-bed-closed"}
        isOpen={!!bedRoomTarget}
        room={bedRoomTarget}
        isSubmitting={isAddingBed}
        onClose={() => setBedRoomTarget(null)}
        onAdd={handleAddBed}
      />

      <ManageRoomDevicesModal
        key={deviceRoomTarget?.id ?? "manage-devices-closed"}
        isOpen={!!deviceRoomTarget}
        room={deviceRoomTarget}
        roomDevices={deviceRoomTarget ? (devicesByRoom.get(deviceRoomTarget.id) ?? []) : []}
        onClose={() => setDeviceRoomTarget(null)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="حذف الغرفة"
        description="هل أنت متأكد من رغبتك في حذف هذه الغرفة وجميع الأسرة والأجهزة المرتبطة بها؟"
        confirmText="نعم، احذف الغرفة"
        cancelText="إلغاء"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
