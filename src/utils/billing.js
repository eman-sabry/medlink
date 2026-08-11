
export const PAYMENT_STATUS = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
};

export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function calculateLineTotal({ quantity = 1, unit_price = 0, discount_amount = 0 }) {
  return roundMoney(quantity * unit_price - discount_amount);
}

export function calculateInvoiceTotals(items = [], invoiceDiscount = 0) {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + (item.quantity ?? 1) * (item.unit_price ?? 0), 0),
  );
  const itemsDiscount = roundMoney(
    items.reduce((sum, item) => sum + (item.discount_amount ?? 0), 0),
  );
  const discount = roundMoney(itemsDiscount + (invoiceDiscount ?? 0));
  const total = roundMoney(Math.max(0, subtotal - discount));
  return { subtotal, discount, total };
}

export function computeNetPaid(payments = [], paymentRefunds = []) {
  const refundsByPaymentId = new Map();
  paymentRefunds.forEach((r) => {
    if (r.reversed_at) return;
    refundsByPaymentId.set(r.payment_id, (refundsByPaymentId.get(r.payment_id) ?? 0) + r.amount);
  });

  return roundMoney(
    payments.reduce((sum, p) => {
      if (p.voided_at) return sum;
      const refunded = refundsByPaymentId.get(p.id) ?? 0;
      return sum + Math.max(0, p.amount - refunded);
    }, 0),
  );
}

export function computeRemainingBalance(total, netPaid) {
  return roundMoney(Math.max(0, total - netPaid));
}

export function computePaymentStatus({ total, netPaid }) {
  if (total <= 0) return PAYMENT_STATUS.UNPAID;
  if (netPaid <= 0) return PAYMENT_STATUS.UNPAID;
  if (netPaid >= total) return PAYMENT_STATUS.PAID;
  return PAYMENT_STATUS.PARTIAL;
}

const EMPTY_ARRAY = [];

export function computeInvoiceStatuses(invoices = [], payments = [], paymentRefunds = []) {
  const paymentsByInvoiceId = new Map();
  payments.forEach((p) => {
    if (!paymentsByInvoiceId.has(p.invoice_id)) paymentsByInvoiceId.set(p.invoice_id, []);
    paymentsByInvoiceId.get(p.invoice_id).push(p);
  });

  return new Map(
    invoices.map((inv) => {
      const netPaid = computeNetPaid(paymentsByInvoiceId.get(inv.id) ?? EMPTY_ARRAY, paymentRefunds);
      return [inv.id, computePaymentStatus({ total: inv.total_amount ?? 0, netPaid })];
    }),
  );
}

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PAID]: "مدفوعة",
  [PAYMENT_STATUS.PARTIAL]: "مدفوعة جزئياً",
  [PAYMENT_STATUS.UNPAID]: "غير مدفوعة",
};

export function generateInvoiceNumber(existingInvoices = [], date = new Date()) {
  const year = date.getFullYear();
  const prefix = `INV-${year}-`;
  const maxSeq = existingInvoices.reduce((max, inv) => {
    if (!inv.invoice_no?.startsWith(prefix)) return max;
    const seq = parseInt(inv.invoice_no.slice(prefix.length), 10);
    return isNaN(seq) ? max : Math.max(max, seq);
  }, 100);
  return `${prefix}${maxSeq + 1}`;
}

export const PAYMENT_METHOD_LABELS = {
  Cash: "نقدي",
  Card: "فيزا / بطاقة",
  BankTransfer: "تحويل بنكي",
  Instapay: "إنستاباي",
  Wallet: "محفظة إلكترونية",
  Other: "أخرى",
};
