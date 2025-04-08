import React from "react";
import { Image } from "semantic-ui-react";
import SleekFlowIcon from "../../assets/images/logo-solid.svg";
import Avatar from "react-avatar";
import MessageType from "../../types/MessageType";
import { ProfileType } from "../../types/LoginType";
import { useProfileDisplayName } from "./utils/useProfileDisplayName";
import { useAppSelector } from "../../AppRootContext";
import { getSenderProfilePic } from "./Records/MessageRecord";
import { equals } from "ramda";

export default ChatRecordIcon;

function ChatRecordIcon(props: {
  isStaff: boolean;
  size: number;
  message?: MessageType;
  profile?: ProfileType;
  pic?: string;
}) {
  const { isStaff, message, profile } = props;
  const staffList = useAppSelector((s) => s.staffList, equals);
  const { getPicText } = useProfileDisplayName();

  const pic = props.pic || getPicText(profile, message);

  const filePath = message
    ? getSenderProfilePic(message, staffList) || pic
    : "";

  return (
    <div className="icon-image">
      {filePath?.startsWith("http") || filePath?.endsWith(".svg") ? (
        <Image src={filePath} avatar />
      ) : isStaff ? (
        <Image avatar src={SleekFlowIcon} alt={"Sleekflow"} />
      ) : (
        <Avatar
          name={pic}
          size={`${props.size}px`}
          round={true}
          maxInitials={2}
        />
      )}
    </div>
  );
}
