import { Image, ImageProps } from "semantic-ui-react";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import React from "react";
import { StaffType } from "../../../types/StaffType";
import { Avatar } from "./Avatar";
import { useGetUserPicUrl } from "api/User/useGetUserPicUrl";
import { ReactAvatarProps } from "react-avatar";

export function StaffAvatar(props: {
  staff: StaffType;
  size: string;
  imageProps?: ImageProps;
  avatarProps?: ReactAvatarProps;
}) {
  const { staff, size } = props;
  const profilePictureUrl = useGetUserPicUrl(staff);
  return (
    <>
      {profilePictureUrl ? (
        <Image
          size={"tiny"}
          src={profilePictureUrl}
          avatar
          {...props.imageProps}
        />
      ) : (
        <Avatar
          name={staffDisplayName(staff)}
          size={size}
          {...props.avatarProps}
        />
      )}
    </>
  );
}
