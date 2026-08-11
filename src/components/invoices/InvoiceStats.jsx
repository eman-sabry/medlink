import { StatsGrid } from "../ui/StatCard";
import { buildInvoiceStatItems } from "../../helpers/invoices.helpers";

export function InvoiceStats({ invoiceStats, revenueStats }) {
  const items = buildInvoiceStatItems(invoiceStats, revenueStats);
  return <StatsGrid items={items} className="grid-cols-2 sm:grid-cols-4" />;
}
