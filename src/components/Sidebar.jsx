import { NavLink } from "react-router-dom";
import { SIDEBAR_SECTIONS } from "../constants/sidebarData";
import { useAuth } from "../hooks/useAuth";
import { canAccessRoute } from "../permissions/routePermissions";

export function Sidebar({ onClose, collapsed }) {
  const { role } = useAuth();

  // كل قسم يعرض فقط الروابط المسموح بها لدور المستخدم الحالي، وتُحذف الأقسام الفارغة تماماً
  const visibleSections = SIDEBAR_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccessRoute(role, item.to)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="sticky top-0 h-screen flex flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border-l border-white/10 shadow-2xl select-none font-['Cairo',sans-serif] shrink-0">
      {/* رأس الشريط الجانبي (الشعار والعنوان) */}
      <div className="px-5 border-b border-white/10 flex items-center justify-center shrink-0 h-20 bg-black/20 backdrop-blur-md">
        {!collapsed ? (
          <div className="overflow-hidden whitespace-nowrap py-2 flex items-center gap-3 w-full">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-primary-foreground shadow-lg shadow-primary/20">
              <img
                src="/logo.svg"
                alt="Clinic Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wide text-white">
                  MedLink{" "}
                  <span
                    style={{ color: "oklch(0.62 0.12 195)" }}
                    className="font-light"
                  >
                    OS
                  </span>
                </span>
              </div>
              <div className="text-[11px] text-white/60 font-medium mt-0.5">
                فيزيوتيرابي · مركز العلاج
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-primary-foreground shadow-lg shadow-primary/20">
            <img
              src="/logo.svg"
              alt="Clinic Logo"
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>

      {/* الروابط وأقسام القائمة مع سكرول داخلي خاص بها إن لزم */}
      <div className="flex-1 overflow-y-auto px-3.5 py-6 space-y-6 text-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {visibleSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {!collapsed && section.title && (
              <div className="px-3 mb-2.5 text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                {section.title}
              </div>
            )}
            <div className="space-y-1.5">
              {section.items.map((item, itemIdx) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-3 transition-all duration-200 relative group outline-none ${
                        isActive
                          ? "text-white font-bold shadow-md"
                          : "text-white/75 hover:bg-white/10 hover:text-white focus-visible:bg-white/15 focus-visible:text-white"
                      } ${
                        collapsed
                          ? "justify-center px-0 mx-auto w-12 h-12 rounded-full"
                          : "rounded-2xl"
                      }`
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { backgroundColor: "oklch(0.62 0.12 195)" }
                        : {}
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <IconComponent
                          className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive
                              ? "text-white"
                              : "text-white/60 group-hover:text-white"
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate tracking-wide">
                            {item.label}
                          </span>
                        )}

                        {collapsed && (
                          <span
                            className="fixed right-20 px-3.5 py-2 bg-neutral-900 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-[999999] shadow-2xl border"
                            style={{
                              borderColor: "oklch(0.62 0.12 195)",
                            }}
                          >
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
