import { Building2, CheckCircle2 } from "lucide-react";

export const ROOM_STATUS_META = {
  Available: { label: "متاحة", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", border: "border-emerald-500/40 hover:border-emerald-500" },
  Occupied: { label: "مشغولة", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20", border: "border-rose-500/40 hover:border-rose-500" },
  Cleaning: { label: "تنظيف", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", border: "border-amber-500/40 hover:border-amber-500" },
  OutOfService: { label: "خارج الخدمة", badge: "bg-slate-500/10 text-slate-600 border-slate-500/20", border: "border-slate-500/40 hover:border-slate-500" },
};

export const ROOM_STATUS_OPTIONS = [
  { value: "Available", label: "● متاحة" },
  { value: "Occupied", label: "● مشغولة" },
  { value: "Cleaning", label: "● تنظيف" },
  { value: "OutOfService", label: "● خارج الخدمة" },
];

export const MANUAL_ROOM_STATUSES = ["Cleaning", "OutOfService"];

export const BED_STATUS_META = {
  Available: { label: "متاح", badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  Occupied: { label: "مشغول", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
  Reserved: { label: "محجوز", badge: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  Maintenance: { label: "صيانة", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

export const BED_STATUS_OPTIONS = [
  { value: "Available", label: "متاح" },
  { value: "Occupied", label: "مشغول" },
  { value: "Reserved", label: "محجوز" },
  { value: "Maintenance", label: "صيانة" },
];

export const ROOM_FORM_FIELDS = [
  {
    name: "name",
    label: "اسم الغرفة",
    type: "text",
    placeholder: "مثال: غرفة رقم 11",
    icon: Building2,
  },
  {
    name: "type",
    label: "نوع الغرفة",
    type: "select",
    icon: Building2,
    options: [
      { label: "استشارة طبية (Consultation)", value: "Consultation" },
      { label: "قاعة تأهيل (Rehab)", value: "Rehab" },
      { label: "غرفة علاج (Treatment)", value: "Treatment" },
    ],
  },
  {
    name: "status",
    label: "الحالة الأولية",
    type: "select",
    icon: CheckCircle2,
    options: [
      { label: "متاحة (Available)", value: "Available" },
      { label: "مشغولة (Occupied)", value: "Occupied" },
      { label: "تحت التنظيف (Cleaning)", value: "Cleaning" },
    ],
  },
];

export function groupByRoomId(items) {
  const map = new Map();
  for (const item of items) {
    const list = map.get(item.room_id) ?? [];
    list.push(item);
    map.set(item.room_id, list);
  }
  return map;
}

export function isActiveSessionStatus(status) {
  return status !== "Completed" && status !== "Cancelled";
}

export function getBedOccupant(bed, treatmentSessions, patients, appointments = []) {
  if (!bed || bed.status !== "Occupied") return null;
  const session = treatmentSessions.find((s) => s.bed_id === bed.id && isActiveSessionStatus(s.status));
  if (!session) return null;
  const patient = patients.find((p) => p.id === session.patient_id) ?? null;
  const appointment = appointments.find((a) => a.id === session.appointment_id) ?? null;
  return { session, patient, expectedEndAt: appointment?.ends_at || null };
}

export function getRoomBedSummary(bedsInRoom) {
  const total = bedsInRoom.length;
  const available = bedsInRoom.filter((b) => b.status === "Available").length;
  const occupied = bedsInRoom.filter((b) => b.status === "Occupied").length;
  return { total, available, occupied };
}

export function getPatientCurrentOccupancy(patientId, treatmentSessions, rooms, beds) {
  const session = treatmentSessions.find(
    (s) => s.patient_id === patientId && s.bed_id && isActiveSessionStatus(s.status),
  );
  if (!session) return null;
  const room = rooms.find((r) => r.id === session.room_id) ?? null;
  const bed = beds.find((b) => b.id === session.bed_id) ?? null;
  return { session, room, bed };
}

export function computeRoomDisplayStatus(room, bedsInRoom) {
  if (!room) return "Available";
  if (MANUAL_ROOM_STATUSES.includes(room.status)) return room.status;
  if (bedsInRoom.length === 0) return room.status;
  return bedsInRoom.some((b) => b.status === "Occupied") ? "Occupied" : "Available";
}

export const ROOM_OCCUPANCY_LEVEL_META = {
  Available: ROOM_STATUS_META.Available,
  PartiallyOccupied: { label: "مشغولة جزئياً", badge: "bg-amber-500/10 text-amber-600 border-amber-500/20", border: "border-amber-500/40 hover:border-amber-500" },
  FullyOccupied: { label: "مشغولة بالكامل", badge: "bg-rose-500/10 text-rose-600 border-rose-500/20", border: "border-rose-500/40 hover:border-rose-500" },
  Cleaning: ROOM_STATUS_META.Cleaning,
  OutOfService: ROOM_STATUS_META.OutOfService,
};

export function computeRoomOccupancyLevel(room, bedsInRoom) {
  const status = computeRoomDisplayStatus(room, bedsInRoom);
  if (status !== "Occupied") return status;
  if (bedsInRoom.length === 0) return "FullyOccupied";
  const allOccupied = bedsInRoom.every((b) => b.status === "Occupied");
  return allOccupied ? "FullyOccupied" : "PartiallyOccupied";
}
