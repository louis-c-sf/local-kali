import { Image } from "semantic-ui-react";
import Avatar from "react-avatar";
import React from "react";
import { StaffListType } from "./types";
import { useGetUserPicUrl } from "../../api/User/useGetUserPicUrl";

export function StaffItemAvatar(props: {
  staff: StaffListType;
  hideText?: boolean;
}) {
  const name = props.staff.displayName || props.staff.email;
  const profilePic = useGetUserPicUrl(props.staff);
  return (
    <>
      <span className={"staff-item-avatar"}>
        {profilePic ? (
          <Image size={"tiny"} src={profilePic} avatar />
        ) : (
          <Avatar name={name} round={true} maxInitials={2} />
        )}
      </span>
    </>
  );
}
