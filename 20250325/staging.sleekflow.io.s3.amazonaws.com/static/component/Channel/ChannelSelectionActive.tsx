import { useFlashMessageChannel } from "component/BannerMessage/flashBannerMessage";
import React, { useContext } from "react";
import ChannelInfoType, {
  ChannelInfoConfiguredType,
} from "../../types/ChannelInfoType";
import { ChannelActive } from "./ChannelActive";
import { ChannelContextType, ChannelsContext } from "./ChannelsContext";

export default ChannelsSelectionActive;

function ChannelsSelectionActive(props: {
  shopifyPlanId?: string;
  stripePublicKey?: string;
  channelInfo: ChannelInfoConfiguredType<any>[];
  requestChannels: ChannelInfoType[];
}) {
  const { channelInfo, shopifyPlanId, stripePublicKey } = props;
  const { dispatch } = useContext<ChannelContextType>(ChannelsContext);
  return (
    <div className="channel-list">
      {channelInfo.map((channel, index) => {
        return (
          <ChannelActive
            key={`channelInfo${index}`}
            channel={channel}
            dispatch={dispatch}
            hideActions={false}
            shopifyPlanId={shopifyPlanId}
            stripePublicKey={stripePublicKey}
          />
        );
      })}
    </div>
  );
}
