import React, { useEffect, useState } from "react";
import flowStyles from "../CreateWhatsappFlow.module.css";
import { useTranslation } from "react-i18next";
import { WhatsappFlowHeader } from "../WhatsappFlowHeader";
import { fetchChannelList } from "api/Channel/fetchChannelList";
import { NewNumberInfoType, SelectedChannelType } from "../types";
import ChannelGrid from "../ChannelGrid";
import { Loader } from "semantic-ui-react";
import ConnectPhoneNumberButton from "./ConnectPhoneNumberButton";

export function ConnectNewNumber(props: {
  selectedNewNumber: NewNumberInfoType | undefined;
  setSelectedNewNumber: (
    selectedNewNumber: NewNumberInfoType | undefined
  ) => void;
  onSubmit: () => void;
}) {
  const { selectedNewNumber, setSelectedNewNumber } = props;
  const { t } = useTranslation();
  const [channel, setChannel] = useState<SelectedChannelType>({
    connected: [],
    unconnected: [],
  });
  const [loading, setLoading] = useState(false);
  const noNewNumber = channel.unconnected.length === 0;

  const getChannelList = async () => {
    try {
      setLoading(true);
      const result = await fetchChannelList();
      setChannel({
        connected: result.whatsappCloudApiConfigs,
        unconnected: result.unconnectedWabaPhoneNumberChannels,
      });
    } catch (e) {
      console.error("getChannelList e: ", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getChannelList();
  }, []);

  useEffect(() => {
    if (channel.unconnected.length > 0 && !selectedNewNumber) {
      if (channel.unconnected[0].wabaDtoPhoneNumbers.length === 0) {
        return;
      }
      if (channel.unconnected.length === 0) {
        return;
      }
      const defaultRow = channel.unconnected[0];
      setSelectedNewNumber({
        businessAccount: defaultRow.facebookWabaName,
        channelName: "",
        phoneNumber: defaultRow.wabaDtoPhoneNumbers[0].facebookPhoneNumber,
        displayName:
          defaultRow.wabaDtoPhoneNumbers[0].facebookPhoneNumberVerifiedName,
        wabaId: defaultRow.messagingHubWabaId,
        wabaPhoneNumberId:
          defaultRow.wabaDtoPhoneNumbers[0].messagingHubWabaPhoneNumberId,
        facebookPhoneNumberId: defaultRow.facebookWabaId,
        facebookWabaBusinessId: defaultRow.facebookWabaBusinessId,
      });
    }
  }, [channel.unconnected, selectedNewNumber, setSelectedNewNumber]);

  return (
    <div
      className={`${flowStyles.contentContainer} ${flowStyles.newNumberContainer}`}
    >
      <WhatsappFlowHeader
        icon={"whatsapp"}
        header={t("onboarding.cloudApi.connectNewNumber.header")}
        subheader={t("onboarding.cloudApi.connectNewNumber.subHeader")}
      />
      {loading ? (
        <Loader />
      ) : (
        <>
          <ChannelGrid
            channel={channel}
            type="unconnect"
            selectedNewNumber={selectedNewNumber}
            setSelectedNewNumber={setSelectedNewNumber}
            noData={noNewNumber}
          />
          <ChannelGrid
            channel={channel}
            type="connect"
            selectedNewNumber={selectedNewNumber}
            setSelectedNewNumber={setSelectedNewNumber}
          />
          <ConnectPhoneNumberButton
            onClick={props.onSubmit}
            disabled={noNewNumber || selectedNewNumber === undefined}
            text={t("onboarding.cloudApi.common.button.next")}
          />
        </>
      )}
    </div>
  );
}
