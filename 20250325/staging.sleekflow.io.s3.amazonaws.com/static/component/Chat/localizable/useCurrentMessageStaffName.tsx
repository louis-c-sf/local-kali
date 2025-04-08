import { staffDisplayName } from "../utils/staffDisplayName";
import { useTranslation } from "react-i18next";
import { StaffType } from "../../../types/StaffType";

export function useCurrentMessageStaffName() {
  const { t } = useTranslation();
  return {
    getCurrentMessageStaffName(
      staffId: string | undefined,
      staffList: StaffType[],
      currentUserId: string
    ) {
      if (!staffId || staffId === currentUserId) {
        return t("chat.filter.assignee.you");
      }
      const foundStaff = staffList.find(
        (staff) => staff.userInfo.id === staffId
      );
      return foundStaff
        ? staffDisplayName(foundStaff)
        : t("chat.filter.assignee.you");
    },
  };
}
