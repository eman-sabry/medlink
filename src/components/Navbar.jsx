import { Search, Bell, Sun, Moon, LogOut, User } from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
} from "./ui/Dropdown";
import { ROLE_LABELS } from "../permissions/roles";

export function Navbar({
  onOpenSearch,
  onToggleDarkMode,
  isDarkMode,
  onLogout,
  user,
}) {
  const displayName = user?.full_name ?? "مستخدم";
  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? "";
  const initial = displayName.trim().charAt(0) || "م";
  return (
    <header className="flex h-20 w-full items-center justify-between px-4 lg:px-6 bg-transparent font-['Cairo',sans-serif]">
      {/* الشعار */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md">
            ع
          </div>
          <span className="font-extrabold text-base tracking-wide">
            عيادة العلاج الطبيعي
          </span>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="flex-1 max-w-xl mx-6 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="flex h-12 w-full items-center gap-3 rounded-2xl border border-border/75 bg-card/80 px-4 text-sm text-muted-foreground hover:bg-card hover:border-primary/50 transition-all cursor-pointer shadow-xs group"
        >
          <Search className="h-4 w-4 text-primary transition-transform group-hover:scale-110" />
          <span className="flex-1 text-right truncate font-medium">
            ابحث في المرضى، الأطباء، الفواتير…
          </span>
        </button>
      </div>

      {/* الأزرار الجانبية */}
      <div className="flex items-center gap-3">
        {/* زر الثيم */}
        <button
          onClick={onToggleDarkMode}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-card text-muted-foreground hover:bg-card hover:text-foreground transition-all cursor-pointer shadow-xs"
        >
          {isDarkMode ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* زر الإشعارات */}
        <button className="relative cursor-pointer flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-card text-muted-foreground hover:bg-card shadow-xs">
          <Bell className="h-5 w-5 " />
          <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-destructive animate-pulse ring-2 ring-card bg-red-500"></span>
        </button>

        <div className="h-7 w-[1px] bg-border/80 mx-1"></div>

        {/* استخدام دروب داون المستخدم بكل سهولة */}
        <Dropdown
          align="left"
          trigger={
            <div className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-card transition-all border border-transparent hover:border-border/60">
              <div className="h-10 w-10 flex items-center justify-center overflow-hidden rounded-xl border border-primary/40 bg-primary/10 text-primary font-black shadow-sm">
                {initial}
              </div>
              <div className="hidden text-right lg:block">
                <div className="text-sm font-bold leading-tight">{displayName}</div>
                <div className="text-[11px] text-primary font-semibold mt-0.5">
                  {roleLabel}
                </div>
              </div>
            </div>
          }
        >
          <div className="lg:hidden">
            <DropdownHeader title={displayName} subtitle={roleLabel} />
          </div>
          <DropdownItem to="/profile" icon={User}>
            الملف الشخصي
          </DropdownItem>
          <DropdownDivider />
          <DropdownItem onClick={onLogout} icon={LogOut} destructive={true}>
            تسجيل الخروج
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
}
