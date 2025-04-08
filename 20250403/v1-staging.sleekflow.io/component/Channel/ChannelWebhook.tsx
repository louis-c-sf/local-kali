import React, { useState, useEffect, useContext } from "react";
import ChannelInfoType from "../../types/ChannelInfoType";
import { get } from "../../api/apiRequest";
import {
  GET_COMPANY_WECHAT_WEBHOOKURL,
  GET_COMPANY_EMAIL_WEBHOOKURL,
  GET_COMPANY_LINE_WEBHOOKURL,
} from "../../api/apiPath";
import { ChannelConfigTypeMap } from "../Chat/Messenger/types";

interface ChannelWebhookProps {
  channelInfo: ChannelInfoType;
  setWebHookURL: Function;
}

export default ChannelWebhook;

function ChannelWebhook(props: ChannelWebhookProps) {
  const [webhookResult, setWebhook] = useState("");
  const { channelInfo, setWebHookURL } = props;
  const { name } = channelInfo;

  useEffect(() => {
    webhook(name as keyof ChannelConfigTypeMap);
  }, []);

  const webhook = async (channel: keyof ChannelConfigTypeMap) => {
    switch (channel) {
      case "line":
        const lineResult = await get(GET_COMPANY_LINE_WEBHOOKURL, {
          param: {},
        });
        // setWebhook(lineResult.Url);
        setWebHookURL(lineResult.Url.trim());
        return lineResult.Url;
      case "wechat":
        const liveChatResult = await get(GET_COMPANY_WECHAT_WEBHOOKURL, {
          param: {},
        });
        // console.debug('This is the webhook for WeChat: ' + liveChatResult.Url);
        setWebhook(liveChatResult.Url);
        setWebHookURL(liveChatResult.Url);
        return liveChatResult.Url;
      case "email":
        const emailResult = await get(GET_COMPANY_EMAIL_WEBHOOKURL, {
          param: {},
        });
        // console.debug('This is the webhook for WeChat: ' + emailResult.Url);
        setWebhook(emailResult.Url);
        return emailResult.Url;
    }
  };

  return <div></div>;
}
