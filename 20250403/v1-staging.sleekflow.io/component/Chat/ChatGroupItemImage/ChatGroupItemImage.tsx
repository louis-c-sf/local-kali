import React from "react";
import { Image } from "semantic-ui-react";
import userIcon from "../../../assets/images/user.svg";
import Avatar from "react-avatar";
import { parseAndFormatAnyPhone } from "../../Channel/selectors";
import SMSNumberImg from "../../../assets/images/SMS_Number_Icon.svg";
import WhatsappNumberImg from "../../../assets/images/WhatsApp_Number_Icon.svg";
import styles from "./ChatGroupItemImage.module.css";

interface ChatGroupItemImageProps {
  pic: string;
  channel: string;
  name: string;
}
export function channelPhoneNumberImage(name: string, channel: string) {
  const phoneNumber = parseAndFormatAnyPhone(name);
  if (phoneNumber) {
    if (channel === "whatsapp") {
      return WhatsappNumberImg;
    } else if (channel === "sms") {
      return SMSNumberImg;
    }
  }
  return undefined;
}
export default function ChatGroupItemImage(props: ChatGroupItemImageProps) {
  const { pic, channel, name } = props;

  const phoneNumberImage = channelPhoneNumberImage(name, channel);
  return (
    <div
      className={`chat-group-item-image ${
        pic ? styles.userImage : "no-user-image"
      }`}
    >
      {pic ? (
        <Image circular size="tiny" src={pic ? pic : userIcon} />
      ) : phoneNumberImage ? (
        <Image circular size="tiny" src={phoneNumberImage} />
      ) : (
        <Avatar
          name={name.replace(/<\/?[^>]+(>|$)/g, "")}
          size={"32px"}
          round={true}
          maxInitials={2}
        />
      )}
    </div>
  );
}
