import { StatsGrid } from "../ui/StatCard";
import { buildExpenseStatItems } from "../../helpers/expense.helpers";

export function ExpensesStats({ expenseStats }) {
  const items = buildExpenseStatItems(expenseStats);
  return <StatsGrid items={items} className="grid-cols-2 sm:grid-cols-4" />;
}
