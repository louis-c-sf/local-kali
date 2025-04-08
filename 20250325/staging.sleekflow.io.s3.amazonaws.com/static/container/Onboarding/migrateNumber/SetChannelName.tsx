import React, { useContext } from "react";
import { Button } from "component/shared/Button/Button";
import { submitChannelName } from "api/CloudAPI/submitChannelName";
import { useTranslation } from "react-i18next";
import { Input } from "semantic-ui-react";
import { MigrateNumberContext } from "./MigrateNumberContext";
import styles from "./SetChannelName.module.css";
import { parseHttpError } from "api/apiRequest";
import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import { LOCAL_LAST_GET_CODE_TIME_STORAGE } from "./VerifyCode";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export const SetChannelName = (props: {
  onSubmit: () => void;
  channelName: string;
  updateChannelName: (channelName: string) => void;
}) => {
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const migrateNumberContext = useContext(MigrateNumberContext);
  const handleOnSubmit = async () => {
    try {
      migrateNumberContext.dispatch({
        type: "SET_LOADING",
        loading: true,
      });
      const res = await submitChannelName({
        channelName: props.channelName,
        wabaId: migrateNumberContext.destinationMessagingHubWabaId,
        wabaPhoneNumberId:
          migrateNumberContext.destinationMessagingHubPhoneNumberId,
      });
      const config = res.connectedWhatsappCloudApiConfig;
      if (config) {
        migrateNumberContext.dispatch({
          type: "SET_REVIEW_DATA",
          businessAccount: config.facebookWabaName,
          whatsappPhoneNumber: config.whatsappPhoneNumber,
          whatsappDisplayName: config.whatsappDisplayName,
          channelName: config.channelName,
          facebookBusinessName: config.facebookWabaBusinessName,
          businessVerificationStatus:
            config.facebookWabaBusinessVerificationStatus,
          approvalStatus: config.facebookPhoneNumberNameStatus,
          messagingLimitTier: config.facebookPhoneNumberMessagingLimitTier,
          facebookWabaBusinessId: config.facebookWabaBusinessId,
        });
      }
      props.onSubmit();
      localStorage.removeItem(LOCAL_LAST_GET_CODE_TIME_STORAGE);
    } catch (e) {
      const error = parseHttpError(e);
      flash(htmlEscape(`${error}`));
      console.error("handleOnSubmit e: ", e);
    } finally {
      migrateNumberContext.dispatch({
        type: "SET_LOADING",
        loading: false,
      });
    }
  };

  return (
    <div className={styles.container}>
      <span role="img" aria-label="" className={styles.icon}>
        💡
      </span>
      <div className={styles.title}>
        {t("guideContainer.migrateNumber.setChannelName.title")}
      </div>
      <div className={styles.description}>
        {t("guideContainer.migrateNumber.setChannelName.description")}
      </div>
      <label htmlFor="">
        {t("guideContainer.migrateNumber.setChannelName.label")}
      </label>
      <Input
        onChange={(e) => props.updateChannelName(e.target.value as string)}
      />
      <Button
        primary
        loading={migrateNumberContext.loading}
        onClick={migrateNumberContext.loading ? undefined : handleOnSubmit}
        className={styles.submit}
        disabled={props.channelName.trim() === ""}
      >
        {t("common.form.button.submit")}
      </Button>
    </div>
  );
};
