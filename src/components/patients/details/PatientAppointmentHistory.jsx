import { useState } from "react";
import { Eye } from "lucide-react";
import { ReusableTable } from "../../ui/ReusableTable";
import { AppointmentDetailModal } from "./AppointmentDetailModal";
import { STATUS_FILTER_OPTIONS } from "../../../helpers/appointmentStatus.helpers";
import { formatDate, formatTime } from "../../../utils/date";

function StatusBadge({ status }) {
  const config = STATUS_FILTER_OPTIONS.find((o) => o.key === status);
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
        config?.style ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {config?.label ?? status}
    </span>
  );
}

export function PatientAppointmentHistory({ appointments }) {
  const [selected, setSelected] = useState(null);

  const columns = [
    {
      header: "التاريخ والوقت",
      render: (a) => (
        <div>
          <p className="font-bold text-foreground">{formatDate(a.starts_at)}</p>
          <p className="text-muted-foreground">{formatTime(a.starts_at)}</p>
        </div>
      ),
    },
    { header: "الطبيب", accessor: "doctor_name", className: "font-bold text-foreground" },
    { header: "الخدمة", accessor: "service_name", className: "text-muted-foreground" },
    { header: "الغرفة", accessor: "room_name", className: "text-muted-foreground hidden md:table-cell" },
    { header: "الحالة", render: (a) => <StatusBadge status={a.status} /> },
    {
      header: "",
      render: (a) => (
        <button
          type="button"
          onClick={() => setSelected(a)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
          title="عرض التفاصيل"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
      ),
      className: "text-center w-12",
    },
  ];

  return (
    <div className="space-y-4">
      <ReusableTable
        columns={columns}
        data={appointments}
        rowsPerPage={8}
        emptyMessage="لا توجد مواعيد مسجّلة لهذا المريض"
      />
      <AppointmentDetailModal appointment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
