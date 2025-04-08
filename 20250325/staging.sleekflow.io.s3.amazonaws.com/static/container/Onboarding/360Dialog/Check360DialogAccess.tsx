import React from "react";
import UpdateOfficialVerification from "../../../component/CreateWhatsappFlow/CompleteOfficialVerification/UpdateOfficialVerification";
import { useHistory, useLocation } from "react-router";
import useCompanyChannels from "../../../component/Chat/hooks/useCompanyChannels";
import { ChannelConfigTypeMap } from "../../../component/Chat/Messenger/types";
import useRouteConfig from "../../../config/useRouteConfig";
import styles from "../../../component/CreateWhatsappFlow/CreateWhatsappFlow.module.css";
import { PostLogin } from "../../../component/Header";
import BannerMessage from "../../../component/BannerMessage/BannerMessage";

type The360DialogChannelType = ChannelConfigTypeMap["whatsapp360dialog"];

function Check360DialogAccess(props: {}) {
  const location = useLocation<{ channelId: string }>();
  const channelId = new URLSearchParams(location.search).get("channelId");
  const { routeTo } = useRouteConfig();
  const channels = useCompanyChannels();
  const history = useHistory();

  if (!channelId) {
    history.push(routeTo("/channels"));
    return null;
  }
  const whatsappChannelConfig = channels.reduce<
    The360DialogChannelType | undefined
  >((acc, next) => {
    if (acc) {
      return acc;
    }
    if (next.type === "whatsapp360dialog") {
      return (next.configs as The360DialogChannelType[])?.find(
        (c) => c.channelId === channelId
      );
    }
  }, undefined);

  if (!whatsappChannelConfig) {
    history.push(routeTo("/channels"));
    return null;
  }

  return (
    <div className={"post-login"}>
      <PostLogin selectedItem={""} />
      <div className="main content create-whatsapp-form">
        <div className={styles.container}>
          <div className={`create-form`}>
            <div className={styles.wrapper}>
              <UpdateOfficialVerification
                accessLevel={whatsappChannelConfig?.accessLevel}
              />
            </div>
          </div>
        </div>
        <BannerMessage />
      </div>
    </div>
  );
}

export default Check360DialogAccess;
