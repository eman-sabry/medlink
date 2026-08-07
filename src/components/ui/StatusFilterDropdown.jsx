import { ChevronDown } from "lucide-react";
import { Dropdown, DropdownItem } from "./Dropdown";

export function StatusFilterDropdown({
  options,
  value,
  onChange,
  triggerClassName = "w-full sm:w-56 h-12 px-4 text-xs",
}) {
  const current = options.find((o) => o.key === value) ?? options[0];
  const CurrentIcon = current.icon;

  return (
    <Dropdown
      align="right"
      trigger={
        <div
          className={`flex items-center justify-between gap-3 border rounded-2xl font-bold cursor-pointer transition-all shadow-sm ${triggerClassName} ${current.style}`}
        >
          <div className="flex items-center gap-2 truncate">
            {CurrentIcon && <CurrentIcon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{current.label}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-70 shrink-0" />
        </div>
      }
    >
      <div className="space-y-1 p-1">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownItem
              key={option.key}
              icon={Icon}
              onClick={() => onChange(option.key)}
              className={`${option.textClass ?? ""} ${
                value === option.key ? "font-bold bg-muted/50" : ""
              }`}
            >
              {option.label}
            </DropdownItem>
          );
        })}
      </div>
    </Dropdown>
  );
}
