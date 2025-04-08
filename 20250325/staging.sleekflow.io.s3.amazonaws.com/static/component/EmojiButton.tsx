import React from "react";
import EmojiPopUp from "../lib/EmojiPopUp";
import { PopupWithTooltip } from "./shared/upload/PopupWithTooltip";
import { useTranslation } from "react-i18next";
import { Button } from "semantic-ui-react";

interface EmojiButtonProps {
  handleEmojiInput: (emoji: string) => void;
}

export default function EmojiButton(props: EmojiButtonProps) {
  const { handleEmojiInput } = props;
  const { t } = useTranslation();
  return (
    <>
      <PopupWithTooltip
        tooltipPosition={"top-start"}
        tooltipText={t("emoji.tooltip.add")}
        tooltipClassName={"emoji-popup info-tooltip"}
        popupClassName={"empty"}
        tooltipOffset={[-8, 10]}
        tooltipTrigger={
          <Button className={"emoji-trigger"}>
            <i className={"ui icon emoji-trigger-icon"} />
          </Button>
        }
        renderPopup={(onPopupClose) => {
          return (
            <EmojiPopUp
              handleEmojiToggle={onPopupClose}
              setSelectedEmoji={handleEmojiInput}
            />
          );
        }}
      />
    </>
  );
}
