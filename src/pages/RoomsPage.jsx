import { useMemo, useState } from "react";
import { useRooms } from "../hooks/useRooms";
import { RoomCard } from "../components/RoomCard";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ReusableForm } from "../components/ui/ReusableForm";
import { SearchBar } from "../components/ui/SearchBar";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { ROOM_FORM_FIELDS, groupByRoomId } from "../helpers/rooms.helpers";
import { countBy } from "../utils/stats";
import { Building2, Plus, CheckCircle2, Users, Wrench } from "lucide-react";

export default function RoomsPage() {
  const {
    rooms,
    beds,
    devices,
    equipment,
    isLoading,
    handleAddRoom,
    handleDeleteRoom,
  } = useRooms();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // إحصائيات سريعة
  const roomStats = useMemo(() => {
    const totalRooms = rooms.length;
    const occupiedRooms = countBy(rooms, (r) => r.status === "Occupied");
    const availableRooms = countBy(rooms, (r) => r.status === "Available");
    const cleaningRooms = countBy(rooms, (r) => r.status === "Cleaning");
    const outOfServiceRooms = countBy(rooms, (r) => r.status === "Out of Service");
    const occupancyPercentage = Math.round((occupiedRooms / (totalRooms || 1)) * 100);
    return { totalRooms, occupiedRooms, availableRooms, cleaningRooms, outOfServiceRooms, occupancyPercentage };
  }, [rooms]);

  const { totalRooms, occupiedRooms, availableRooms, cleaningRooms, outOfServiceRooms, occupancyPercentage  } =
    roomStats;

  // تجميع الأسرة/الأجهزة/المعدات حسب الغرفة مرة واحدة بدلاً من الفلترة داخل كل عنصر أثناء العرض
  const bedsByRoom = useMemo(() => groupByRoomId(beds), [beds]);
  const devicesByRoom = useMemo(() => groupByRoomId(devices), [devices]);
  const equipmentByRoom = useMemo(() => groupByRoomId(equipment), [equipment]);

  const filteredRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.type?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [rooms, searchQuery],
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
    await handleAddRoom(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* رأس الصفحة والإحصائيات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-muted-foreground font-bold">
            إدارة الموارد
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            إدارة الغرف والأسرة
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {totalRooms} غرف تشغيلية — نسبة الإشغال الحالية %
            {occupancyPercentage}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة غرفة جديدة</span>
        </button>
      </div>

      {/* شريط الإحصائيات العلوي */}
      <div className="bg-card border border-border rounded-3xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-2xl bg-muted/40 flex items-center justify-between px-6">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-medium block">
              إجمالي الغرف
            </span>
            <span className="text-2xl font-black text-foreground">{totalRooms}</span>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-muted/40 flex items-center justify-between px-6">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-medium block">
              مشغولة
            </span>
            <span className="text-2xl font-black text-rose-600">{occupiedRooms}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-muted/40 flex items-center justify-between px-6">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-medium block">
              متاحة
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {availableRooms}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-muted/40 flex items-center justify-between px-6">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-medium block">
              تنظيف
            </span>
            <span className="text-2xl font-black text-amber-600">{cleaningRooms}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Wrench className="h-5 w-5" />
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-muted/40 flex items-center justify-between px-6">
          <div className="text-right">
            <span className="text-xs text-muted-foreground font-medium block">
              خارج الخدمة 
            </span>
            <span className="text-2xl font-black text-amber-600">{outOfServiceRooms}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Wrench className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="بحث باسم الغرفة أو النوع..."
        variant="boxed"
      />

      {/* عرض الغرف */}
      {isLoading ? (
        <LoadingState message="جاري تحميل بيانات الغرف..." rounded="rounded-3xl" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                beds={bedsByRoom.get(room.id) ?? []}
                devices={devicesByRoom.get(room.id) ?? []}
                equipment={equipmentByRoom.get(room.id) ?? []}
                onDelete={handleDeleteClick}
              />
            ))
          ) : (
            <EmptyState message="لا توجد غرف مطابقة لكلمة البحث." colSpanFull />
          )}
        </div>
      )}

      {/* مودال إضافة غرفة */}
      {isAddModalOpen && (
        <ReusableForm
          title="إضافة غرفة جديدة"
          fields={ROOM_FORM_FIELDS}
          initialData={{ name: "", type: "Consultation", status: "Available" }}
          onSubmit={handleAddRoomSubmit}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* مودال تأكيد الحذف */}
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
