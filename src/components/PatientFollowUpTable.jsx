import { useState } from "react";
import { Phone, MessageCircle, Edit2, ChevronDown } from "lucide-react";
import { ReusableTable } from "./ui/ReusableTable";

export function PatientFollowUpTable({ patients, onUpdateStatus }) {
  const [editingId, setEditingId] = useState(null);
  const [tempNotes, setTempNotes] = useState("");
  const [dropdownId, setDropdownId] = useState(null);

  // ألوان شارات حالات المتابعة المختلفة
  const getFollowUpStatusColor = (status) => {
    switch (status) {
      case "بحاجة اتصال":
        return "bg-rose-500/10 text-rose-600 border border-rose-300";
      case "تم الاتصال":
      case "تم الاتصال — بانتظار":
        return "bg-amber-500/10 text-amber-600 border border-amber-300";
      case "أعاد الحجز":
      case "أعادوا الحجز":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-300";
      case "لن يعود":
      case "لن يعودوا":
        return "bg-slate-500/10 text-slate-600 border border-slate-300";
      default:
        return "bg-primary/10 text-primary border border-primary/20";
    }
  };

  const columns = [
    {
      header: "المريض",
      render: (patient) => (
        <span className="font-bold text-foreground truncate">
          {patient.patientName}
        </span>
      ),
      className: "w-[15%]",
    },
    {
      header: "الهاتف",
      render: (patient) => (
        <span className="font-mono text-muted-foreground">
          {patient.patientPhone}
        </span>
      ),
      className: "w-[12%]",
    },
    {
      header: "الطبيب",
      accessor: "doctorName",
      className: "text-muted-foreground font-medium w-[12%]",
    },
    {
      header: "آخر تحديث",
      accessor: "lastUpdate",
      className: "text-muted-foreground font-medium font-mono w-[10%]",
    },

    {
      header: "ملاحظة / سبب الغياب",
      render: (patient) => {
        const isEditing = editingId === patient.id;
        return isEditing ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={tempNotes}
              onChange={(e) => setTempNotes(e.target.value)}
              className="border border-input rounded px-2 py-1 text-xs w-full bg-background text-foreground focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                onUpdateStatus({
                  followUpId: patient.id,
                  status: patient.status,
                  followUpStatus: patient.followUpStatus, // الحفاظ على الحالة الحالية وعدم تصفيرها
                  notes: tempNotes.trim() === "" ? "—" : tempNotes,
                });
              }}
              className="bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs cursor-pointer font-medium"
            >
              حفظ
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <span className="truncate max-w-[150px] text-muted-foreground">
              {patient.notes}
            </span>
            <button
              type="button"
              onClick={() => {
                setEditingId(patient.id);
                setTempNotes(patient.notes === "—" ? "" : patient.notes);
              }}
              className="text-muted-foreground hover:text-primary p-1 cursor-pointer transition-colors"
              title="تعديل الملاحظة"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
      className: "w-[18%]",
    },
    {
      header: "مسؤول المتابعة",
      accessor: "followUpStaff",
      className: "text-muted-foreground font-medium w-[12%]",
    },
    {
      header: "الحالة",
      render: (patient) => {
        const isOpen = dropdownId === patient.id;
        return (
          <div className="relative inline-block text-right">
            <button
              type="button"
              onClick={() => setDropdownId(isOpen ? null : patient.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center justify-between gap-2 min-w-[130px] shadow-sm ${getFollowUpStatusColor(
                patient.followUpStatus,
              )} cursor-pointer transition-all hover:opacity-80`}
            >
              <span className="truncate">{patient.followUpStatus}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <>
                {/* طبقة شفافة لإغلاق القائمة عند النقر خارجها */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setDropdownId(null)}
                />

                <div className="absolute z-30 top-full mt-2 right-0 bg-card border border-border rounded-2xl shadow-xl p-1.5 min-w-[150px] space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  {["بحاجة اتصال", "تم الاتصال", "أعاد الحجز", "لن يعود"].map(
                    (statusOption) => {
                      const isSelected =
                        patient.followUpStatus === statusOption;
                      return (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => {
                            setDropdownId(null);
                            onUpdateStatus({
                              followUpId: patient.id,
                              status: patient.status,
                              followUpStatus: statusOption,
                              notes: patient.notes,
                            });
                          }}
                          className={`w-full text-right px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span>{statusOption}</span>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              </>
            )}
          </div>
        );
      },
      className: "w-[15%]",
    },
    {
      header: "إجراءات التواصل",
      render: (patient) => {
        const phoneNo = patient.patientPhone || "201000000000";
        const whatsappUrl = `https://wa.me/${phoneNo}?text=${encodeURIComponent(
          `مرحباً ${patient.patientName}، لاحظنا عدم حضورك لموعدك الأخير ونود الاطمئنان عليك.`,
        )}`;

        return (
          <div className="flex items-center justify-center gap-2">
            <a
              href={`tel:${phoneNo}`}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary transition-all"
              title="اتصال هاتفي"
            >
              <Phone className="h-3.5 w-3.5" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
              title="مراسلة واتساب"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </a>
          </div>
        );
      },
      className: "text-center w-[15%]",
    },
  ];

  return (
    <ReusableTable
      columns={columns}
      data={patients}
      rowsPerPage={10}
      emptyMessage="لا يوجد مرضى متخلفين عن المواعيد حالياً."
    />
  );
}
