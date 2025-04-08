import * as React from "react";
import {
  ChannelDropdownOption,
  useTransformChannelsToDropdown,
} from "../localizable/useTransformChannelsToDropdown";
import { DropdownSelectionOptionType } from "../ChannelFilterDropdown";
import { Checkbox, Dropdown } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import { equals, pick } from "ramda";
import useCompanyChannels from "../hooks/useCompanyChannels";
import { aliasChannelName } from "../../Channel/selectors";
import { ChannelType } from "../Messenger/types";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

const ChannelMenu = (props: {
  itemsFiltered: ChannelDropdownOption[] | undefined;
  matchesChannelOption: (
    name: string,
    instanceId?: string
  ) => (channel: ChannelDropdownOption) => boolean;
}) => {
  const { itemsFiltered, matchesChannelOption } = props;
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const { selectedChannel, selectedInstanceId } = useAppSelector(
    pick(["selectedChannel", "selectedInstanceId"]),
    equals
  );
  const { transformChannelsToDropdown } = useTransformChannelsToDropdown();
  const channelChoices = transformChannelsToDropdown(
    useCompanyChannels(),
    true
  );

  function toggleChannel(channel: DropdownSelectionOptionType) {
    loginDispatch({
      type: "CLEAR_PROFILE",
    });
    loginDispatch({
      type: "INBOX.FILTER_CHANNEL_UPDATE",
      selectedChannel: aliasChannelName(channel.value as ChannelType),
      selectedInstanceId: channel.instanceId,
    });
  }

  function toggleAllChannels() {
    loginDispatch({
      type: "INBOX.FILTER_CHANNEL_UPDATE",
      selectedChannel: "all",
    });
  }

  return (
    <>
      <Dropdown.Item className={"filter"} key={"channels-all"}>
        <Checkbox
          checked={selectedChannel === "all"}
          onClick={toggleAllChannels}
        />
        <div className="marker">
          <i className={"ui icon filter-channels-all"} />
        </div>
        <div className="text" onClick={toggleAllChannels}>
          {t("chat.filter.channel.all")}
        </div>
      </Dropdown.Item>
      {(itemsFiltered ?? channelChoices).map((ch, i) => (
        <Dropdown.Item
          className={"filter"}
          key={`channels-${ch.value}_${ch.instanceId ?? i}`}
        >
          <Checkbox
            checked={Boolean(
              matchesChannelOption(selectedChannel, selectedInstanceId)(ch)
            )}
            onClick={() => toggleChannel(ch)}
          />
          <div className="marker">
            <img src={ch.img} />
          </div>
          <div
            className="text"
            onClick={() => toggleChannel(ch)}
            title={htmlEscape(ch.text)}
          >
            {ch.text}
          </div>
        </Dropdown.Item>
      ))}
    </>
  );
};
export default ChannelMenu;
