import React, { useContext, useState } from "react";
import getIsReadOnlyCampaign from "../helpers/getIsReadOnlyCampaign";
import BroadcastContext from "../BroadcastContext";
import { sumListsMembers } from "../ConfirmSend";
import { UserProfileGroupType } from "../../../container/Contact/Imported/UserProfileGroupType";
import useImportedLists from "../../../container/Contact/Imported/useImportedLists";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../AppRootContext";
import { Button } from "../../shared/Button/Button";
import { useValidateBroadcastForm } from "../validator/useValidateBroadcastForm";
import { validateWeChatBroadcast } from "../validator/validateWeChatBroadcast";
import { FooterView } from "../shared/FooterView";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export function Footer(props: {
  save: () => Promise<void>;
  scheduledAt?: string;
  hasActions: boolean;
  isActionsEditorClickable: boolean;
  onActionsEditorOpen: () => void;
}) {
  const { save, scheduledAt } = props;
  const { lists } = useImportedLists();
  const flash = useFlashMessageChannel();
  const { t } = useTranslation();
  const [maxAutomationUsage, totalMessageSent] = useAppSelector((s) => [
    s.usage.maximumAutomatedMessages,
    s.usage.totalMessagesSentFromSleekflow,
  ]);

  const broadcastContext = useContext(BroadcastContext);
  const { validateForm } = useValidateBroadcastForm();
  const {
    contactLists,
    campaignChannelMessages,
    status,
    name,
    broadcastDispatch,
  } = broadcastContext;

  const [loading, setLoading] = useState(false);
  const totalRecipientsCount = sumListsMembers(
    lists.filter((list: UserProfileGroupType) =>
      Boolean(contactLists?.includes(list.id))
    )
  );

  const saveContent = async () => {
    setLoading(true);
    await saveBroadcast();
    setLoading(false);
  };

  const saveBroadcast = async () => {
    try {
      await save();
    } catch (e) {
      flash(t("flash.broadcast.save.error", { error: `${htmlEscape(e)}` }));
    }
  };
  const resetMsgAmount = maxAutomationUsage - totalMessageSent;
  const confirmButton = scheduledAt
    ? t("broadcast.edit.confirm.schedule.title")
    : t("broadcast.edit.confirm.title");

  const showReviewDialog = () => {
    const { errors } = validateForm(broadcastContext, true);
    const weChatValues = { campaignChannelMessages, name };
    const errorMessages = validateWeChatBroadcast(weChatValues, errors);
    broadcastDispatch({ type: "VALIDATION_COMPLETE", errors: errorMessages });
    if (Object.entries(errorMessages).length > 0) {
      return;
    }
    broadcastDispatch({ type: "TOGGLE_PREVIEW_MODAL", show: true });
  };

  const isReadOnly = getIsReadOnlyCampaign(status);

  return (
    <FooterView
      primaryContent={
        <Button
          className={"button-fluid"}
          content={
            !props.hasActions
              ? t("broadcast.action.addActions")
              : t("broadcast.action.modifyActions")
          }
          disabled={!props.isActionsEditorClickable}
          onClick={props.onActionsEditorOpen}
          centerText
        />
      }
      minorContent={
        isReadOnly ? (
          <Button primary onClick={showReviewDialog}>
            {t("broadcast.edit.reviewModal.headerDisabled")}
          </Button>
        ) : (
          <>
            <Button onClick={saveContent} disabled={isReadOnly || loading}>
              {t("broadcast.edit.button.saveDraft")}
            </Button>
            <Button
              primary
              onClick={showReviewDialog}
              disabled={totalRecipientsCount > resetMsgAmount || loading}
            >
              {confirmButton}
            </Button>
          </>
        )
      }
    />
  );
}
