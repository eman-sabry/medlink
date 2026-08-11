const PRINT_RENDER_DELAY_MS = 200;

export function printExpense(setPrintExpenseId, expenseId) {
  setPrintExpenseId(expenseId);
  window.setTimeout(() => {
    window.print();
    window.addEventListener("afterprint", () => setPrintExpenseId(null), { once: true });
  }, PRINT_RENDER_DELAY_MS);
}

export function printExpenseReport(setPrintRegister, filteredExpenses) {
  setPrintRegister(filteredExpenses);
  window.setTimeout(() => {
    window.print();
    window.addEventListener("afterprint", () => setPrintRegister(null), { once: true });
  }, PRINT_RENDER_DELAY_MS);
}
