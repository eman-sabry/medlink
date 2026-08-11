import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Plus, Printer, Receipt, Archive, ArchiveRestore } from "lucide-react";
import { apiRequest } from "../api/client";
import { useInvoices } from "../hooks/useInvoices";
import { usePayments } from "../hooks/usePayments";
import { usePatients } from "../hooks/usePatients";
import { useAppointments } from "../hooks/useAppointments";
import { useAuth } from "../hooks/useAuth";
import { PermissionGuard } from "../guards/PermissionGuard";
import { InvoiceStats } from "../components/invoices/InvoiceStats";
import { InvoiceCharts } from "../components/invoices/InvoiceCharts";
import { InvoiceFilters } from "../components/invoices/InvoiceFilters";
import { InvoiceTable } from "../components/invoices/InvoiceTable";
import { AddInvoiceModal } from "../components/invoices/AddInvoiceModal";
import { EditInvoiceModal } from "../components/invoices/EditInvoiceModal";
import { InvoiceDetailsModal } from "../components/invoices/InvoiceDetailsModal";
import { RecordPaymentModal } from "../components/invoices/RecordPaymentModal";
import { PrintableInvoice } from "../components/invoices/PrintableInvoice";
import { PrintableInvoiceRegister } from "../components/invoices/PrintableInvoiceRegister";
import { useInvoice } from "../hooks/useInvoice";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { DUPLICATE_INVOICE_ERROR } from "../hooks/useInvoices";
import {
  enrichInvoiceList,
  filterInvoices,
  buildInvoiceStats,
  buildRevenueStats,
  buildInvoiceCharts,
  INVOICE_STATUS_FILTER_OPTIONS,
  DATE_RANGE_FILTER_OPTIONS,
} from "../helpers/invoices.helpers";
import { printInvoice, printInvoiceReport } from "../helpers/invoicePrint.helpers";

function useResource(key, endpoint) {
  return useQuery({
    queryKey: [key],
    queryFn: () => apiRequest(endpoint),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

const DEFAULT_FILTERS = { search: "", status: "all", dateRange: "all", method: "all", doctorId: "all" };
const EMPTY_ARRAY = [];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [archivingInvoice, setArchivingInvoice] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [printInvoiceId, setPrintInvoiceId] = useState(null);
  const [printRegister, setPrintRegister] = useState(null);

  const viewingInvoiceId = searchParams.get("invoiceId");

  const {
    invoices: rawInvoices,
    isLoading: invoicesLoading,
    isError: invoicesError,
    refetch,
    addInvoice,
    updateInvoice,
    archivedInvoiceIds,
    archiveInvoice,
    restoreInvoice,
  } = useInvoices();
  const { payments, addPayment } = usePayments();
  const { patients } = usePatients();
  const { appointments, doctors } = useAppointments();

  const invoiceItemsQuery = useResource("invoice_items", "/invoice_items");
  const paymentRefundsQuery = useResource("payment_refunds", "/payment_refunds");
  const servicesQuery = useResource("services", "/services");
  const staffQuery = useResource("staff", "/staff");
  const centerSettingsQuery = useResource("center_settings", "/center_settings");

  const invoiceItems = invoiceItemsQuery.data ?? EMPTY_ARRAY;
  const paymentRefunds = paymentRefundsQuery.data ?? EMPTY_ARRAY;
  const services = servicesQuery.data ?? EMPTY_ARRAY;
  const staffList = staffQuery.data ?? EMPTY_ARRAY;
  const centerSettings = centerSettingsQuery.data?.[0] ?? null;

  const isLoading =
    invoicesLoading || invoiceItemsQuery.isLoading || paymentRefundsQuery.isLoading || servicesQuery.isLoading || staffQuery.isLoading;

  const enrichedInvoices = useMemo(
    () =>
      enrichInvoiceList({
        invoices: rawInvoices,
        patients,
        appointments,
        staffList,
        invoiceItems,
        payments,
        paymentRefunds,
      }),
    [rawInvoices, patients, appointments, staffList, invoiceItems, payments, paymentRefunds],
  );

  const activeInvoices = useMemo(
    () => enrichedInvoices.filter((inv) => !archivedInvoiceIds.has(inv.id)),
    [enrichedInvoices, archivedInvoiceIds],
  );
  const visibleInvoices = useMemo(
    () =>
      showArchived
        ? enrichedInvoices.filter((inv) => archivedInvoiceIds.has(inv.id))
        : activeInvoices,
    [enrichedInvoices, archivedInvoiceIds, showArchived, activeInvoices],
  );

  const filteredInvoices = useMemo(() => filterInvoices(visibleInvoices, filters), [visibleInvoices, filters]);

  const invoiceStats = useMemo(() => buildInvoiceStats(activeInvoices), [activeInvoices]);
  const revenueStats = useMemo(() => buildRevenueStats(payments, paymentRefunds), [payments, paymentRefunds]);
  const charts = useMemo(
    () => buildInvoiceCharts({ enrichedInvoices: activeInvoices, invoiceItems, payments, servicesList: services, staffList }),
    [activeInvoices, invoiceItems, payments, services, staffList],
  );

  const filtersSummary = useMemo(() => {
    const parts = [];
    if (filters.status !== "all") parts.push(INVOICE_STATUS_FILTER_OPTIONS.find((o) => o.key === filters.status)?.label);
    if (filters.dateRange !== "all") parts.push(DATE_RANGE_FILTER_OPTIONS.find((o) => o.key === filters.dateRange)?.label);
    if (filters.search) parts.push(`بحث: "${filters.search}"`);
    return parts.filter(Boolean).join(" · ") || null;
  }, [filters]);

  const printingInvoiceHook = useInvoice(printInvoiceId);

  const handleAddInvoice = async ({ invoice, items, payment }) => {
    let created;
    try {
      created = await addInvoice({ invoice, items });
    } catch (error) {
      if (error?.code === DUPLICATE_INVOICE_ERROR && error.existingInvoice) {
        setSearchParams({ invoiceId: error.existingInvoice.id });
      }
      throw error;
    }
    if (payment) {
      await addPayment({
        invoice_id: created.id,
        patientId: invoice.patient_id,
        amount: payment.amount,
        remainingBalance: invoice.total_amount,
        method: payment.method,
        paid_at: new Date().toISOString(),
        received_by_user_id: user?.id ?? null,
      });
    }
  };

  const handlePrintInvoice = (invoice) => {
    setPrintRegister(null);
    printInvoice(setPrintInvoiceId, invoice.id);
  };
  const handlePrintRegister = () => {
    setPrintInvoiceId(null);
    printInvoiceReport(setPrintRegister, filteredInvoices);
  };

  const handleConfirmArchive = async () => {
    if (!archivingInvoice) return;
    await archiveInvoice(archivingInvoice);
    setArchivingInvoice(null);
  };

  return (
    <>
    <div className="p-6 max-w-7xl mx-auto space-y-6 print:hidden" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mt-2 flex items-center gap-2">
            <Receipt className="h-7 w-7 text-primary" />
            الفواتير والمدفوعات
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة فواتير المركز، تسجيل المدفوعات، ومتابعة الوضع المالي.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PermissionGuard permission="billing:delete">
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
              <span>{showArchived ? "الفواتير النشطة" : "الفواتير المؤرشفة"}</span>
            </button>
          </PermissionGuard>
          <button
            type="button"
            onClick={handlePrintRegister}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-muted text-foreground font-bold text-sm hover:bg-muted/70 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>طباعة سجل الفواتير</span>
          </button>
          <PermissionGuard permission="billing:create">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>فاتورة جديدة</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading && enrichedInvoices.length === 0 ? (
        <LoadingState message="جاري تحميل بيانات الفواتير..." rounded="rounded-3xl" />
      ) : invoicesError ? (
        <ErrorState message="تعذّر تحميل بيانات الفواتير. تأكد من تشغيل JSON Server." onRetry={refetch} />
      ) : (
        <>
          <InvoiceStats invoiceStats={invoiceStats} revenueStats={revenueStats} />
          <InvoiceCharts charts={charts} isLoading={isLoading} />

          <div className="space-y-4">
            <InvoiceFilters filters={filters} onChange={setFilters} doctors={doctors} />
            {filteredInvoices.length === 0 ? (
              <EmptyState
                message={
                  showArchived
                    ? "لا توجد فواتير مؤرشفة"
                    : "لا توجد فواتير مطابقة لبحثك أو الفلاتر المحددة"
                }
              />
            ) : (
              <InvoiceTable
                invoices={filteredInvoices}
                onView={(inv) => setSearchParams({ invoiceId: inv.id })}
                onEdit={setEditingInvoice}
                onRecordPayment={setPayingInvoice}
                onPrint={handlePrintInvoice}
                onArchive={setArchivingInvoice}
                onRestore={restoreInvoice}
                isArchivedView={showArchived}
              />
            )}
          </div>
        </>
      )}

      <AddInvoiceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAddInvoice}
        onViewExisting={(existingInvoice) => {
          setIsAddOpen(false);
          setSearchParams({ invoiceId: existingInvoice.id });
        }}
        patients={patients}
        doctors={doctors}
        appointments={appointments}
        services={services}
        invoices={rawInvoices}
      />

      <EditInvoiceModal
        key={editingInvoice?.id ?? "edit"}
        isOpen={Boolean(editingInvoice)}
        invoice={editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onUpdate={async (id, data) => updateInvoice({ id, data })}
        doctors={doctors}
      />

      <RecordPaymentModal
        key={payingInvoice?.id ?? "pay"}
        isOpen={Boolean(payingInvoice)}
        invoice={payingInvoice}
        onClose={() => setPayingInvoice(null)}
        onRecordPayment={(data) =>
          addPayment({ ...data, patientId: payingInvoice?.patient_id, received_by_user_id: user?.id ?? null })
        }
      />

      {viewingInvoiceId && (
        <InvoiceDetailsModal
          invoiceId={viewingInvoiceId}
          onClose={() => setSearchParams({})}
          onPrint={handlePrintInvoice}
          onRecordPayment={setPayingInvoice}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(archivingInvoice)}
        onClose={() => setArchivingInvoice(null)}
        onConfirm={handleConfirmArchive}
        title="أرشفة الفاتورة"
        description={`هل أنت متأكد من أرشفة الفاتورة ${archivingInvoice?.invoice_no}؟ يمكن استعادتها لاحقاً من عرض الفواتير المؤرشفة.`}
      />
    </div>

    {printInvoiceId && (
      <PrintableInvoice invoice={printingInvoiceHook.invoice} centerSettings={centerSettings} />
    )}
    {printRegister && (
      <PrintableInvoiceRegister invoices={printRegister} centerSettings={centerSettings} filtersSummary={filtersSummary} />
    )}
    </>
  );
}
