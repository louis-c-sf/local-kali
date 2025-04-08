import React from "react";
import { Button } from "../shared/Button/Button";
import { useAppSelector } from "../../AppRootContext";
import { useTranslation } from "react-i18next";
import ChannelExceedLimitModalButton from "./ChannelExceedLimitModalButton";

const AddChannelButton = ({
  isChannel,
  handleClick,
  buttonLoading,
  addLabel,
}: {
  isChannel?: boolean;
  handleClick: () => void;
  buttonLoading: boolean;
  addLabel?: string;
}) => {
  const { t } = useTranslation();
  const { currentNumberOfChannels, maximumNumberOfChannels } = useAppSelector(
    (s) => ({
      currentNumberOfChannels: s.usage.currentNumberOfChannels,
      maximumNumberOfChannels: s.usage.maximumNumberOfChannel,
    })
  );

  if (maximumNumberOfChannels <= currentNumberOfChannels && isChannel) {
    return <ChannelExceedLimitModalButton />;
  }

  return (
    <Button
      loading={buttonLoading}
      customSize={"sm"}
      onClick={buttonLoading ? undefined : handleClick}
    >
      {addLabel ?? t("channels.selection.button.add")}
    </Button>
  );
};

export default AddChannelButton;
