import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Wallet, Archive, ArchiveRestore, Printer } from "lucide-react";
import { apiRequest } from "../api/client";
import { useExpenses, DUPLICATE_EXPENSE_ERROR } from "../hooks/useExpenses";
import { useMaintenance } from "../hooks/useMaintenance";
import { useMedicalDevices } from "../hooks/useMedicalDevices";
import { useRooms } from "../hooks/useRooms";
import { PermissionGuard } from "../guards/PermissionGuard";
import { ExpensesStats } from "../components/expenses/ExpensesStats";
import { ExpenseCharts } from "../components/expenses/ExpenseCharts";
import { ExpenseFilters } from "../components/expenses/ExpenseFilters";
import { ExpensesTable } from "../components/expenses/ExpensesTable";
import { AddExpenseModal } from "../components/expenses/AddExpenseModal";
import { EditExpenseModal } from "../components/expenses/EditExpenseModal";
import { ExpenseDetailsModal } from "../components/expenses/ExpenseDetailsModal";
import { PrintableExpense } from "../components/expenses/PrintableExpense";
import { PrintableExpenseRegister } from "../components/expenses/PrintableExpenseRegister";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import {
  enrichExpenseList,
  filterExpenses,
  buildExpenseStats,
  buildExpenseCharts,
  EXPENSE_STATUS_FILTER_OPTIONS,
  DATE_RANGE_FILTER_OPTIONS,
  buildCategoryFilterOptions,
  buildSourceTypeFilterOptions,
  buildMethodFilterOptions,
} from "../helpers/expense.helpers";
import { printExpense, printExpenseReport } from "../helpers/expensePrint.helpers";

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  sourceType: "all",
  status: "all",
  paymentMethod: "all",
  dateRange: "all",
  createdBy: "all",
  minAmount: "",
  maxAmount: "",
};
const EMPTY_ARRAY = [];

export default function ExpensesPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpenseId, setViewingExpenseId] = useState(null);
  const [archivingExpense, setArchivingExpense] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [printExpenseId, setPrintExpenseId] = useState(null);
  const [printRegister, setPrintRegister] = useState(null);

  const {
    expenses: rawExpenses,
    isLoading: expensesLoading,
    isError: expensesError,
    refetch,
    addExpense,
    updateExpense,
    archivedExpenseIds,
    archiveExpense,
    restoreExpense,
  } = useExpenses();

  const { maintenanceEntries } = useMaintenance();
  const { devices } = useMedicalDevices();
  const { rooms } = useRooms();

  const staffQuery = useResource("staff", "/staff");
  const usersQuery = useResource("users", "/users");
  const centerSettingsQuery = useResource("center_settings", "/center_settings");

  const staffList = staffQuery.data ?? EMPTY_ARRAY;
  const usersList = usersQuery.data ?? EMPTY_ARRAY;
  const centerSettings = centerSettingsQuery.data?.[0] ?? null;

  const isLoading = expensesLoading || staffQuery.isLoading || usersQuery.isLoading;

  const enrichedExpenses = useMemo(
    () =>
      enrichExpenseList({
        expenses: rawExpenses,
        staffList,
        usersList,
        maintenanceList: maintenanceEntries,
        devicesList: devices,
        roomsList: rooms,
      }),
    [rawExpenses, staffList, usersList, maintenanceEntries, devices, rooms],
  );

  const activeExpenses = useMemo(
    () => enrichedExpenses.filter((exp) => !archivedExpenseIds.has(exp.id)),
    [enrichedExpenses, archivedExpenseIds],
  );
  const visibleExpenses = useMemo(
    () => (showArchived ? enrichedExpenses.filter((exp) => archivedExpenseIds.has(exp.id)) : activeExpenses),
    [enrichedExpenses, archivedExpenseIds, showArchived, activeExpenses],
  );

  const filteredExpenses = useMemo(() => filterExpenses(visibleExpenses, filters), [visibleExpenses, filters]);
  const expenseStats = useMemo(() => buildExpenseStats(activeExpenses), [activeExpenses]);
  const charts = useMemo(() => buildExpenseCharts(activeExpenses), [activeExpenses]);

  const viewingExpense = useMemo(
    () => enrichedExpenses.find((exp) => exp.id === viewingExpenseId) ?? null,
    [enrichedExpenses, viewingExpenseId],
  );
  const relatedMaintenance = useMemo(
    () =>
      viewingExpense?.sourceType === "Maintenance" && viewingExpense.source_id
        ? maintenanceEntries.find((m) => m.id === viewingExpense.source_id) ?? null
        : null,
    [viewingExpense, maintenanceEntries],
  );

  const printingExpense = useMemo(
    () => enrichedExpenses.find((exp) => exp.id === printExpenseId) ?? null,
    [enrichedExpenses, printExpenseId],
  );
  const printingRelatedMaintenance = useMemo(
    () =>
      printingExpense?.sourceType === "Maintenance" && printingExpense.source_id
        ? maintenanceEntries.find((m) => m.id === printingExpense.source_id) ?? null
        : null,
    [printingExpense, maintenanceEntries],
  );

  const filtersSummary = useMemo(() => {
    const parts = [];
    if (filters.status !== "all") parts.push(EXPENSE_STATUS_FILTER_OPTIONS.find((o) => o.key === filters.status)?.label);
    if (filters.category !== "all") {
      parts.push(buildCategoryFilterOptions().find((o) => o.key === filters.category)?.label);
    }
    if (filters.sourceType !== "all") {
      parts.push(buildSourceTypeFilterOptions().find((o) => o.key === filters.sourceType)?.label);
    }
    if (filters.paymentMethod !== "all") {
      parts.push(buildMethodFilterOptions().find((o) => o.key === filters.paymentMethod)?.label);
    }
    if (filters.dateRange !== "all") parts.push(DATE_RANGE_FILTER_OPTIONS.find((o) => o.key === filters.dateRange)?.label);
    if (filters.createdBy !== "all") {
      parts.push(usersList.find((u) => u.id === filters.createdBy)?.full_name);
    }
    if (filters.minAmount) parts.push(`أقل مبلغ: ${filters.minAmount}`);
    if (filters.maxAmount) parts.push(`أعلى مبلغ: ${filters.maxAmount}`);
    if (filters.search) parts.push(`بحث: "${filters.search}"`);
    return parts.filter(Boolean).join(" · ") || null;
  }, [filters, usersList]);

  const handleAddExpense = async (expense) => {
    try {
      await addExpense(expense);
    } catch (error) {
      if (error?.code === DUPLICATE_EXPENSE_ERROR && error.existingExpense) {
        setViewingExpenseId(error.existingExpense.id);
      }
      throw error;
    }
  };

  const handlePrintExpense = (expense) => {
    setPrintRegister(null);
    printExpense(setPrintExpenseId, expense.id);
  };
  const handlePrintRegister = () => {
    setPrintExpenseId(null);
    printExpenseReport(setPrintRegister, filteredExpenses);
  };

  const handleConfirmArchive = async () => {
    if (!archivingExpense) return;
    await archiveExpense(archivingExpense);
    setArchivingExpense(null);
  };

  return (
    <>
    <div className="p-6 max-w-7xl mx-auto space-y-6 print:hidden" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mt-2 flex items-center gap-2">
            <Wallet className="h-7 w-7 text-primary" />
            المصروفات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            تتبّع مصروفات المركز التشغيلية، وربطها بمصادرها الفعلية (الصيانة، الأجهزة، الغرف).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrintRegister}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/70 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة سجل المصروفات</span>
          </button>
          <PermissionGuard permission="expenses:delete">
            <button
              type="button"
              onClick={() => setShowArchived((prev) => !prev)}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                showArchived
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-muted text-foreground hover:bg-muted/70"
              }`}
            >
              {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              <span>{showArchived ? "المصروفات النشطة" : "المصروفات المؤرشفة"}</span>
            </button>
          </PermissionGuard>
          <PermissionGuard permission="expenses:create">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>مصروف جديد</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading && enrichedExpenses.length === 0 ? (
        <LoadingState message="جاري تحميل بيانات المصروفات..." rounded="rounded-3xl" />
      ) : expensesError ? (
        <ErrorState message="تعذّر تحميل بيانات المصروفات. تأكد من تشغيل JSON Server." onRetry={refetch} />
      ) : (
        <>
          <ExpensesStats expenseStats={expenseStats} />
          <ExpenseCharts charts={charts} isLoading={isLoading} />

          <div className="space-y-4">
            <ExpenseFilters filters={filters} onChange={setFilters} users={usersList} />
            {filteredExpenses.length === 0 ? (
              <EmptyState
                message={showArchived ? "لا توجد مصروفات مؤرشفة" : "لا توجد مصروفات مطابقة لبحثك أو الفلاتر المحددة"}
              />
            ) : (
              <ExpensesTable
                expenses={filteredExpenses}
                onView={(exp) => setViewingExpenseId(exp.id)}
                onEdit={setEditingExpense}
                onPrint={handlePrintExpense}
                onArchive={setArchivingExpense}
                onRestore={restoreExpense}
                isArchivedView={showArchived}
              />
            )}
          </div>
        </>
      )}

      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddExpense}
        onViewExisting={(existingExpense) => {
          setIsAddOpen(false);
          setViewingExpenseId(existingExpense.id);
        }}
        maintenanceList={maintenanceEntries}
        devicesList={devices}
        roomsList={rooms}
        expenses={rawExpenses}
      />

      <EditExpenseModal
        key={editingExpense?.id ?? "edit"}
        isOpen={Boolean(editingExpense)}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onUpdate={updateExpense}
      />

      {viewingExpense && (
        <ExpenseDetailsModal
          expense={viewingExpense}
          relatedMaintenance={relatedMaintenance}
          onClose={() => setViewingExpenseId(null)}
          onPrint={handlePrintExpense}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(archivingExpense)}
        onClose={() => setArchivingExpense(null)}
        onConfirm={handleConfirmArchive}
        title="أرشفة المصروف"
        description={`هل أنت متأكد من أرشفة هذا المصروف (${archivingExpense?.description})؟ يمكن استعادته لاحقاً من عرض المصروفات المؤرشفة.`}
      />
    </div>

    {printExpenseId && (
      <PrintableExpense
        expense={printingExpense}
        relatedMaintenance={printingRelatedMaintenance}
        centerSettings={centerSettings}
      />
    )}
    {printRegister && (
      <PrintableExpenseRegister
        expenses={printRegister}
        centerSettings={centerSettings}
        filtersSummary={filtersSummary}
      />
    )}
    </>
  );
}
