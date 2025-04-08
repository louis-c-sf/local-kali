import React, { useState } from "react";
import { Button } from "../../shared/Button/Button";
import { postWithExceptions } from "../../../api/apiRequest";
import {
  POST_DELETE_MESSAGE,
  POST_FORWARD_MESSAGE,
} from "../../../api/apiPath";
import { prop } from "ramda";
import { DeleteConfirmation } from "./PickedMessageActions/DeleteConfirmation";
import { ForwardDialog } from "./PickedMessageActions/ForwardDialog";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import styles from "./PickedMessageActions.module.css";

export function PickedMessageActions() {
  const [messagesMemoized, chats] = useAppSelector((s) => [
    s.messagesMemoized,
    s.chats,
  ]);
  const pickingMessages = useAppSelector((s) => s.inbox.pickingMessages);
  const loginDispatch = useAppDispatch();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [forwardLoading, setForwardLoading] = useState(false);
  const { t } = useTranslation();

  const messagesSelected = messagesMemoized.filter((m) =>
    pickingMessages.pickedIds.includes(m.id)
  );
  const messagesSelectedIds = messagesSelected.map(prop("id"));

  function confirmDelete() {
    setShowDeleteConfirmation(true);
  }

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await postWithExceptions(POST_DELETE_MESSAGE, {
        param: { MessageIds: messagesSelectedIds },
      });
      loginDispatch({
        type: "INBOX.MESSAGE.DELETE_ENDED",
        messageIds: pickingMessages.pickedIds,
      });
    } catch (e) {
      console.error("PickedMessageActions.delete", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  function showForward() {
    setShowForwardDialog(true);
  }

  const handleForwardSubmit = async (
    chatIds: string[],
    messageIds: number[]
  ) => {
    setForwardLoading(true);

    const ids = messagesMemoized
      .filter((m) => messageIds.includes(m.id))
      .map((m) => m.id);

    try {
      await postWithExceptions(POST_FORWARD_MESSAGE, {
        param: {
          ConversationIds: chatIds,
          MessageIds: ids,
        },
      });
      loginDispatch({
        type: "INBOX.MESSAGE.FORWARD_ENDED",
        messageIds,
      });
      const [gotoChatId] = chatIds;
      const profile = chats?.find((c) => c.id === gotoChatId);
      if (profile && profile.assignee) {
        loginDispatch({
          type: "CHAT_SELECTED",
          selectedChat: [],
          isScrollToEnd: true,
          profile: profile,
          selectedUser: profile.assignee,
        });
      }
      setShowForwardDialog(false);
    } catch (e) {
      console.error("handleForwardSubmit", e);
    } finally {
      setForwardLoading(false);
    }
  };

  return (
    <>
      {pickingMessages.mode === "forward" && (
        <Button
          content={t("chat.modal.forward.action.forward")}
          className={` ${styles.button}`}
          onClick={showForward}
        />
      )}
      {pickingMessages.mode === "delete" && (
        <Button
          primary
          content={t("form.button.delete")}
          className={`${styles.button}`}
          onClick={confirmDelete}
        />
      )}
      {pickingMessages.mode === "delete" && showDeleteConfirmation && (
        <DeleteConfirmation
          loading={deleteLoading}
          number={pickingMessages.pickedIds.length}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirmation(false)}
        />
      )}
      {showForwardDialog && (
        <ForwardDialog
          loading={forwardLoading}
          messageIds={pickingMessages.pickedIds}
          onSubmit={handleForwardSubmit}
          onCancel={() => setShowForwardDialog(false)}
        />
      )}
    </>
  );
}
