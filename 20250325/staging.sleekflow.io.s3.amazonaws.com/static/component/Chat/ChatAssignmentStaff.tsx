import React from "react";
import Avatar from "react-avatar";
import { Icon, Image, Loader } from "semantic-ui-react";
import { StaffListType } from "./types";
import { equals } from "ramda";
import { matchesStaffId } from "../../types/TeamType";
import { useTranslation } from "react-i18next";
import { useGetUserPicUrl } from "../../api/User/useGetUserPicUrl";
import { UserInfoType } from "../../types/ConversationType";
import { useAppSelector } from "../../AppRootContext";
import headerStyles from "./ChatHeader/HeaderDropdown.module.css";

export function displayName(user: StaffListType) {
  return (
    user.displayName.trim() ||
    user.name.trim() ||
    user.userName.trim() ||
    user.email.trim() ||
    undefined
  );
}

export default function ChatAssignmentStaff(props: {
  loading: boolean;
  selectedUser?: UserInfoType;
}) {
  const { selectedUser } = props;
  const staffList = useAppSelector((s) => s.staffList, equals);
  const { t } = useTranslation();

  let selectedUserInfo: StaffListType = {
    name: "Unassigned",
    displayName: t("chat.filter.assignee.unassigned"),
    email: "",
    id: "",
    userName: "",
    userRole: "",
    firstName: "",
    lastName: "",
    createdAt: "",
  };
  const profilePic = useGetUserPicUrl(selectedUserInfo);
  if (selectedUser?.id) {
    const foundUser = staffList.find(matchesStaffId(selectedUser.id));
    if (foundUser) {
      selectedUserInfo = {
        ...foundUser.userInfo,
        name: foundUser.userInfo.displayName || foundUser.userInfo.email,
        profilePicture: foundUser.profilePicture,
        profilePictureURL: foundUser.profilePictureURL,
      };
    }
  }

  return (
    <span
      className={`selected-dropdown ${headerStyles.shrinkOnNarrowTablet}`}
      title={
        displayName(selectedUserInfo) || t("chat.filter.assignee.unassigned")
      }
    >
      {<Loader active={props.loading} inline size={"small"} />}
      <span className="assignee-pic">
        {profilePic ? (
          <Image size={"tiny"} src={profilePic} avatar />
        ) : (
          <Avatar name={displayName(selectedUserInfo)} maxInitials={2} round />
        )}
      </span>
      <span className={`info ${headerStyles.text}`}>
        <span className="name">{displayName(selectedUserInfo)}</span>
      </span>
      <Icon name="dropdown" />
    </span>
  );
}
