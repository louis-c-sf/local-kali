import React, { useEffect, useRef, useState } from "react";
import { ChannelType } from "../../Chat/Messenger/types";
import { ProfileChannelsContextMenu } from "./ProfileChannelsContextMenu";
import lastChannelName from "../../Chat/utils/lastChannelName";
import { isFreePlan } from "../../../types/PlanSelectionType";
import { useTranslation } from "react-i18next";
import useDefaultChannelSelection from "../../Chat/useDefaultChannelSelection";
import { useAppSelector } from "../../../AppRootContext";
import { equals, pick } from "ramda";
import { useOpenInboxChat } from "./useOpenInboxChat";

export default function NewMessageButton(props: {}) {
  const handleCreateMessage = useOpenInboxChat();
  const { currentPlan, profile, company, staffList } = useAppSelector(
    pick(["currentPlan", "profile", "company", "staffList"]),
    equals
  );
  const [isDisabled, setIsDisabled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { channels } = useDefaultChannelSelection();
  const { t } = useTranslation();

  let assigneeId = "all";
  const findContactOwner = company?.customUserProfileFields.find(
    (field) => field.fieldName.toLowerCase() === "contactowner"
  );
  if (findContactOwner) {
    const findContactOwnerRecord = profile?.customFields?.find(
      (field) => field.companyDefinedFieldId === findContactOwner.id
    );
    if (
      staffList?.some(
        (staff) => staff.userInfo.id === findContactOwnerRecord?.value
      )
    ) {
      assigneeId = findContactOwnerRecord?.value ?? "all";
    }
  }

  useEffect(() => {
    if (currentPlan.id) {
      setIsDisabled(isFreePlan(currentPlan) || channels.length === 0);
    }
  }, [currentPlan.id, channels.length === 0]);
  const onClick = async () => {
    const defaultChannel =
      channels.find((c) => c.value.includes("twilio_whatsapp")) ??
      channels.find((c) => c.value === "whatsapp360dialog") ??
      channels.find((c) => c.value === "whatsappcloudapi") ??
      channels.find((c) => c.value.includes("whatsapp")) ??
      channels[0];
    const lastChannel = lastChannelName(profile.customFields, company);
    const getLastChannelName =
      lastChannel === "web" &&
      profile.whatsAppAccount &&
      defaultChannel?.value.includes("whatsapp")
        ? defaultChannel?.value
        : lastChannel || defaultChannel?.value;
    if (getLastChannelName === "whatsapp") {
      await handleCreateMessage(
        assigneeId,
        getLastChannelName as ChannelType,
        profile.whatsAppAccount?.instanceId
      );
      return;
    } else if (
      getLastChannelName === "whatsapp360dialog" &&
      profile.whatsApp360DialogUser?.channelId
    ) {
      await handleCreateMessage(
        assigneeId,
        getLastChannelName as ChannelType,
        profile.whatsApp360DialogUser.channelId + ""
      );
      return;
    } else if (defaultChannel && defaultChannel.value.includes("whatsapp")) {
      await handleCreateMessage(
        assigneeId,
        getLastChannelName as ChannelType,
        defaultChannel?.instanceId
      );
      return;
    }
    await handleCreateMessage(
      assigneeId,
      getLastChannelName as ChannelType,
      undefined
    );
  };
  const onMouseOver = () => {
    const getLastChannelName = lastChannelName(profile.customFields, company);
    if (isDisabled || (profile.conversationId && getLastChannelName)) {
      return undefined;
    }
    return setOpenMenu(true);
  };

  return (
    <>
      <button
        disabled={isDisabled}
        onMouseOver={onMouseOver}
        onClick={onClick}
        className={`ui button small btn-new-message ${
          !isDisabled ? "primary" : "disabled"
        }`}
        ref={buttonRef}
      >
        {t("profile.individual.actions.message")}
      </button>
      <ProfileChannelsContextMenu
        assigneeId={assigneeId}
        triggerRef={buttonRef}
        onClick={handleCreateMessage}
        menuOpen={openMenu}
        setMenuOpen={setOpenMenu}
        channelList={channels}
      />
    </>
  );
}
