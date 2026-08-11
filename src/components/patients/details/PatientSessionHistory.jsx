import { ReusableTable } from "../../ui/ReusableTable";
import { formatDate, formatTime } from "../../../utils/date";

const STATUS_STYLES = {
  Completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "In-Progress": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  InSession: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  Scheduled: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

export function PatientSessionHistory({ sessions }) {
  const columns = [
    {
      header: "التاريخ",
      render: (s) => {
        const actualDate = s.actual_started_at || s.starts_at;
        return (
          <div>
            <p className="font-bold text-foreground">{formatDate(actualDate)}</p>
            <p className="text-muted-foreground">{formatTime(actualDate)}</p>
          </div>
        );
      },
    },
    { header: "الطبيب", accessor: "doctorName", className: "font-bold text-foreground" },
    { header: "الخدمة", accessor: "serviceName", className: "text-muted-foreground" },
    { header: "الغرفة", accessor: "roomName", className: "text-muted-foreground hidden md:table-cell" },
    {
      header: "المدة",
      render: (s) => (s.durationMinutes != null ? `${s.durationMinutes} دقيقة` : "—"),
      className: "text-muted-foreground",
    },
    {
      header: "الحالة",
      render: (s) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${
            STATUS_STYLES[s.status] ?? "bg-muted text-muted-foreground border-border"
          }`}
        >
          {s.status}
        </span>
      ),
    },
    {
      header: "ملاحظات",
      render: (s) => s.prescription?.notes || "—",
      className: "text-muted-foreground hidden lg:table-cell max-w-[200px] truncate",
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={sessions}
      rowsPerPage={8}
      emptyMessage="لا توجد جلسات علاجية مسجّلة لهذا المريض"
    />
  );
}
