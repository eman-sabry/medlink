import { useMemo, useState } from "react";
import { Users, Plus, LayoutGrid, Table as TableIcon, Mail, Phone, CalendarDays } from "lucide-react";
import { useTeam } from "../hooks/useTeam";
import { useAuth } from "../hooks/useAuth";
import { hasPermission } from "../permissions/permissions";
import { TeamMemberModal } from "../components/team/TeamMemberModal";
import { TeamMemberCard } from "../components/team/TeamMemberCard";
import { TeamMemberAvatar } from "../components/team/TeamMemberAvatar";
import { TeamMemberActionsMenu } from "../components/team/TeamMemberActionsMenu";
import { ReusableTable } from "../components/ui/ReusableTable";
import { SearchBar } from "../components/ui/SearchBar";
import { StatusFilterDropdown } from "../components/ui/StatusFilterDropdown";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { LoadingState } from "../components/ui/LoadingState";
import { ErrorState } from "../components/ui/ErrorState";
import { EmptyState } from "../components/ui/EmptyState";
import { STAFF_TYPE_LABELS, ACCOUNT_STATUS_META } from "../helpers/team.helpers";
import { TEAM_ACCOUNT_STATUS_FILTER_OPTIONS, TEAM_ROLE_FILTER_OPTIONS } from "../helpers/statusFilters";
import { ROLE_LABELS } from "../permissions/roles";
import { formatDate } from "../utils/date";

export default function TeamPage() {
  const { user, role } = useAuth();
  const canManage = hasPermission(user || role, "team:manage");

  const {
    teamMembers,
    isLoading,
    isError,
    refetch,
    addTeamMember,
    isAdding,
    updateTeamMember,
    isUpdating,
    createAccount,
    isCreatingAccount,
    toggleAccountStatus,
    isTogglingStatus,
  } = useTeam();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState(null);
  const [openAccountSection, setOpenAccountSection] = useState(false);
  const [memberToToggle, setMemberToToggle] = useState(null); // { accountId, staffId, fullName, nextStatus }

  const filteredMembers = useMemo(
    () =>
      teamMembers.filter((m) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          m.full_name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.specialty?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || m.accountStatus === statusFilter;
        const matchesRole = roleFilter === "all" || m.role === roleFilter;
        return matchesSearch && matchesStatus && matchesRole;
      }),
    [teamMembers, searchQuery, statusFilter, roleFilter],
  );

  const handleAddSubmit = async (formData) => {
    await addTeamMember({
      fullName: formData.fullName,
      staffType: formData.staffType,
      specialty: formData.specialty,
      gender: formData.gender,
      role: formData.role,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      username: formData.username,
      password: formData.password,
    });
  };

  const handleEditSubmit = async (formData) => {
    const staffFields = {
      staffId: memberToEdit.id,
      fullName: formData.fullName,
      staffType: formData.staffType,
      specialty: formData.specialty,
      gender: formData.gender,
      supervisorStaffId: memberToEdit.supervisor_staff_id,
    };

    if (memberToEdit.hasAccount) {
      await updateTeamMember({
        ...staffFields,
        accountId: memberToEdit.account.id,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
      });
    } else if (formData.includeAccount) {
      await updateTeamMember({ ...staffFields, accountId: null, role: null, email: null, phone: null, avatar: null });
      await createAccount({
        staffId: memberToEdit.id,
        fullName: formData.fullName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar,
        username: formData.username,
        password: formData.password,
      });
    } else {
      await updateTeamMember({ ...staffFields, accountId: null, role: null, email: null, phone: null, avatar: null });
    }
  };

  const handleToggleConfirm = async () => {
    if (!memberToToggle) return;
    await toggleAccountStatus(memberToToggle);
    setMemberToToggle(null);
  };

  const handleEditClick = (m) => {
    setOpenAccountSection(false);
    setMemberToEdit(m);
  };
  const handleCreateAccountClick = (m) => {
    setOpenAccountSection(true);
    setMemberToEdit(m);
  };
  const handleToggleStatusClick = (m, nextStatus) => {
    setMemberToToggle({ accountId: m.account.id, staffId: m.id, fullName: m.full_name, nextStatus });
  };

  const columns = [
    {
      header: "العضو",
      className: "text-right",
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <TeamMemberAvatar name={m.full_name} url={m.avatar} />
          <div className="min-w-0">
            <p className="font-bold text-foreground truncate">{m.full_name}</p>
            <p className="text-muted-foreground text-[11px] truncate">
              {STAFF_TYPE_LABELS[m.staff_type] ?? m.staff_type}
              {m.specialty ? ` — ${m.specialty}` : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "دور النظام",
      render: (m) => (m.role ? ROLE_LABELS[m.role] ?? m.role : <span className="text-muted-foreground">—</span>),
    },
    {
      header: "التواصل",
      className: "hidden md:table-cell",
      render: (m) => (
        <div className="space-y-1 text-[11px] text-muted-foreground">
          {m.email && (
            <p className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> {m.email}
            </p>
          )}
          {m.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> {m.phone}
            </p>
          )}
          {!m.email && !m.phone && "—"}
        </div>
      ),
    },
    {
      header: "تاريخ الانضمام",
      className: "hidden lg:table-cell text-muted-foreground",
      render: (m) => (
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" /> {m.created_at ? formatDate(m.created_at) : "—"}
        </span>
      ),
    },
    {
      header: "حالة الحساب",
      render: (m) => {
        const meta = ACCOUNT_STATUS_META[m.accountStatus] ?? ACCOUNT_STATUS_META.NoAccount;
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${meta.badge}`}>{meta.label}</span>
        );
      },
    },
    ...(canManage
      ? [
          {
            header: "",
            className: "w-10",
            render: (m) => (
              <TeamMemberActionsMenu
                member={m}
                onEdit={handleEditClick}
                onCreateAccount={handleCreateAccountClick}
                onToggleStatus={handleToggleStatusClick}
              />
            ),
          },
        ]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <LoadingState message="جاري تحميل فريق المركز..." rounded="rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <ErrorState message="تعذّر تحميل بيانات الفريق. تأكد من تشغيل JSON Server." onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">فريق المركز</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {teamMembers.length} عضو — إدارة الفريق وحسابات الدخول والصلاحيات
            </p>
          </div>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة عضو فريق</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="بحث بالاسم أو البريد الإلكتروني أو التخصص..."
            variant="boxed"
            className="flex-1 max-w-md"
          />
          <StatusFilterDropdown
            options={TEAM_ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={setRoleFilter}
            triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
          />
          <StatusFilterDropdown
            options={TEAM_ACCOUNT_STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            triggerClassName="w-full sm:w-44 h-12 px-4 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 bg-muted p-1 rounded-2xl border border-border self-start">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            title="عرض جدول"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "table" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <TableIcon className="h-4 w-4" />
            <span>جدول</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            title="عرض كروت"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>كروت</span>
          </button>
        </div>
      </div>

      {viewMode === "table" ? (
        <ReusableTable
          columns={columns}
          data={filteredMembers}
          rowsPerPage={10}
          emptyMessage="لا يوجد أعضاء فريق مطابقون للبحث/الفلاتر المحددة."
        />
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((m) => (
            <TeamMemberCard
              key={m.id}
              member={m}
              canManage={canManage}
              onEdit={handleEditClick}
              onCreateAccount={handleCreateAccountClick}
              onToggleStatus={handleToggleStatusClick}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="لا يوجد أعضاء فريق مطابقون للبحث/الفلاتر المحددة." colSpanFull />
      )}

      {canManage && (
        <>
          <TeamMemberModal
            key={isAddOpen ? "add-open" : "add-closed"}
            isOpen={isAddOpen}
            mode="add"
            isSubmitting={isAdding}
            onClose={() => setIsAddOpen(false)}
            onSubmit={handleAddSubmit}
          />

          <TeamMemberModal
            key={memberToEdit?.id ?? "edit-closed"}
            isOpen={Boolean(memberToEdit)}
            mode="edit"
            member={memberToEdit}
            defaultWantsAccount={openAccountSection}
            isSubmitting={isUpdating || isCreatingAccount}
            onClose={() => setMemberToEdit(null)}
            onSubmit={handleEditSubmit}
          />

          <ConfirmModal
            isOpen={Boolean(memberToToggle)}
            onClose={() => setMemberToToggle(null)}
            onConfirm={handleToggleConfirm}
            title={memberToToggle?.nextStatus === "Active" ? "تفعيل الحساب" : "تعطيل الحساب"}
            description={
              memberToToggle?.nextStatus === "Active"
                ? `هل تريد تفعيل حساب ${memberToToggle?.fullName}؟ سيتمكن من تسجيل الدخول مجدداً.`
                : `هل تريد تعطيل حساب ${memberToToggle?.fullName}؟ لن يتمكن من تسجيل الدخول حتى يُعاد تفعيله. تبقى بياناته وسجله محفوظَين بالكامل.`
            }
            confirmText={memberToToggle?.nextStatus === "Active" ? "نعم، فعّل الحساب" : "نعم، عطّل الحساب"}
            cancelText="إلغاء"
            variant={memberToToggle?.nextStatus === "Active" ? "primary" : "destructive"}
            isLoading={isTogglingStatus}
          />
        </>
      )}
    </div>
  );
}
