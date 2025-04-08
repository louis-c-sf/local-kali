import React from "react";
import { Form, Radio } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import flowStyles from "../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import {
  MessagingLimitMapping,
  NewNumberInfoType,
  SelectedChannelType,
} from "./types";
import SearchIcon from "assets/tsx/icons/SearchIcon";
import { parseAndFormatAnyPhone } from "component/Channel/selectors";

const ChannelGrid = (props: {
  channel: SelectedChannelType;
  type: "connect" | "unconnect";
  selectedNewNumber: NewNumberInfoType | undefined;
  setSelectedNewNumber: (
    selectedNewNumber: NewNumberInfoType | undefined
  ) => void;
  noData?: boolean;
}) => {
  const {
    channel,
    type,
    selectedNewNumber,
    setSelectedNewNumber,
    noData = false,
  } = props;
  const { t } = useTranslation();
  const title =
    type === "unconnect"
      ? t("onboarding.cloudApi.connectNewNumber.unconnectedTitle")
      : t("onboarding.cloudApi.connectNewNumber.connectedTitle");
  const gridTitle =
    type === "unconnect"
      ? [
          "",
          t("onboarding.cloudApi.common.columns.businessAccount"),
          t("onboarding.cloudApi.common.columns.phoneNumber"),
          t("onboarding.cloudApi.common.columns.displayName"),
        ]
      : [
          t("onboarding.cloudApi.common.columns.businessAccount"),
          t("onboarding.cloudApi.common.columns.phoneNumber"),
          t("onboarding.cloudApi.common.columns.displayName"),
          t("onboarding.cloudApi.common.columns.messagingLimit"),
        ];

  return (
    <Form key={type === "connect" ? "connectForm" : "unconnectForm"}>
      <div className={flowStyles.title}>{title}</div>
      <div
        className={
          type === "connect"
            ? flowStyles.connectGridContainer
            : flowStyles.unconnectGridContainer
        }
      >
        {gridTitle.map((colum, index) => (
          <div className={flowStyles.th} key={index}>
            {colum}
          </div>
        ))}
        {type === "unconnect" ? (
          noData ? (
            <div className={flowStyles.noFoundContainer}>
              <SearchIcon color="#EAEAEA" size={16} />
              {t("onboarding.cloudApi.connectNewNumber.noFound")}
            </div>
          ) : (
            channel.unconnected.map((row) =>
              row.wabaDtoPhoneNumbers.map((wabaDtoPhoneNumber, numberIndex) => (
                <>
                  {" "}
                  <Form.Field>
                    <Radio
                      className={flowStyles.radio}
                      type="radio"
                      name="radioGroup"
                      value={row.messagingHubWabaId}
                      onChange={(_, { value }) =>
                        setSelectedNewNumber({
                          businessAccount: row.facebookWabaName,
                          phoneNumber: wabaDtoPhoneNumber.facebookPhoneNumber,
                          displayName:
                            wabaDtoPhoneNumber.facebookPhoneNumberVerifiedName,
                          wabaId: row.messagingHubWabaId,
                          wabaPhoneNumberId:
                            wabaDtoPhoneNumber.messagingHubWabaPhoneNumberId,
                          facebookPhoneNumberId: row.facebookWabaId,
                          facebookWabaBusinessId: row.facebookWabaBusinessId,
                        })
                      }
                      checked={
                        selectedNewNumber?.wabaPhoneNumberId ===
                        wabaDtoPhoneNumber.messagingHubWabaPhoneNumberId
                      }
                    />
                  </Form.Field>
                  <div className={flowStyles.td}>{row.facebookWabaName}</div>
                  <div className={flowStyles.td}>
                    {parseAndFormatAnyPhone(
                      wabaDtoPhoneNumber.facebookPhoneNumber
                    )}
                  </div>
                  <div className={flowStyles.td}>
                    {wabaDtoPhoneNumber.facebookPhoneNumberVerifiedName}
                  </div>
                </>
              ))
            )
          )
        ) : (
          channel.connected.map((row) => (
            <>
              <div className={flowStyles.td}>
                {row.facebookWabaBusinessName}
              </div>
              <div className={flowStyles.td}>
                {parseAndFormatAnyPhone(row.whatsappPhoneNumber)}
              </div>
              <div className={flowStyles.td}>{row.whatsappDisplayName}</div>
              <div className={flowStyles.td}>
                {
                  MessagingLimitMapping[
                    row.facebookPhoneNumberMessagingLimitTier
                  ]
                }
              </div>
            </>
          ))
        )}
      </div>
    </Form>
  );
};
export default ChannelGrid;
