import { AssigneeType } from "types/ConversationType";
import { StaffType } from "../../../types/StaffType";

export function staffDisplayName(
  staff: StaffType | AssigneeType | undefined
): string {
  return (
    staff?.userInfo?.displayName?.trim() ||
    staff?.userInfo?.userName.trim() ||
    staff?.userInfo?.email.trim() ||
    staff?.userInfo?.id ||
    staff?.name?.trim() ||
    ""
  );
}

export function senderDisplayName(name: string, phone_number: string): string {
  const nameChecking = name?.toLowerCase() === "anonymous" ? "" : name;
  return nameChecking || phone_number;
}
