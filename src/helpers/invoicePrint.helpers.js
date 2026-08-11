const PRINT_RENDER_DELAY_MS = 200;

export function printInvoice(setPrintInvoiceId, invoiceId) {
  setPrintInvoiceId(invoiceId);
  window.setTimeout(() => {
    window.print();
    window.addEventListener("afterprint", () => setPrintInvoiceId(null), { once: true });
  }, PRINT_RENDER_DELAY_MS);
}

export function printInvoiceReport(setPrintRegister, filteredInvoices) {
  setPrintRegister(filteredInvoices);
  window.setTimeout(() => {
    window.print();
    window.addEventListener("afterprint", () => setPrintRegister(null), { once: true });
  }, PRINT_RENDER_DELAY_MS);
}
