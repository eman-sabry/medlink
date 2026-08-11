import { useMemo } from "react";
import { usePatientFollowUp } from "../hooks/usePatientFollowUp";
import { PatientFollowUpTable } from "../components/PatientFollowUpTable";
import { StatsGrid } from "../components/ui/StatCard";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { LoadingState } from "../components/ui/LoadingState";
import {
  FOLLOW_UP_STAT_CONFIG,
  FOLLOW_UP_TAB_OPTIONS,
} from "../helpers/patientFollowUp.helpers";

export default function PatientFollowUpPage() {
  const {
    patients,
    allPatientsCount,
    stats,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    updateStatus,
    isLoading,
  } = usePatientFollowUp();

  const statItems = useMemo(
    () =>
      FOLLOW_UP_STAT_CONFIG.map((item) => ({
        ...item,
        value: stats[item.key],
        suffix: "مريض",
        onClick: () => setActiveTab(item.key),
        active: activeTab === item.key,
      })),
    [stats, activeTab, setActiveTab],
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            متابعة المتخلفين عن المواعيد
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة ومتابعة المرضى الذين تخلفوا عن حضور مواعيدهم وإعادة جدولتها.
          </p>
        </div>
      </div>

      <StatsGrid items={statItems} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 ">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="بحث بالاسم أو رقم الهاتف..."
          className="sm:w-80"
        />

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {activeTab !== "all" && (
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="text-xs font-semibold px-4 py-2.5 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              عرض الكل ({allPatientsCount})
            </button>
          )}

          <StatusFilterDropdown
            options={FOLLOW_UP_TAB_OPTIONS}
            value={activeTab}
            onChange={setActiveTab}
            triggerClassName="w-full sm:w-52 px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="جاري تحميل بيانات المتابعة..." />
      ) : (
        <PatientFollowUpTable patients={patients} onUpdateStatus={updateStatus} />
      )}
    </div>
  );
}
