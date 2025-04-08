import React, { useState } from "react";
import { Dropdown, Image, Portal } from "semantic-ui-react";
import { ChannelType } from "../../Chat/Messenger/types";
import { createPopper, Instance } from "@popperjs/core";
import { DropdownSelectionOptionType } from "../../Chat/ChannelFilterDropdown";

type ChannelClickHandlerType = (
  userId: string,
  channel: ChannelType | undefined,
  channelId: string | undefined
) => any;

interface ProfileChannelsListPropsType {
  onClick: ChannelClickHandlerType;
  menuOpen: boolean;
  setMenuOpen: Function;
  assigneeId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  channelList: DropdownSelectionOptionType[];
}

export function ProfileChannelsContextMenu(
  props: ProfileChannelsListPropsType
) {
  const { menuOpen, setMenuOpen, triggerRef, assigneeId, channelList } = props;
  const [dropdownRef, setDropdownRef] = useState<HTMLDivElement | null>(null);
  const [popper, setPopper] = useState<Instance | null>(null);

  function handleOpen() {
    if (!triggerRef.current || !dropdownRef) {
      return;
    }

    const popper = createPopper(triggerRef.current, dropdownRef, {
      placement: "bottom",
    });
    setPopper(popper);
  }
  function handleClose() {
    if (popper) {
      popper.destroy();
      setPopper(null);
    }
    setMenuOpen(false);
  }
  function wrapOptionToString(
    optionValue: DropdownSelectionOptionType | string
  ): string {
    return JSON.stringify(optionValue);
  }
  return (
    <div
      className={`profile-channels context-menu ${menuOpen ? "visible" : ""}`}
    >
      {menuOpen && (
        <Portal
          mountNode={triggerRef.current}
          open={true}
          transition={{
            duration: 0,
          }}
          onOpen={handleOpen}
          onClose={handleClose}
          closeOnDocumentClick
        >
          <div
            className={"ui dropdown channels-dropdown dropdown-menu-overlay"}
            ref={setDropdownRef}
          >
            <Dropdown.Menu open={channelList.length > 0}>
              {(channelList ?? []).map((channel, i) => {
                const img = channel.img;
                return (
                  <Dropdown.Item
                    content={
                      <div
                        className={`text ${
                          img ? "text_has-img" : "text_no-image"
                        }`}
                        key={i}
                      >
                        {img && <Image src={img} />}
                        <span className={"text-label"}>{channel.text}</span>
                      </div>
                    }
                    onClick={() =>
                      props.onClick(
                        assigneeId,
                        channel.value as ChannelType,
                        channel.instanceId
                      )
                    }
                    value={wrapOptionToString(channel)}
                  />
                );
              })}
            </Dropdown.Menu>
          </div>
        </Portal>
      )}
    </div>
  );
}
