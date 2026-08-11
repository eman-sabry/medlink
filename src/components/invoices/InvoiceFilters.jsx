import { Stethoscope } from "lucide-react";
import { SearchBar } from "../ui/SearchBar";
import { StatusFilterDropdown } from "../ui/StatusFilterDropdown";
import {
  INVOICE_STATUS_FILTER_OPTIONS,
  DATE_RANGE_FILTER_OPTIONS,
  buildMethodFilterOptions,
} from "../../helpers/invoices.helpers";

function buildDoctorOptions(doctors) {
  return [
    { key: "all", label: "كل الأطباء", icon: Stethoscope, style: "bg-card text-foreground border-border hover:bg-muted/30" },
    ...doctors.map((d) => ({
      key: d.id,
      label: d.full_name,
      icon: Stethoscope,
      style: "bg-indigo-500/10 text-indigo-600 border-indigo-500/30",
      textClass: "text-indigo-600",
    })),
  ];
}

export function InvoiceFilters({ filters, onChange, doctors }) {
  const methodOptions = buildMethodFilterOptions();
  const doctorOptions = buildDoctorOptions(doctors);

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3">
      <SearchBar
        value={filters.search}
        onChange={(value) => onChange({ ...filters, search: value })}
        placeholder="ابحث برقم الفاتورة، اسم المريض، رقم الملف، أو الهاتف..."
        className="max-w-md"
      />
      <div className="flex flex-wrap items-center gap-2">
        <StatusFilterDropdown
          options={INVOICE_STATUS_FILTER_OPTIONS}
          value={filters.status}
          onChange={(status) => onChange({ ...filters, status })}
          triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
        />
        <StatusFilterDropdown
          options={DATE_RANGE_FILTER_OPTIONS}
          value={filters.dateRange}
          onChange={(dateRange) => onChange({ ...filters, dateRange })}
          triggerClassName="w-full sm:w-40 h-12 px-4 text-xs"
        />
        <StatusFilterDropdown
          options={methodOptions}
          value={filters.method}
          onChange={(method) => onChange({ ...filters, method })}
          triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
        />
        {doctors.length > 0 && (
          <StatusFilterDropdown
            options={doctorOptions}
            value={filters.doctorId}
            onChange={(doctorId) => onChange({ ...filters, doctorId })}
            triggerClassName="w-full sm:w-48 h-12 px-4 text-xs"
          />
        )}
      </div>
    </div>
  );
}
