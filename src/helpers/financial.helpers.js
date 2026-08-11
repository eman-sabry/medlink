import { roundMoney } from "../utils/billing";
import { buildRevenueStats } from "./invoices.helpers";
import { EXPENSE_STATUS } from "./expense.helpers";
import { groupSumByMonth, groupSumByDay, mergeMonthlySeries, mergeDailySeries } from "../utils/dashboardStats";
import { sumBy } from "../utils/stats";

export { buildRevenueStats };

function isActivePaidExpense(expense, archivedExpenseIds) {
  return !archivedExpenseIds.has(expense.id) && (expense.status ?? EXPENSE_STATUS.PAID) === EXPENSE_STATUS.PAID;
}

export function computeTotalPaidExpenses(expenses = [], archivedExpenseIds = new Set()) {
  return roundMoney(
    sumBy(
      expenses.filter((e) => isActivePaidExpense(e, archivedExpenseIds)),
      (e) => e.amount,
    ),
  );
}

export function computeExpensesInRange(expenses = [], archivedExpenseIds = new Set(), predicate) {
  return roundMoney(
    sumBy(
      expenses.filter((e) => isActivePaidExpense(e, archivedExpenseIds) && predicate(e)),
      (e) => e.amount,
    ),
  );
}

export function computeNetProfit(revenue, expenses) {
  return roundMoney((Number(revenue) || 0) - (Number(expenses) || 0));
}

export function buildRevenueVsExpensesSeries({ payments = [], expenses = [], archivedExpenseIds = new Set() }) {
  const activePayments = payments.filter((p) => !p.voided_at);
  const activePaidExpenses = expenses.filter((e) => isActivePaidExpense(e, archivedExpenseIds));

  const revenueMonthly = groupSumByMonth(activePayments, "paid_at", "amount");
  const expensesMonthly = groupSumByMonth(activePaidExpenses, "date", "amount");
  const monthly = mergeMonthlySeries(revenueMonthly, "revenue", expensesMonthly, "expenses");

  const revenueDaily = groupSumByDay(activePayments, "paid_at", "amount", 30);
  const expensesDaily = groupSumByDay(activePaidExpenses, "date", "amount", 30);
  const daily = mergeDailySeries(revenueDaily, "revenue", expensesDaily, "expenses");

  return { monthly, daily };
}
