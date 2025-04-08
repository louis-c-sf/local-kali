import React from "react";
import { useTranslation } from "react-i18next";
import {
  HoverDetailType,
  OptionType,
} from "../../../../models/FacebookOTNTypes";
import styles from "./MessageTypeModal.module.css";
import TickIcon from "../../../../../../assets/images/onboarding/tick.svg";
import { Image } from "semantic-ui-react";
import { ChatLabel } from "component/Chat/ChatLabel";
import FacebookImg from "../../../../../../assets/images/channels/facebook-messenger.svg";
import moment from "moment";

const SelectionDetail = (props: {
  detail: HoverDetailType;
  nonPromotionalDict: OptionType[];
}) => {
  const { detail, nonPromotionalDict } = props;
  const { t } = useTranslation();
  const hoverItem = detail.isFacebookOTN
    ? detail.option
    : nonPromotionalDict.find((row) => row.value === detail.option.value);
  return (
    <div
      className={`${styles.detailContainer} ${
        detail.option.value !== "" ? "hover" : "default"
      }`}
    >
      {detail.option.value !== "" ? (
        <>
          {detail.isFacebookOTN ? (
            <FacebookOTNDetail detail={detail} />
          ) : (
            <MessageTagDetail hoverItem={hoverItem} />
          )}
        </>
      ) : (
        <>{t("chat.facebookOTN.modal.messageType.placeholder")}</>
      )}
    </div>
  );
};
export default SelectionDetail;

const FacebookOTNDetail = (props: { detail: HoverDetailType }) => {
  const { t } = useTranslation();
  const { detail } = props;
  return (
    <>
      <div className={styles.description}>
        {t(
          "chat.facebookOTN.modal.messageType.options.facebookOTN.description"
        )}
      </div>
      <div className={styles.validUntil}>
        <div className="title">
          {t(
            "chat.facebookOTN.modal.messageType.options.facebookOTN.validUntil"
          )}
        </div>
        <span>{moment(detail.option.validUntil).format("DD/MM/YYYY LT")}</span>
      </div>
      <div className={styles.tagContainer}>
        <div className="title">
          {t("chat.facebookOTN.modal.messageType.options.facebookOTN.tag")}
        </div>
        {detail.option.tags && (
          <span className={styles.tags}>
            {detail.option.tags.map((tag, index) => (
              <ChatLabel
                tag={tag}
                key={tag.hashtag + index}
                collapsible={false}
              >
                <img src={FacebookImg} alt="facebook" />
              </ChatLabel>
            ))}
          </span>
        )}
      </div>
    </>
  );
};

const MessageTagDetail = (props: { hoverItem: OptionType | undefined }) => {
  const { t } = useTranslation();
  const { hoverItem } = props;
  return (
    <>
      <div className={styles.description}>{hoverItem?.description}</div>
      <div className={styles.example}>
        {t("chat.facebookOTN.modal.messageType.options.example")}
      </div>
      <ul>
        {hoverItem?.example?.map((e, index) => (
          <li key={index}>
            <Image src={TickIcon} size={"mini"} />
            {e}
          </li>
        ))}
      </ul>
    </>
  );
};
