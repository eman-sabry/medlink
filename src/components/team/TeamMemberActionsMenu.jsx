import { MoreVertical, Edit, KeyRound, UserCheck, UserX } from "lucide-react";
import { Dropdown, DropdownItem } from "../ui/Dropdown";

export function TeamMemberActionsMenu({ member, onEdit, onCreateAccount, onToggleStatus, align = "left" }) {
  return (
    <Dropdown
      align={align}
      trigger={
        <button
          type="button"
          className="p-2 rounded-xl hover:bg-muted/80 text-muted-foreground transition-all cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
    >
      <DropdownItem icon={Edit} onClick={() => onEdit(member)}>
        تعديل البيانات
      </DropdownItem>
      {!member.hasAccount && (
        <DropdownItem icon={KeyRound} onClick={() => onCreateAccount(member)}>
          إنشاء حساب دخول
        </DropdownItem>
      )}
      {member.hasAccount && member.accountStatus === "Active" && (
        <DropdownItem icon={UserX} destructive onClick={() => onToggleStatus(member, "Inactive")}>
          تعطيل الحساب
        </DropdownItem>
      )}
      {member.hasAccount && member.accountStatus === "Inactive" && (
        <DropdownItem icon={UserCheck} onClick={() => onToggleStatus(member, "Active")}>
          تفعيل الحساب
        </DropdownItem>
      )}
    </Dropdown>
  );
}
