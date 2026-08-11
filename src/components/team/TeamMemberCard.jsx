import { memo } from "react";
import { Mail, Phone, CalendarDays, Briefcase } from "lucide-react";
import { TeamMemberAvatar } from "./TeamMemberAvatar";
import { TeamMemberActionsMenu } from "./TeamMemberActionsMenu";
import { STAFF_TYPE_LABELS, ACCOUNT_STATUS_META } from "../../helpers/team.helpers";
import { ROLE_LABELS } from "../../permissions/roles";
import { formatDate } from "../../utils/date";

function TeamMemberCardImpl({ member, canManage, onEdit, onCreateAccount, onToggleStatus }) {
  const statusMeta = ACCOUNT_STATUS_META[member.accountStatus] ?? ACCOUNT_STATUS_META.NoAccount;

  return (
    <div className="group rounded-3xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <TeamMemberAvatar name={member.full_name} url={member.avatar} size="lg" />
          <div className="min-w-0">
            <h3 className="font-extrabold text-foreground text-base truncate group-hover:text-primary transition-colors">
              {member.full_name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {STAFF_TYPE_LABELS[member.staff_type] ?? member.staff_type}
              {member.specialty ? ` — ${member.specialty}` : ""}
            </p>
          </div>
        </div>
        {canManage && (
          <TeamMemberActionsMenu
            member={member}
            onEdit={onEdit}
            onCreateAccount={onCreateAccount}
            onToggleStatus={onToggleStatus}
          />
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {member.role ? ROLE_LABELS[member.role] ?? member.role : "بلا دور نظام"}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusMeta.badge}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 pt-3 border-t border-border text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-medium min-w-0">
          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{member.email ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>{member.phone ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>انضمام: {member.created_at ? formatDate(member.created_at) : "—"}</span>
        </div>
        {member.supervisor_staff_id && (
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>يتبع لمشرف مباشر</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const TeamMemberCard = memo(TeamMemberCardImpl);
