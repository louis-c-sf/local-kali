import React, { useContext } from "react";
import { UserProfileGroupType } from "../../container/Contact/Imported/UserProfileGroupType";
import { getTotalImportedNumber } from "../../container/Contact/Imported/ContactListsTable";
import { useTranslation } from "react-i18next";
import styles from "./ConfirmSend.module.css";
import { Preview } from "./ConfirmSend/Preview";
import { Settings } from "./ConfirmSend/Settings";
import { Modal } from "semantic-ui-react";
import BroadcastContext from "./BroadcastContext";
import { Button } from "../shared/Button/Button";
import getIsReadOnlyCampaign from "./helpers/getIsReadOnlyCampaign";
import ActionsForm from "../AssignmentRules/AutomationRuleEdit/ActionsForm";
import { FacebookOTNBroadcastMapType } from "features/Facebook/models/FacebookOTNTypes";

export function sumListsMembers(lists: UserProfileGroupType[]) {
  return lists.reduce((count, list) => count + getTotalImportedNumber(list), 0);
}

const MAX_MESSAGE_SENT_COUNT_LIMIT = 1000;

function ConfirmSend(props: {
  channels: string[];
  lists: UserProfileGroupType[];
  show: boolean;
  isIncludedChatAPI: boolean;
  isIncludedOfficialChannel: boolean;
  confirmText: string;
  onConfirm(...args: any[]): void;
  onCancel(...args: any[]): void;
}) {
  const {
    show,
    lists,
    onConfirm,
    onCancel,
    isIncludedChatAPI,
    isIncludedOfficialChannel,
    confirmText,
  } = props;
  const {
    channelsWithIds,
    channelWithId,
    campaignChannelMessages,
    status,
    scheduledAt,
    automationActions = [],
  } = useContext(BroadcastContext);
  const foundFbCampaignIndex = campaignChannelMessages.findIndex((chnl) =>
    chnl.targetedChannelWithIds.some(
      (channel) => channel.channel === "facebook"
    )
  );
  const foundFaceBookCampaign = foundFbCampaignIndex > -1;
  let selectedType;
  let selectedRecipient = 0;
  if (foundFaceBookCampaign) {
    selectedType =
      campaignChannelMessages[foundFbCampaignIndex]?.facebookOTN?.tab ??
      undefined;
    selectedRecipient =
      campaignChannelMessages[foundFbCampaignIndex]?.facebookOTN?.recipient ??
      0;
  }

  const recipientsCount =
    foundFaceBookCampaign &&
    selectedType === FacebookOTNBroadcastMapType.facebookOTN
      ? selectedRecipient
      : sumListsMembers(lists);
  const { t } = useTranslation();

  const isDisplayOfficialAPIWarning =
    recipientsCount > MAX_MESSAGE_SENT_COUNT_LIMIT && isIncludedOfficialChannel;
  const isDisplayWhatsAppWarning =
    isDisplayOfficialAPIWarning || isIncludedChatAPI;

  const isReadOnly = getIsReadOnlyCampaign(status);
  const channelsAvailable = [...channelsWithIds];
  if (channelWithId) {
    channelsAvailable.push(channelWithId);
  }
  const filterChannelsAvailable = channelsAvailable.filter(
    (ch) => ch.channel !== "facebook"
  );

  return (
    <Modal
      open={show}
      onClose={onCancel}
      className={`confirm-sending ${styles.modal}`}
      closeIcon
      mountNode={document.body}
    >
      <Modal.Header className={styles.modalHeader}>
        {isReadOnly
          ? t("broadcast.edit.reviewModal.headerDisabled")
          : t("broadcast.edit.reviewModal.header")}
      </Modal.Header>
      <Modal.Content className={styles.modalContent}>
        <div className={styles.body}>
          {filterChannelsAvailable.length > 0 && (
            <div className={styles.preview}>
              <Preview
                channelsAvailable={filterChannelsAvailable}
                messages={campaignChannelMessages}
              />
            </div>
          )}
          <div className={styles.settings}>
            <div className={styles.section}>
              <Settings
                isDisplayWhatsAppWarning={isDisplayWhatsAppWarning}
                isDisplayOfficialAPIWarning={isDisplayOfficialAPIWarning}
                isIncludedChatAPI={isIncludedChatAPI}
                recipientsCount={recipientsCount}
                lists={lists}
              />
            </div>
            {automationActions.length > 0 && (
              <div className={`${styles.section}`}>
                <div className={styles.actionsTitle}>
                  {t("automation.grid.header.col.actions")}
                </div>
                <ActionsForm values={automationActions} readonly />
              </div>
            )}
          </div>

          <div className={styles.buttons}>
            {isReadOnly ? (
              <Button
                content={t("broadcast.edit.confirm.action.back")}
                onClick={onCancel}
                primary
              />
            ) : (
              <>
                <Button content={t("form.button.cancel")} onClick={onCancel} />
                <Button
                  content={
                    scheduledAt
                      ? t("broadcast.edit.button.schedule")
                      : t("broadcast.edit.button.send")
                  }
                  primary
                  onClick={onConfirm}
                />
              </>
            )}
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default ConfirmSend;
