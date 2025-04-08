import { DisplayableProfileType } from "../../../types/ProfileSearchType";
import { useCallback } from "react";
import { ProfileType } from "../../../types/LoginType";
import MessageType, { isStaffMessage } from "../../../types/MessageType";
import { getClientName } from "../Records/getClientName";
import { channelPhoneNumberImage } from "../ChatGroupItemImage/ChatGroupItemImage";
import { staffDisplayName } from "./staffDisplayName";
import { useAppSelector } from "../../../AppRootContext";
import { equals } from "ramda";

export function useProfileDisplayName() {
  const staffList = useAppSelector((s) => s.staffList, equals);

  const profileDisplayName = useCallback(
    (profile: DisplayableProfileType): string => {
      const firstName = profile?.firstName?.trim();
      const lastName = profile?.lastName?.trim();
      const email = profile.emailAddress?.email?.trim();
      const emailName = profile.emailAddress?.name?.trim();

      const fullName = [firstName || "", lastName || ""].join(" ").trim();

      return fullName || profile.displayName || emailName || email || "";
    },
    []
  );

  function getSenderFieldName(sender: any): string | undefined {
    return (
      sender?.displayName ??
      sender?.userName ??
      sender?.name ??
      sender?.firstName ??
      sender?.nickname ??
      ""
    );
  }

  const getSenderName = useCallback(
    (message: MessageType, profile?: ProfileType) => {
      const senderName = message.sender
        ? getSenderFieldName(message.sender)
        : undefined;
      if (senderName) {
        if (
          !isStaffMessage(message) &&
          profile &&
          !profile?.whatsAppAccount?.is_group
        ) {
          return profileDisplayName(profile);
        }
        return senderName;
      }
      if (isStaffMessage(message)) {
        const staff = staffList.find(
          (s) => s.userInfo.id === message.sender?.id
        );
        if (staff && staffDisplayName(staff)) {
          return staffDisplayName(staff);
        }
      }
    },
    [staffList]
  );

  const getPicText = useCallback(
    (profile?: ProfileType, message?: MessageType) => {
      if (message && isStaffMessage(message) && message.sender) {
        return message.sender.userName;
      } else if (profile && message) {
        if (profile.whatsAppAccount?.is_group) {
          return message.sender?.profile_pic || getClientName(message, profile);
        } else {
          const profileName = profileDisplayName(profile);
          if (profile.displayProfilePicture) {
            return profile.displayProfilePicture;
          } else {
            return (
              channelPhoneNumberImage(profileName, message.channel) ||
              profileName
            );
          }
        }
      }
      return "";
    },
    [profileDisplayName]
  );

  return {
    profileDisplayName,
    getPicText,
    getSenderName,
  };
}
