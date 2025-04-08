import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./FacebookOTNBroadcastTypeSelection.module.css";
import BroadcastOTNContent from "./BroadcastOTNContent";
import BroadcastMessageTagContent from "./BroadcastMessageTagContent";
import { FacebookOTNBroadcastMapType } from "../../../models/FacebookOTNTypes";
import { TypeCard } from "./TypeCard";
import BroadcastContext from "../../../../../component/Broadcast/BroadcastContext";
import {
  ChannelMessageType,
  UpdateSelectedCampaignMessageType,
} from "types/BroadcastCampaignType";
import LearnFacebookOTNPopup from "./LearnFacebookOTNPopup";

const FacebookOTNBroadcastTypeSelection = (props: {
  updateCampaignMessage: (
    type: keyof ChannelMessageType,
    content: UpdateSelectedCampaignMessageType
  ) => void;
  errorMessage: string;
  disabled: boolean;
}) => {
  const { updateCampaignMessage, errorMessage, disabled } = props;
  const { t } = useTranslation();
  const { campaignChannelMessages } = useContext(BroadcastContext);
  const [openModal, setOpenModal] = useState(false);

  const foundFbCampaignIndex = campaignChannelMessages.findIndex((chnl) =>
    chnl.targetedChannelWithIds.some(
      (channel) => channel.channel === "facebook"
    )
  );
  const selectedType =
    campaignChannelMessages[foundFbCampaignIndex].facebookOTN?.tab ??
    FacebookOTNBroadcastMapType.messageTag;
  const selectedOption =
    campaignChannelMessages[foundFbCampaignIndex].facebookOTN?.option ?? "";
  const selectedRecipient =
    campaignChannelMessages[foundFbCampaignIndex].facebookOTN?.recipient ?? 0;
  const selectOTNTab = () =>
    updateCampaignMessage("facebookOTN", {
      tab: FacebookOTNBroadcastMapType.facebookOTN,
      option: "",
      recipient: 0,
    });
  const selectMessageTagTab = () =>
    updateCampaignMessage("facebookOTN", {
      tab: FacebookOTNBroadcastMapType.messageTag,
      option: "",
    });

  useEffect(() => {
    updateCampaignMessage("facebookOTN", {
      tab: FacebookOTNBroadcastMapType.messageTag,
      option: "",
    });
  }, []);

  return (
    <>
      <div className={styles.tab}>
        <TypeCard
          title={t("broadcast.broadcastTypeSelection.messageTag.title")}
          value={FacebookOTNBroadcastMapType.messageTag}
          onChange={selectMessageTagTab}
          selectedType={selectedType}
          content={t("broadcast.broadcastTypeSelection.messageTag.content")}
          disabled={disabled}
        />
        <TypeCard
          title={t("broadcast.broadcastTypeSelection.facebookOTN.title")}
          value={FacebookOTNBroadcastMapType.facebookOTN}
          onChange={selectOTNTab}
          selectedType={selectedType}
          content={t("broadcast.broadcastTypeSelection.facebookOTN.content")}
          disabled={disabled}
        />
      </div>
      {selectedType === FacebookOTNBroadcastMapType.facebookOTN && (
        <BroadcastOTNContent
          onClick={() => setOpenModal(true)}
          setOption={(value: string) => {
            updateCampaignMessage("facebookOTN", {
              tab: FacebookOTNBroadcastMapType.facebookOTN,
              option: value,
            });
          }}
          setRecipient={(value: number) => {
            updateCampaignMessage("facebookOTN", {
              recipient: value,
            });
          }}
          selectedRecipient={selectedRecipient}
          selectedOption={selectedOption}
          errorMessage={errorMessage}
          disabled={disabled}
        />
      )}
      {selectedType === FacebookOTNBroadcastMapType.messageTag && (
        <BroadcastMessageTagContent
          setOption={(value: string) => {
            updateCampaignMessage("facebookOTN", {
              tab: FacebookOTNBroadcastMapType.messageTag,
              option: value,
            });
          }}
          selectedOption={selectedOption}
          errorMessage={errorMessage}
          disabled={disabled}
        />
      )}
      <LearnFacebookOTNPopup
        openModal={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
};
export default FacebookOTNBroadcastTypeSelection;
