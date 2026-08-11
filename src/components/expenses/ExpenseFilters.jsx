import { UserCog } from "lucide-react";
import { SearchBar } from "../ui/SearchBar";
import { StatusFilterDropdown } from "../ui/StatusFilterDropdown";
import {
  EXPENSE_STATUS_FILTER_OPTIONS,
  DATE_RANGE_FILTER_OPTIONS,
  buildCategoryFilterOptions,
  buildSourceTypeFilterOptions,
  buildMethodFilterOptions,
} from "../../helpers/expense.helpers";

function buildCreatedByOptions(users) {
  return [
    { key: "all", label: "كل المستخدمين", icon: UserCog, style: "bg-card text-foreground border-border hover:bg-muted/30" },
    ...users.map((u) => ({
      key: u.id,
      label: u.full_name,
      icon: UserCog,
      style: "bg-blue-500/10 text-blue-600 border-blue-500/30",
      textClass: "text-blue-600",
    })),
  ];
}

export function ExpenseFilters({ filters, onChange, users = [] }) {
  const categoryOptions = buildCategoryFilterOptions();
  const sourceTypeOptions = buildSourceTypeFilterOptions();
  const methodOptions = buildMethodFilterOptions();
  const createdByOptions = buildCreatedByOptions(users);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <SearchBar
          value={filters.search}
          onChange={(value) => onChange({ ...filters, search: value })}
          placeholder="ابحث برقم المصروف، الوصف، التصنيف، المصدر، أو من أنشأه..."
          className="max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <StatusFilterDropdown
            options={EXPENSE_STATUS_FILTER_OPTIONS}
            value={filters.status}
            onChange={(status) => onChange({ ...filters, status })}
            triggerClassName="w-full sm:w-40 h-12 px-4 text-xs"
          />
          <StatusFilterDropdown
            options={categoryOptions}
            value={filters.category}
            onChange={(category) => onChange({ ...filters, category })}
            triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
          />
          <StatusFilterDropdown
            options={sourceTypeOptions}
            value={filters.sourceType}
            onChange={(sourceType) => onChange({ ...filters, sourceType })}
            triggerClassName="w-full sm:w-40 h-12 px-4 text-xs"
          />
          <StatusFilterDropdown
            options={DATE_RANGE_FILTER_OPTIONS}
            value={filters.dateRange}
            onChange={(dateRange) => onChange({ ...filters, dateRange })}
            triggerClassName="w-full sm:w-40 h-12 px-4 text-xs"
          />
          <StatusFilterDropdown
            options={methodOptions}
            value={filters.paymentMethod}
            onChange={(paymentMethod) => onChange({ ...filters, paymentMethod })}
            triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
          />
          {users.length > 0 && (
            <StatusFilterDropdown
              options={createdByOptions}
              value={filters.createdBy}
              onChange={(createdBy) => onChange({ ...filters, createdBy })}
              triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          value={filters.minAmount}
          onChange={(e) => onChange({ ...filters, minAmount: e.target.value })}
          placeholder="أقل مبلغ"
          className="w-32 h-11 rounded-2xl border border-border bg-background px-3 text-xs"
        />
        <span className="text-muted-foreground text-xs">—</span>
        <input
          type="number"
          min="0"
          value={filters.maxAmount}
          onChange={(e) => onChange({ ...filters, maxAmount: e.target.value })}
          placeholder="أعلى مبلغ"
          className="w-32 h-11 rounded-2xl border border-border bg-background px-3 text-xs"
        />
      </div>
    </div>
  );
}
