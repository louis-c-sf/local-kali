import React, { useState, useEffect } from "react";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { useTranslation } from "react-i18next";
import { WhatsappFlowHeader } from "./WhatsappFlowHeader";
import { Button } from "../shared/Button/Button";
import { Form } from "semantic-ui-react";
import {
  BusinessVerificationStatusDictEnum,
  NewNumberInfoType,
  SubmitChannelResponseType,
} from "./types";
import { submitCloudApiChannel } from "api/Channel/submitCloudApiChannel";
import { FieldError } from "../shared/form/FieldError";
import { fetchAutoTopUpSettings } from "api/CloudAPI/fetchAutoTopUpSettings";
import { getChannelTypeObj } from "component/shared/useAnalytics";
import mixpanel from "mixpanel-browser";

export function SetChannelName(props: {
  selectedNewNumber: NewNumberInfoType | undefined;
  setSelectedNewNumber: (
    selectedNewNumber: NewNumberInfoType | undefined
  ) => void;
  onSubmit: () => void;
  skipAutoTopUp: () => void;
}) {
  const { selectedNewNumber, setSelectedNewNumber } = props;
  const { t } = useTranslation();
  const [errMsg, setErrMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAutoTopUpEnabled, setIsAutoTopUpEnabled] = useState(false);
  const handleSubmit = async () => {
    if (!selectedNewNumber) return;
    if (
      !selectedNewNumber.channelName ||
      selectedNewNumber.channelName.trim() === ""
    ) {
      setErrMsg(t("onboarding.cloudApi.common.required"));
      return;
    }
    try {
      setLoading(true);
      const result: SubmitChannelResponseType = await submitCloudApiChannel({
        channelName: selectedNewNumber?.channelName,
        wabaId: selectedNewNumber?.wabaId ?? "",
        wabaPhoneNumberId: selectedNewNumber?.wabaPhoneNumberId ?? "",
      });
      mixpanel.track("Channel Connected", getChannelTypeObj("whatsApp"));
      if (result.connectedWhatsappCloudApiConfig) {
        if (selectedNewNumber) {
          setSelectedNewNumber({
            ...selectedNewNumber,
            businessVerificationStatus: result.connectedWhatsappCloudApiConfig
              .facebookWabaBusinessVerificationStatus as BusinessVerificationStatusDictEnum,
            whatsappNameStatus:
              result.connectedWhatsappCloudApiConfig
                .facebookPhoneNumberNameStatus,
            messagingLimit:
              result.connectedWhatsappCloudApiConfig
                .facebookPhoneNumberMessagingLimitTier,
          });
        }
      }
      if (isAutoTopUpEnabled) {
        props.skipAutoTopUp();
      } else {
        props.onSubmit();
      }
    } catch (e) {
      console.error("handleSubmit e: ", e);
      setErrMsg(e as any);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function getAutoTopUpSettings(facebookWabaBusinessId: string) {
      fetchAutoTopUpSettings(facebookWabaBusinessId)
        .then((result) => {
          if (
            result?.business_balance_auto_top_up_profile?.is_auto_top_up_enabled
          ) {
            setIsAutoTopUpEnabled(true);
          }
        })
        .catch(console.error);
    }
    if (!selectedNewNumber) {
      return;
    }
    getAutoTopUpSettings(selectedNewNumber.facebookWabaBusinessId);
  }, []);

  return (
    <div className={flowStyles.contentContainer}>
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.cloudApi.setChannelName.header")}
        subheader={t("onboarding.cloudApi.setChannelName.subHeader")}
      />
      <Form className={flowStyles.setChannelNameForm}>
        <Form.Field>
          <label htmlFor="phoneNumber">
            {t("onboarding.cloudApi.common.columns.phoneNumber")}
          </label>
          <Form.Input
            id="phoneNumber"
            value={selectedNewNumber?.phoneNumber}
            disabled
            type="text"
          />
        </Form.Field>
        <Form.Field>
          <label htmlFor="displayName">
            {t("onboarding.cloudApi.common.columns.displayName")}
          </label>
          <Form.Input
            id="displayName"
            value={selectedNewNumber?.displayName}
            disabled
            type="text"
          />
        </Form.Field>
        <Form.Field>
          <label htmlFor="channelName">
            {t("onboarding.cloudApi.common.columns.channelName")}
          </label>
          <Form.Input
            id="channelName"
            value={selectedNewNumber?.channelName}
            placeholder={t("onboarding.cloudApi.setChannelName.placeholder")}
            type="text"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const { value } = e.target;
              if (selectedNewNumber) {
                setSelectedNewNumber({
                  ...selectedNewNumber,
                  channelName: value,
                });
              }
            }}
          />
        </Form.Field>
        <FieldError text={errMsg} />
      </Form>
      <Button
        primary
        fluid
        centerText
        loading={loading}
        customSize={"mid"}
        disabled={loading}
        onClick={loading ? undefined : handleSubmit}
      >
        {t("onboarding.cloudApi.common.button.next")}
      </Button>
    </div>
  );
}
