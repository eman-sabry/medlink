import { roundMoney } from "../utils/billing";
import { buildRevenueStats } from "./invoices.helpers";
import { EXPENSE_STATUS } from "./expense.helpers";
import { isSameDay } from "../utils/dashboardStats";
import { sumBy } from "../utils/stats";

export { buildRevenueStats };

const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const ARABIC_WEEKDAYS = [
  "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت",
];

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

function toValidDate(raw) {
  if (!raw) return null;
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

export function buildRevenueVsExpensesSeries({
  payments = [],
  paymentRefunds = [],
  expenses = [],
  archivedExpenseIds = new Set(),
}) {
  const refundsByPaymentId = new Map();
  (paymentRefunds || []).forEach((r) => {
    if (r.reversed_at) return;
    refundsByPaymentId.set(r.payment_id, (refundsByPaymentId.get(r.payment_id) ?? 0) + (Number(r.amount) || 0));
  });

  // Calculate net amount for each payment
  const activePayments = (payments || [])
    .filter((p) => !p.voided_at)
    .map((p) => {
      const refunded = refundsByPaymentId.get(p.id) ?? 0;
      const netAmount = Math.max(0, (Number(p.amount) || 0) - refunded);
      return {
        ...p,
        amount: netAmount,
        paid_at: p.paid_at || p.created_at,
      };
    });

  const activePaidExpenses = (expenses || []).filter((e) => isActivePaidExpense(e, archivedExpenseIds));

  const now = new Date();
  const currentYear = now.getFullYear();

  // 1. THIS YEAR / MONTHLY (12 Months of current year or all active months)
  const monthlyBuckets = new Map();
  for (let m = 0; m < 12; m++) {
    const key = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
    monthlyBuckets.set(key, {
      label: `${ARABIC_MONTHS[m]}`,
      month: `${ARABIC_MONTHS[m]} ${currentYear}`,
      sortKey: key,
      revenue: 0,
      expenses: 0,
    });
  }

  // Populate payments into monthly buckets
  for (const p of activePayments) {
    const d = toValidDate(p.paid_at);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyBuckets.has(key)) {
      monthlyBuckets.set(key, {
        label: `${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        month: `${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        sortKey: key,
        revenue: 0,
        expenses: 0,
      });
    }
    const bucket = monthlyBuckets.get(key);
    bucket.revenue = roundMoney(bucket.revenue + (Number(p.amount) || 0));
  }

  // Populate expenses into monthly buckets
  for (const e of activePaidExpenses) {
    const d = toValidDate(e.date || e.created_at);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyBuckets.has(key)) {
      monthlyBuckets.set(key, {
        label: `${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        month: `${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        sortKey: key,
        revenue: 0,
        expenses: 0,
      });
    }
    const bucket = monthlyBuckets.get(key);
    bucket.expenses = roundMoney(bucket.expenses + (Number(e.amount) || 0));
  }

  const yearly = [...monthlyBuckets.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((item) => ({
      ...item,
      profit: roundMoney(item.revenue - item.expenses),
    }));

  // Filter yearly to only current year for clean 12-month display, and full monthly
  const thisYearSeries = yearly.filter((item) => item.sortKey.startsWith(String(currentYear)));
  const monthly = yearly.length > 0 ? yearly : thisYearSeries;

  // 2. THIS MONTH (Day by day for last 30 days)
  const dailyBuckets = new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`;
    dailyBuckets.set(key, {
      label,
      day: label,
      sortKey: key,
      revenue: 0,
      expenses: 0,
    });
  }

  for (const p of activePayments) {
    const d = toValidDate(p.paid_at);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (dailyBuckets.has(key)) {
      const b = dailyBuckets.get(key);
      b.revenue = roundMoney(b.revenue + (Number(p.amount) || 0));
    }
  }

  for (const e of activePaidExpenses) {
    const d = toValidDate(e.date || e.created_at);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (dailyBuckets.has(key)) {
      const b = dailyBuckets.get(key);
      b.expenses = roundMoney(b.expenses + (Number(e.amount) || 0));
    }
  }

  const thisMonthSeries = [...dailyBuckets.values()].map((item) => ({
    ...item,
    profit: roundMoney(item.revenue - item.expenses),
  }));

  // 3. THIS WEEK (Last 7 days)
  const weekBuckets = new Map();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const weekdayName = ARABIC_WEEKDAYS[d.getDay()];
    const label = `${weekdayName} (${d.getDate()}/${d.getMonth() + 1})`;
    weekBuckets.set(key, {
      label,
      day: label,
      sortKey: key,
      revenue: 0,
      expenses: 0,
    });
  }

  for (const p of activePayments) {
    const d = toValidDate(p.paid_at);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (weekBuckets.has(key)) {
      const b = weekBuckets.get(key);
      b.revenue = roundMoney(b.revenue + (Number(p.amount) || 0));
    }
  }

  for (const e of activePaidExpenses) {
    const d = toValidDate(e.date || e.created_at);
    if (!d) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (weekBuckets.has(key)) {
      const b = weekBuckets.get(key);
      b.expenses = roundMoney(b.expenses + (Number(e.amount) || 0));
    }
  }

  const thisWeekSeries = [...weekBuckets.values()].map((item) => ({
    ...item,
    profit: roundMoney(item.revenue - item.expenses),
  }));

  // 4. TODAY (Hourly buckets for clinic working hours 08:00 to 22:00)
  const todayBuckets = new Map();
  const clinicHours = [8, 10, 12, 14, 16, 18, 20, 22];
  clinicHours.forEach((h) => {
    const label = `${String(h).padStart(2, "0")}:00`;
    todayBuckets.set(h, {
      label,
      hour: label,
      revenue: 0,
      expenses: 0,
    });
  });

  for (const p of activePayments) {
    const d = toValidDate(p.paid_at);
    if (!d || !isSameDay(p.paid_at, now)) continue;
    const h = d.getHours();
    // find nearest 2-hour bracket
    const nearestH = clinicHours.reduce((prev, curr) => (Math.abs(curr - h) < Math.abs(prev - h) ? curr : prev), 8);
    const b = todayBuckets.get(nearestH);
    if (b) {
      b.revenue = roundMoney(b.revenue + (Number(p.amount) || 0));
    }
  }

  for (const e of activePaidExpenses) {
    const d = toValidDate(e.date || e.created_at);
    if (!d || !isSameDay(e.date || e.created_at, now)) continue;
    const h = d.getHours();
    const nearestH = clinicHours.reduce((prev, curr) => (Math.abs(curr - h) < Math.abs(prev - h) ? curr : prev), 8);
    const b = todayBuckets.get(nearestH);
    if (b) {
      b.expenses = roundMoney(b.expenses + (Number(e.amount) || 0));
    }
  }

  const todaySeries = [...todayBuckets.values()].map((item) => ({
    ...item,
    profit: roundMoney(item.revenue - item.expenses),
  }));

  return {
    monthly,
    daily: thisMonthSeries,
    year: thisYearSeries,
    month: thisMonthSeries,
    week: thisWeekSeries,
    today: todaySeries,
  };
}

