import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { FloatingQuickActions } from "../components/dashboard/FloatingQuickActions";
import { LiveOperationsWindow } from "../components/live-operations/LiveOperationsWindow";
import { Menu, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "../utils/toast";
import { getFloatingActionsByRole } from "../helpers/floatingActions.helpers";
export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const scrollContainerRef = useRef(null);
const userRole = user?.role ? user.role.toLowerCase() : "user";
const floatingActions = getFloatingActionsByRole(userRole);

  // The content area (not window) is the actual scroll container, so reset it here once for
  // every route instead of adding scroll-to-top logic to each page.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login", { replace: true });
  };


  return (
    <div
      className={
        isDarkMode
          ? "dark h-screen w-full bg-background text-foreground transition-colors flex overflow-hidden font-['Cairo',sans-serif] antialiased print:h-auto print:overflow-visible print:block"
          : "h-screen w-full bg-background text-foreground transition-colors flex overflow-hidden font-['Cairo',sans-serif] antialiased print:h-auto print:overflow-visible print:block"
      }
    >
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out z-30 border-l border-border/40 shadow-2xl print:hidden ${
          isSidebarCollapsed ? "w-20" : "w-68"
        }`}
      >
        <Sidebar collapsed={isSidebarCollapsed} />
      </aside>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 h-full shadow-2xl flex flex-col bg-[var(--sidebar)] border-l border-border/40">
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors z-20 cursor-pointer shadow-md"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar
              collapsed={false}
              onClose={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-background print:h-auto print:overflow-visible print:block relative"
      >
        <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-xs shrink-0 print:hidden">
          <div className="flex items-center justify-between px-4 lg:px-6 h-20">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-2xl bg-surface-muted hover:bg-muted transition-all text-foreground cursor-pointer shadow-xs border border-border/60 ml-2"
                aria-label="فتح القائمة"
              >
                <Menu className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex items-center justify-center text-muted-foreground hover:text-primary transition-colors cursor-pointer p-2 rounded-xl"
                title={
                  isSidebarCollapsed
                    ? "توسيع القائمة الجانبية"
                    : "تصغير القائمة الجانبية"
                }
              >
                {isSidebarCollapsed ? (
                  <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
                ) : (
                  <ChevronRight className="h-6 w-6 stroke-[2.5]" />
                )}
              </button>

              <div className="flex items-center gap-2 lg:hidden">
                <span className="font-extrabold text-base tracking-wide">
                  MedLink OS
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-full">
              <Navbar
                onToggleDarkMode={toggleDarkMode}
                isDarkMode={isDarkMode}
                onLogout={handleLogout}
                user={user}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={() =>
                  setIsSidebarCollapsed(!isSidebarCollapsed)
                }
                hideSidebarToggle={true}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto print:p-0 print:max-w-none">
          {children}
        </main>

        <FloatingQuickActions actions={floatingActions} />
        <LiveOperationsWindow />
      </div>
    </div>
  );
}
