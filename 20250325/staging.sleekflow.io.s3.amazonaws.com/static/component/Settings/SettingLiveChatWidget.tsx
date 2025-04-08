import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  GridRow,
  Icon,
  Image,
  Modal,
  Tab,
} from "semantic-ui-react";

import styles from "./SettingLiveChatWidget.module.css";
import { post } from "../../api/apiRequest";
import { CodeBlock, nord } from "react-code-blocks";
import SettingProfilePic from "./SettingProfilePic/SettingProfilePic";
import Textarea from "react-textarea-autosize";
import BlogURLType from "../../types/BlogUrlType";
import { POST_COMPANY_FIELD } from "../../api/apiPath";
import Helmet from "react-helmet";
import TrackingCodeColour from "../TrackingCodeColour";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { Trans, useTranslation } from "react-i18next";
import styled from "styled-components";
import LiveChatIcon from "../../assets/images/LiveChat.svg";
import FacebookIcon from "../../assets/images/facebook_messenger.svg";
import WhatsappIcon from "../../assets/images/whatsapp.svg";
import WeChatIcon from "../../assets/images/WeChat.svg";
import InstagramIcon from "../../assets/images/channels/Instagram.svg";
import LineIcon from "../../assets/images/line.svg";
import useCompanyChannels from "../Chat/hooks/useCompanyChannels";
import useFetchCompany from "../../api/Company/useFetchCompany";
import moment from "moment";
import uuid from "uuid";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { TFunction } from "i18next";
import getTextColor from "./helpers/getTextColor";
import { pick } from "ramda";
import { useFeaturesGuard } from "./hooks/useFeaturesGuard";
import { htmlEscape } from "../../lib/utility/htmlEscape";
import { PERMISSION_KEY } from "types/Rbac/permission";
import { usePermission } from "component/shared/usePermission";
import { useRequireRBAC } from "component/shared/useRequireRBAC";

const BusinessDay = (t: TFunction) => [
  {
    text: t("livechat.advanced.businessDays.everyDay"),
    value: JSON.stringify([1, 2, 3, 4, 5, 6, 7]),
  },
  {
    text: t("livechat.advanced.businessDays.weekdays"),
    value: JSON.stringify([1, 2, 3, 4, 5]),
  },
  {
    text: t("livechat.advanced.businessDays.weekends"),
    value: JSON.stringify([6, 7]),
  },
  {
    text: t("livechat.advanced.businessDays.monday"),
    value: JSON.stringify([1]),
  },
  {
    text: t("livechat.advanced.businessDays.tuesday"),
    value: JSON.stringify([2]),
  },
  {
    text: t("livechat.advanced.businessDays.wednesday"),
    value: JSON.stringify([3]),
  },
  {
    text: t("livechat.advanced.businessDays.thursday"),
    value: JSON.stringify([4]),
  },
  {
    text: t("livechat.advanced.businessDays.friday"),
    value: JSON.stringify([5]),
  },
  {
    text: t("livechat.advanced.businessDays.saturday"),
    value: JSON.stringify([6]),
  },
  {
    text: t("livechat.advanced.businessDays.sunday"),
    value: JSON.stringify([7]),
  },
];

const BusinessHours = [
  { text: "12:00 AM", value: "00:00" },
  { text: "12:30 AM", value: "00:30" },
  { text: "1:00 AM", value: "01:00" },
  { text: "1:30 AM", value: "01:30" },
  { text: "2:00 AM", value: "02:00" },
  { text: "2:30 AM", value: "02:30" },
  { text: "3:00 AM", value: "03:00" },
  { text: "3:30 AM", value: "03:30" },
  { text: "4:00 AM", value: "04:00" },
  { text: "4:30 AM", value: "04:30" },
  { text: "5:00 AM", value: "05:00" },
  { text: "5:30 AM", value: "05:30" },
  { text: "6:00 AM", value: "06:00" },
  { text: "6:30 AM", value: "06:30" },
  { text: "7:00 AM", value: "07:00" },
  { text: "7:30 AM", value: "07:30" },
  { text: "8:00 AM", value: "08:00" },
  { text: "8:30 AM", value: "08:30" },
  { text: "9:00 AM", value: "09:00" },
  { text: "9:30 AM", value: "09:30" },
  { text: "10:00 AM", value: "10:00" },
  { text: "10:30 AM", value: "10:30" },
  { text: "11:00 AM", value: "11:00" },
  { text: "11:30 AM", value: "11:30" },
  { text: "12:00 PM", value: "12:00" },
  { text: "12:30 PM", value: "12:30" },
  { text: "1:00 PM", value: "13:00" },
  { text: "1:30 PM", value: "13:30" },
  { text: "2:00 PM", value: "14:00" },
  { text: "2:30 PM", value: "14:30" },
  { text: "3:00 PM", value: "15:00" },
  { text: "3:30 PM", value: "15:30" },
  { text: "4:00 PM", value: "16:00" },
  { text: "4:30 PM", value: "16:30" },
  { text: "5:00 PM", value: "17:00" },
  { text: "5:30 PM", value: "17:30" },
  { text: "6:00 PM", value: "18:00" },
  { text: "6:30 PM", value: "18:30" },
  { text: "7:00 PM", value: "19:00" },
  { text: "7:30 PM", value: "19:30" },
  { text: "8:00 PM", value: "20:00" },
  { text: "8:30 PM", value: "20:30" },
  { text: "9:00 PM", value: "21:00" },
  { text: "9:30 PM", value: "21:30" },
  { text: "10:00 PM", value: "22:00" },
  { text: "10:30 PM", value: "22:30" },
  { text: "11:00 PM", value: "23:00" },
  { text: "11:30 PM", value: "23:30" },
  { text: "11:59 PM", value: "23:59" },
];

const DelayPopupContainer = styled.div`
  display: flex;
  align-items: center;

  > div:first-child {
    margin-right: 8px;
  }

  > div:last-child {
    margin-left: 8px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #ececec;
  margin: 21px 0px;
`;

const Label = styled.div`
  font-size: 14px;
  color: #3c4257;
  font-weight: 500;
`;

const StyledInput = styled(Form.Input)`
  > div.input {
    width: 100%;
    margin: 8px 0px;
  }
`;

const HelperText = styled.div`
  font-size: 13px;
  color: #9aa8bd;
  margin-bottom: 21px;
`;

const HeaderContainer = styled.div`
  font-size: 16px;
  font-weight: 500;
  height: 30px;
  display: flex;
  justify-content: space-between;

  > div:last-child {
    display: flex;
    align-items: center;
  }
`;

const CodeButton = styled.div`
  margin-right: 382px;

  > button {
    padding: 4px 12px !important;
    min-height: 30px !important;
    border: 0 !important;
    margin-left: 16px !important;
    background: #6078ff !important;
    color: white !important;
  }
`;

interface WidgetContainerProps {
  numOfActivatedChannels: number;
  isLivechatOn: boolean;
}

const WidgetContainer = styled.div<WidgetContainerProps>`
  width: 350px;
  height: ${(props: any) =>
    props.isLivechatOn && props.numOfActivatedChannels == 0
      ? "245px"
      : !props.isLivechatOn && props.numOfActivatedChannels > 0
      ? `${245 + (props.numOfActivatedChannels - 1) * 50}px`
      : `${400 + (props.numOfActivatedChannels - 1) * 50}px`};
  background: #fcfbfa;
  border-radius: 20px;
  margin-top: 14px;
`;

const ContactFormContainer = styled.div`
  width: 350px;
  background: #fcfbfa;
  border-radius: 20px;
  margin-top: 14px;
  padding-bottom: 21px;
`;

interface WidgetHeaderProps {
  background: String;
}

interface WidgetButtonColorProps {
  buttonColor: String;
  buttonTextColor?: string;
}

const WidgetHeader = styled.div<WidgetHeaderProps>`
  background: ${(props: any) =>
    props.background ? props.background : "#3c4257"};
  height: 150px;
  border-radius: 20px 20px 0px 0px;
`;

const ShortWidgerHeader = styled.div<WidgetHeaderProps>`
  background: ${(props: any) =>
    props.background ? props.background : "#3c4257"};
  height: 75px;
  border-radius: 20px 20px 0px 0px;
`;

const ContactFormBox = styled.div<WidgetButtonColorProps>`
  border-top: ${(props: any) =>
    props.buttonColor ? `3px solid ${props.buttonColor}` : "3px solid #6078ff"};
  margin: 0px 21px;
  background: white;
  border-radius: 10px;
  padding: 21px;

  > div:first-child {
    font-weight: 500;
    font-size: 16px;
    color: #3c4257;
  }

  > button {
    display: flex;
    justify-content: center;
    border-color: transparent !important;
    box-shadow: 0 0 0px 1px #ececec !important;

    > svg {
      height: 16px;
      width: 16px;
      transform: rotate(90deg);
      fill: ${(props: any) =>
        props.buttonTextColor
          ? `${props.buttonTextColor} !important`
          : "#ffffff !important"};
      margin-right: 6px;
    }

    border-radius: 20px !important;
    background: ${(props: any) =>
      props.buttonColor
        ? `${props.buttonColor} !important`
        : "#6078ff !important"};
    color: ${(props: any) =>
      props.buttonTextColor
        ? `${props.buttonTextColor} !important`
        : "#ffffff !important"};
    padding: 6px 16px !important;
    width: 100% !important;
    margin-top: 14px !important;
  }
`;

const WidgetSectionHeader = styled.div`
  font-size: 16px;
  color: #3c4257;
  font-weight: 500;
  margin-bottom: 7px;
  display: flex;

  > svg {
    width: 16px;
    margin-right: 16px;
    cursor: pointer;
  }
`;

const WidgetSectionHelperText = styled.div`
  font-size: 14px;
  color: #9aa8bd;
  font-weight: 500;
  line-height: 14px;
`;

interface StartChatProps extends WidgetButtonColorProps {
  isShow: boolean;
  buttonTextColor: string;
}

const StartChatContainer = styled.div<StartChatProps>`
  justify-content: center;
  display: ${(props: any) => (props.isShow ? "flex" : "none")};
  transition: all 0.2s ease-in-out;
  /* opacity: ${(props: any) => (props.isShow ? 1 : 0)}; */
  flex-direction: column;
  margin: 0px 21px;
  background: white;
  padding: 21px;
  margin-top: -78px;
  border-radius: 10px;
  border-top: ${(props: any) =>
    props.buttonColor ? `3px solid ${props.buttonColor}` : "3px solid #6078ff"};
  box-shadow: 0 4px 4px 0 #ececec;

  > button {
    display: flex;
    justify-content: center;
    box-shadow: 0 0 0px 1px #ececec !important;
    border: none !important;

    > svg {
      height: 16px;
      width: 16px;
      transform: rotate(90deg);
      fill: ${(props: any) =>
        props.buttonTextColor
          ? `${props.buttonTextColor} !important`
          : "#ffffff !important"};
      margin-right: 6px;
    }

    border-radius: 20px !important;
    background: ${(props: any) =>
      props.buttonColor
        ? `${props.buttonColor} !important`
        : "#6078ff !important"};
    color: ${(props: any) =>
      props.buttonTextColor
        ? `${props.buttonTextColor} !important`
        : "#ffffff !important"};
    padding: 6px 16px !important;
    width: 130px !important;
    margin-top: 14px !important;
  }
`;

const SaveChangesButton = styled.div`
  margin-top: 21px;

  > button {
    padding: 10px 16px !important;
    min-height: 30px !important;
    color: white !important;
    background: #6078ff !important;
    font-size: 13px !important;
    border-color: transparent !important;
  }
`;

interface ChannelsContainerProps extends WidgetButtonColorProps {
  isLivechatOn: boolean;
  isNoOtherChannel: boolean;
}

const ChannelsContainer = styled.div<ChannelsContainerProps>`
  justify-content: center;
  display: ${(props: any) => (props.isNoOtherChannel ? "none" : "flex")};
  flex-direction: column;
  margin: 21px;
  background: white;
  padding: 21px;
  border-radius: 10px;
  border-top: ${(props: any) =>
    props.buttonColor ? `3px solid ${props.buttonColor}` : "3px solid #6078ff"};
  box-shadow: 0 2px 4px 0 #ececec;
  margin-top: ${(props: any) => (props.isLivechatOn ? 21 : "-75px")};
`;

const WidgetHeaderText = styled.div`
  color: #3c4257;
  font-size: 16px;
  font-weight: 500;
`;

const ExpectReply = styled.span`
  color: #9aa8bd;
  font-size: 14px;
`;

const ReplyTimeText = styled.span`
  color: #3c4257;
  font-size: 14px;
`;

const WidgetItemContainer = styled.div`
  padding: 14px 21px;
  border: 1px solid #eaeaea;
  display: flex;
  justify-content: space-between;
  border-radius: 8px;
  margin-bottom: 14px;
  user-select: none;
`;

const LanguageContainer = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 16px;

  > div:first-child {
    margin-bottom: 2px;
    font-size: 14px;
    font-weight: 500;
    color: #3c4257;
  }

  > div:last-child {
    font-size: 14px;
    color: #9aa8bd;
  }
`;

const LanguageSwitchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AddChannelButton = styled.div`
  display: flex;
  justify-content: center;
  padding: 4px 20px;
  border-radius: 5px;
  border: 1px solid #eaeaea;
  cursor: pointer;
  font-size: 13px;
  color: #3c4257;
  font-weight: 500;
  user-select: none;

  :hover {
    box-shadow: 0 0px 4px 2px #ececec;
  }
`;

const CodeModalContainer = styled.div`
  padding: 21px;
`;

const CodeModalHeader = styled.div`
  color: #3c4257;
  font-size: 20px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 21px;

  > div:last-child {
    display: flex;
    border-radius: 5px;
    cursor: pointer;
    padding: 6px;

    :hover {
      background: #f1f1f1;
    }

    > svg {
      width: 24px;
    }
  }
`;

const CodeDescription = styled.div`
  font-size: 14px;
  color: #3c4257;
  margin-bottom: 21px;
  line-height: 21px;

  > button {
    padding: 0px 10px !important;
    color: #3c4257;
    margin-bottom: 16px !important;
    min-height: 36px !important;

    > svg {
      width: 20px;
      stroke: #3c4257;
      margin-right: 4px;
    }
  }
`;

const CodeTag = styled.span`
  background: #f1f1f1;
  padding: 2px 5px;
  border-radius: 5px;
`;

interface SetDefaultLanguageProps {
  isHoverItem: boolean;
}

const SetDefaultButton = styled.div<SetDefaultLanguageProps>`
  color: #6078ff;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  display: ${(props: any) => (props.isHoverItem ? "flex" : "none")};
  user-select: none;
`;

const CreatePopupButton = styled.div`
  > button {
    padding: 10px 16px !important;
    min-height: 30px !important;
    color: white !important;
    background: #6078ff !important;
    font-size: 13px !important;
    border-color: transparent !important;
  }
`;

const ColorInputContainer = styled.div`
  display: flex;

  > div {
    margin-right: 21px;
  }
`;

const PreviewCompanyPicContainer = styled.div`
  height: 78px;
  display: flex;
  align-items: center;
  margin-left: 21px;

  > img {
    height: 32px;
    max-width: 150px !important;
  }
`;

interface PreviewChannelProps {
  isShow: boolean;
}

const PreviewChannelContainer = styled.div<PreviewChannelProps>`
  display: ${(props) => (props.isShow ? "flex" : "none")};
  align-items: center;
  padding: 10px 16px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  margin-top: 8px;

  > div {
    display: flex;

    img {
      width: 20px;
      height: 20px;
    }
  }

  > div:last-child {
    color: #3c4257;
    font-size: 14px;
    font-weight: 500;
    margin-left: 16px;
  }
`;

const AddConditionButton = styled(Button)`
  padding: 10px 16px !important;
  min-height: 30px !important;
  color: #3c4256 !important;
  background: white !important;
  font-size: 13px !important;
  margin-bottom: 21px !important;
`;

const AddBusinessHoursButton = styled(Button)`
  padding: 10px 16px !important;
  min-height: 30px !important;
  color: #3c4256 !important;
  background: white !important;
  font-size: 13px !important;
  margin-top: 7px !important;
`;

const RefreshCompanyButton = styled(Button)`
  padding: 10px 16px !important;
  min-height: 30px !important;
  color: #3c4256 !important;
  background: white !important;
  font-size: 13px !important;
  margin-bottom: 0px !important;
`;

interface PopupIconProps {
  stroke?: string;
}

const PopupIconContainer = styled.div<PopupIconProps>`
  display: flex;
  cursor: pointer;
  margin-right: 16px;

  > svg {
    width: 20px;
    height: 20px;
    stroke: ${(props) => (props.stroke ? props.stroke : "#9aa8bd")};
  }
`;

const DeletePopupIconContainer = styled.div<PopupIconProps>`
  display: flex;
  cursor: pointer;
  width: 40px !important;
  margin-left: 16px;

  > svg {
    width: 20px;
    height: 20px;
    stroke: ${(props) => (props.stroke ? props.stroke : "#9aa8bd")};
  }
`;

const PopupConditionContainer = styled(GridRow)`
  display: flex;
  align-items: center;

  > div {
    width: 50%;
  }

  form {
    display: flex;
    align-items: center;

    > div {
      min-height: 41px !important;
      min-width: 46% !important;
      margin-right: 14px;
    }
  }
`;

const BusinessHoursListContainer = styled(GridRow)`
  display: flex;
  align-items: center;

  > div {
    width: 75%;
  }

  > div:last-child {
    width: 25%;
  }

  form {
    display: flex;
    align-items: center;
    max-width: 70% !important;

    > div {
      min-height: 41px !important;
      min-width: 46% !important;
      margin-right: 14px;
    }
  }
`;

const WidgetLanguageOptions = [
  {
    name: "English",
    value: "en-us",
  },
  {
    name: "繁體中文",
    value: "zh-hk",
  },
  {
    name: "简体中文",
    value: "zh-cn",
  },
  {
    name: "Español",
    value: "es-mx",
  },
  {
    name: "Bahasa Indonesian",
    value: "id",
  },
];

interface SettingWebsiteManagerType {
  tagline: string;
  welcomeMessage: string;
  autoReply: string;
  customLink: string[];
  liveChatTitle: string;
  pageTitle: string;
  socialConversationTitle: string;
  greeting: string;
}

interface SettingWebsiteManageProp {
  loadingCompany: boolean;
}

const CheckBoxContainer = styled.div`
  :not(:last-child) {
    margin-bottom: 8px;
  }
`;

interface ErrorTextProps {
  isShow: boolean;
}

const ErrorText = styled.div<ErrorTextProps>`
  color: #cc3333;
  font-weight: 500;
  font-size: 13px;
  display: ${(props) => (props.isShow ? "flex" : "none")};
  align-items: center;
  margin-right: 18px;
`;

const DeleteModalButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: 10px;
  margin-top: 30px;

  > button:last-child {
    margin: 0px !important;
    width: 100px;
    display: flex;
    justify-content: center;
  }

  > div {
    margin: 0px;
    margin-right: 16px;

    > button {
      width: 100px;
      display: flex;
      justify-content: center;
    }
  }
`;

const PreviewTabContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

interface PreviewTabProps {
  isActive: boolean;
  isDisabled?: boolean;
}

const PreviewTab = styled.div<PreviewTabProps>`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 4px 8px;
  user-select: none;
  font-weight: ${(props: any) => (props.isDisabled ? "400" : "500")};
  color: ${(props: any) => (props.isActive ? "#6078ff" : "#3c4257")};
  background: white;
  border: ${(props: any) =>
    props.isActive ? "1px solid #6078ff" : "1px solid #eaeaea"};
  cursor: pointer;

  :first-child {
    border-radius: 5px 0px 0px 5px;
  }

  :last-child {
    border-radius: 0px 5px 5px 0px;
  }

  cursor: ${(props: any) => (props.isDisabled ? "not-allowed" : "pointer")};
  color: ${(props: any) =>
    props.isDisabled ? "#9aa8bd" : props.isActive ? "#6078ff" : "#3c4257"};
`;
const OtherChannelsIconContainer = styled.div`
  display: flex;
  justify-content: center;

  > img {
    width: 20px;
    height: 20px;
    margin: 8px 3px;
  }
`;

const ChatScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  > div:first-child {
    height: 300px;
    background: #fcfbfa;
    padding: 21px;
  }

  > div:last-child {
    display: flex;
    background: white;
    border-radius: 0px 0px 20px 20px;
    padding: 20px 16px;
    color: #9aa8bd;
  }
`;

const ChatBubble = styled.div`
  background: #f0f2f5;
  color: #3c4257;
  padding: 14px;
  border-radius: 5px;
  max-width: 200px;
  margin-bottom: 21px;
`;

interface UserChatProps {
  background: string;
  bgTextColor: string;
}

const UserChatBubble = styled.div<UserChatProps>`
  background: ${(props: any) =>
    props.background ? props.background : "#3c4257"};
  color: ${(props: any) => (props.bgTextColor ? props.bgTextColor : "#ffffff")};
  padding: 14px;
  margin-left: auto;
  border-radius: 5px;
  max-width: 200px;
`;

export default (props: SettingWebsiteManageProp) => {
  useRequireRBAC([PERMISSION_KEY.channelView]);

  const { company } = useAppSelector(pick(["company"]));
  const { t } = useTranslation();
  const [websiteManagerInfo, setWebsiteManagerInfo] =
    useState<SettingWebsiteManagerType>({
      tagline: "",
      welcomeMessage: "",
      autoReply: "",
      customLink: [],
      pageTitle: t("onboarding.field.liveChat.pageTitle"),
      liveChatTitle: t("onboarding.field.liveChat.chatTitle"),
      socialConversationTitle: t("onboarding.field.liveChat.socialTitle"),
      greeting: t("onboarding.field.liveChat.greeting"),
    });
  const [liveChatSnippet, setLiveChatSnippet] = useState("");
  const [bgColor, setBgColor] = useState("rgba(48,80,140,1)");
  const [fontColor, setFontColor] = useState("rgba(255,255,255,1)");
  const [iconColor, setIconColor] = useState("rgba(48,80,140,1)");
  const [generalValues, setGeneralValues] = useState({
    widgetName: "",
    botName: "",
    widgetBgColor: "#3c4257",
    widgetButtonColor: "#6078ff",
    widgetBgTextColor: "#ffffff",
    widgetButtonTextColor: "#ffffff",
  });

  const initBusinessHours: any = [];

  const [advancedValues, setAdvancedValues] = useState({
    replyTime: "in-mins",
    isContactFormOn: false,
    isPhoneOptional: false,
    businessHoursCondition: initBusinessHours,
    isHideLivechatDuringOffhours: false,
    isContactFormOnDuringOffHours: false,
    isHidePowerBy: false,
    isEmailOptional: false,
  });
  const [languageValues, setLanguageValues] = useState({
    defaultLang: "en-us",
    activatedLang: ["en-us"],
  });
  const [popupValues, setPopupValues] = useState<any>([]);
  const [previewTab, setPreviewTab] = useState("start");
  // const [businessHoursCondition, setBusinessHoursCondition] = useState<any[]>([{
  //   "businessDay": JSON.stringify([1,2,3,4,5]),
  //   "startingBusinessHour": "9:00",
  //   "endingBusinessHour": "17:00"
  // }])
  interface Channel {
    isActivated: boolean;
    activatedChannel: any;
    channels: any[];
  }

  interface Channels {
    livechat: Channel;
    whatsapp: Channel;
    facebook: Channel;
    wechat: Channel;
    line: Channel;
    instagram: Channel;
  }

  const [channelValues, setChannelValues] = useState<Channels>({
    livechat: {
      isActivated: true,
      activatedChannel: { name: "" },
      channels: ["livechat"],
    },
    whatsapp: {
      isActivated: false,
      activatedChannel: { name: "" },
      channels: [],
    },
    facebook: {
      isActivated: false,
      activatedChannel: { name: "" },
      channels: [],
    },
    wechat: {
      isActivated: false,
      activatedChannel: { name: "" },
      channels: [],
    },
    line: {
      isActivated: false,
      activatedChannel: { name: "" },
      channels: [],
    },
    instagram: {
      isActivated: false,
      activatedChannel: { name: "" },
      channels: [],
    },
  });

  interface ChannelOption {
    channels: any[];
  }

  interface ChannelOptions {
    livechat?: ChannelOption;
    whatsapp: ChannelOption;
    facebook: ChannelOption;
    wechat: ChannelOption;
    line: ChannelOption;
    instagram: ChannelOption;
  }

  const [allChannels, setAllChannels] = useState<ChannelOptions>({
    livechat: {
      channels: ["livechat"],
    },
    whatsapp: {
      channels: [],
    },
    facebook: {
      channels: [],
    },
    wechat: {
      channels: [],
    },
    line: {
      channels: [],
    },
    instagram: {
      channels: [],
    },
  });

  const loginDispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [updated, isUpdated] = useState<string[]>([]);
  const flash = useFlashMessageChannel();
  const [defaultLanguage, setDefaultLanguage] = useState("en-us");
  const [hoverLanguage, setHoverLanguage] = useState("");
  const companyChannels = useCompanyChannels();
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [whatsappMenuOpen, setWhatsappMenuOpen] = useState(false);
  const [facebookMenuOpen, setFacebookMenuOpen] = useState(false);
  const [instagramMenuOpen, setInstagramMenuOpen] = useState(false);
  const [companyPicUrl, setCompanyPicUrl] = useState("");
  const [isCreatePopup, setIsCreatePopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<any>({});
  const [enableChannelError, setEnableChannelError] = useState<any>("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleteConditionModalOpen, setDeleteConditionModalOpen] =
    useState(false);
  const [currentConditionIndex, setCurrentConditionIndex] = useState(0);
  const [emptyPopupError, setEmptyPopupError] = useState(false);

  const featureGuard = useFeaturesGuard();
  const { check } = usePermission();
  const [canEditChannels, canConnectChannels] = useMemo(
    () => check([PERMISSION_KEY.channelEdit, PERMISSION_KEY.channelConnect]),
    [check]
  );

  interface PopupCondition {
    display: string;
    condition: string;
    url: string;
  }

  interface PopupMessage {
    name: string;
    conditions: PopupCondition[];
    message: string;
    isActivated: boolean;
    delaySecond: string;
  }

  const [contactFormEnabled, setContactFormEnabled] = useState(false);

  const [popupInput, setPopupInput] = useState<PopupMessage>({
    name: "",
    conditions: [],
    message: "",
    isActivated: false,
    delaySecond: "0",
  });

  const resetPopupInput = () => {
    setPopupInput({
      name: "",
      conditions: [],
      message: "",
      isActivated: false,
      delaySecond: "0",
    });
    setCurrentPopup({});
    setEmptyPopupError(false);
  };

  const replyTimeOptions = [
    { name: t("livechat.advanced.in-mins"), value: "in-mins" },
    { name: t("livechat.advanced.in-hours"), value: "in-hours" },
    { name: t("livechat.advanced.in-day"), value: "in-day" },
  ];

  const DUMMY_CHANNEL = { name: "" };

  const ChannelOptions = [
    {
      key: "livechat",
      name: t("livechat.channels.livechat"),
      img: LiveChatIcon,
      channels: ["livechat"],
      isActivated: channelValues.livechat.isActivated,
    },
    {
      key: "whatsapp",
      name: "WhatsApp",
      img: WhatsappIcon,
      channels: allChannels.whatsapp.channels,
      isActivated: channelValues.whatsapp.isActivated,
      isOpen: whatsappMenuOpen,
      setOpen: setWhatsappMenuOpen,
      canSelect: true,
      activatedChannel:
        allChannels.whatsapp.channels.length > 0
          ? allChannels.whatsapp.channels.find(
              (c) => c.name == channelValues.whatsapp.activatedChannel.name
            )
            ? channelValues.whatsapp.activatedChannel
            : allChannels.whatsapp.channels[0]
          : DUMMY_CHANNEL,
    },
    {
      key: "instagram",
      name: "Instagram",
      img: InstagramIcon,
      channels: allChannels.instagram.channels,
      isActivated: channelValues.instagram?.isActivated,
      isOpen: instagramMenuOpen,
      setOpen: setInstagramMenuOpen,
      canSelect: true,
      activatedChannel:
        allChannels.instagram && allChannels.instagram.channels.length > 0
          ? allChannels.instagram.channels.find(
              (c) => c.name == channelValues.instagram?.activatedChannel.name
            )
            ? channelValues.instagram?.activatedChannel
            : allChannels.instagram?.channels[0]
          : DUMMY_CHANNEL,
    },
    {
      key: "facebook",
      name: "Facebook Messenger",
      img: FacebookIcon,
      channels: allChannels.facebook.channels,
      isActivated: channelValues.facebook.isActivated,
      isOpen: facebookMenuOpen,
      setOpen: setFacebookMenuOpen,
      canSelect: true,
      activatedChannel:
        allChannels.facebook.channels.length > 0
          ? allChannels.facebook.channels.find(
              (c) => c.name == channelValues.facebook.activatedChannel.name
            )
            ? channelValues.facebook.activatedChannel
            : allChannels.facebook.channels[0]
          : DUMMY_CHANNEL,
      isFacebook: true,
    },
    {
      key: "wechat",
      name: "WeChat",
      img: WeChatIcon,
      channels:
        allChannels.wechat.channels.length > 0
          ? allChannels.wechat.channels
          : [],
      isActivated: channelValues.wechat.isActivated,
      activatedChannel:
        allChannels.wechat.channels.length > 0
          ? allChannels.wechat.channels.find(
              (c) => c.name == channelValues.wechat.activatedChannel.name
            )
            ? channelValues.wechat.activatedChannel
            : allChannels.wechat.channels[0]
          : [],
    },
    {
      key: "line",
      name: "Line",
      img: LineIcon,
      channels:
        allChannels.line.channels.length > 0 ? allChannels.line.channels : [],
      isActivated: channelValues.line.isActivated,
      activatedChannel:
        allChannels.line.channels.length > 0
          ? allChannels.line.channels.find(
              (c) => c.name == channelValues.line.activatedChannel.name
            )
            ? channelValues.line.activatedChannel
            : allChannels.line.channels[0]
          : [],
    },
  ];

  const mapCompanyChannelsOption = () => {
    let whatsappChannels = [];
    let facebookChannels = [];
    let wechatChannel = [];
    let lineChannel = [];
    let instagramChannels = [];
    const companyChannelsClone = [...companyChannels];

    if (companyChannels.length > 0) {
      const officialWechat = companyChannelsClone.find((channel) => {
        return channel.type === "wechat";
      });
      const officialLine = companyChannelsClone.find((channel) => {
        return channel.type === "line";
      });
      if (officialWechat?.configs && officialWechat.configs?.length > 0) {
        wechatChannel.push(officialWechat.configs[0]);
      }
      if (officialLine?.configs && officialLine.configs?.length > 0) {
        lineChannel.push(officialLine.configs[0]);
      }
      const officialWhatsapp = companyChannelsClone.filter((channel) => {
        return channel.type === "twilio_whatsapp";
      });
      const unofficialWhatsapp = companyChannelsClone.filter((channel) => {
        return channel.type === "whatsapp";
      });
      const facebook = companyChannelsClone.filter((channel) => {
        return channel.type === "facebook";
      });

      const instagram = companyChannelsClone.filter((channel) => {
        return channel.type === "instagram";
      });
      const whatsappCloudAPI = companyChannelsClone.filter((channel) => {
        return channel.type === "whatsappcloudapi";
      });

      const whatsapp360Dialog = companyChannelsClone.filter((channel) => {
        return channel.type === "whatsapp360dialog";
      });

      if (whatsapp360Dialog.length > 0 && whatsapp360Dialog[0].configs) {
        const formatted360DialogWhatsappOptions =
          whatsapp360Dialog[0].configs.map((wa) => ({
            ...wa,
            name: wa.channelName,
            text: wa.channelName,
            value: wa.whatsAppPhoneNumber,
            key: wa.whatsAppPhoneNumber,
            type: "whatsapp",
          }));
        whatsappChannels.push(...formatted360DialogWhatsappOptions);
      }

      if (officialWhatsapp.length > 0 && officialWhatsapp[0].configs) {
        const formattedOfficialWhatsappOptions =
          officialWhatsapp[0].configs.map((wa) => {
            return {
              ...wa,
              text: wa.name,
              value: wa.whatsAppSender,
              key: wa.whatsAppSender,
              type: "whatsapp",
            };
          });
        whatsappChannels.push(...formattedOfficialWhatsappOptions);
      }
      if (whatsappCloudAPI.length > 0 && whatsappCloudAPI[0].configs) {
        const formattedCloudAPIWhatsappOptions =
          whatsappCloudAPI[0].configs.map((wa) => {
            return {
              ...wa,
              name: wa.channelName,
              text: wa.channelName,
              value: wa.whatsappPhoneNumber,
              key: wa.whatsappPhoneNumber,
              type: "whatsapp",
            };
          });
        whatsappChannels.push(...formattedCloudAPIWhatsappOptions);
      }
      if (unofficialWhatsapp.length > 0 && unofficialWhatsapp[0].configs) {
        const formattedUnfficialWhatsappOptions =
          unofficialWhatsapp[0].configs.map((wa) => {
            return {
              ...wa,
              text: wa.name,
              value: wa.whatsAppSender,
              key: wa.whatsAppSender,
              type: "whatsapp",
            };
          });
        whatsappChannels.push(...formattedUnfficialWhatsappOptions);
      }

      if (facebook.length > 0 && facebook[0].configs) {
        const formattedFacebookOptions = facebook[0].configs
          .filter((fb) => fb.status !== "Invalid")
          .map((fb) => {
            return {
              ...fb,
              text: fb.pageName,
              value: fb.pageId,
              key: fb.pageId,
              type: "facebook",
            };
          });
        facebookChannels.push(...formattedFacebookOptions);
      }

      if (instagram.length > 0 && instagram[0].configs) {
        const formattedInstagramOptions = instagram[0].configs
          .filter((ig) => ig.status !== "Invalid")
          .map((ig) => {
            return {
              ...ig,
              text: ig.name,
              value: ig.instagramPageId,
              key: ig.instagramPageId,
              type: "instagram",
            };
          });
        instagramChannels.push(...formattedInstagramOptions);
      }
    }
    setAllChannels({
      ...allChannels,
      whatsapp: {
        channels: whatsappChannels,
      },
      facebook: {
        channels: facebookChannels,
      },
      wechat: {
        channels: wechatChannel,
      },
      line: {
        channels: lineChannel,
      },
      instagram: {
        channels: instagramChannels,
      },
    });
  };

  useEffect(() => {
    mapCompanyChannelsOption();
  }, [JSON.stringify(company)]);
  const userWorkspaceLocation = useAppSelector((s) => s.userWorkspaceLocation);
  useEffect(() => {
    const customFieldList = [
      { name: "general", action: setGeneralValues },
      { name: "advanced", action: setAdvancedValues },
      { name: "languages", action: setLanguageValues },
      { name: "popup", action: setPopupValues },
      { name: "channels", action: setChannelValues, value: channelValues },
    ];
    if (company?.id) {
      const livechatCustomFields = company.companyCustomFields.filter(
        (field) => field.category === "LiveChat"
      );
      const livechatSettings = livechatCustomFields.filter((field) =>
        customFieldList.map((f) => f.name).includes(field.fieldName)
      );
      customFieldList.map((customField) => {
        const fieldObj = livechatSettings.find(
          (field) => field.fieldName === customField.name
        );
        if (fieldObj) {
          const apiValue = JSON.parse(fieldObj.value);
          if (fieldObj.value) {
            customField.action({
              ...customField.value,
              ...apiValue,
            });
          }
          customField.action(apiValue);
        }
      });
      const generalField = livechatCustomFields.find(
        (field) => field.fieldName === "general"
      );

      if (generalField) {
        const generalFieldValues = JSON.parse(generalField.value);
        if (generalFieldValues) {
          setGeneralValues({
            ...generalFieldValues,
            botName: generalFieldValues.botName || company?.companyName,
            widgetName:
              generalFieldValues.widgetName || `${company?.companyName} Widget`,
          });
        }
      } else {
        setGeneralValues({
          ...generalValues,
          botName: generalValues.botName || company?.companyName,
          widgetName:
            generalValues.widgetName || `${company?.companyName} Widget`,
        });
      }
      const advancedField = livechatCustomFields.find(
        (field) => field.fieldName === "advanced"
      );
      if (advancedField) {
        const advancedFieldValues = JSON.parse(advancedField.value);

        if (advancedFieldValues) {
          if (
            advancedFieldValues.isContactFormOn ||
            advancedFieldValues.isContactFormOnDuringOffHours
          ) {
            setContactFormEnabled(true);
          }
          setAdvancedValues({
            ...advancedFieldValues,
            businessHoursCondition:
              advancedFieldValues.businessHoursCondition || initBusinessHours,
          });
        }
      }
    }

    if (company?.id) {
      setLiveChatSnippet(`<!-- Start of SleekFlow Embed Code -->
        <script src="https://chat.sleekflow.io/embed_iframe.js" 
          data-id="travischatwidget"
          data-companyid="${company.id}"
          data-location="${userWorkspaceLocation}"
          type="text/javascript">
        </script>
<!-- End of SleekFlow Embed Code -->
      `);
    }
  }, [company?.id]);

  const handleChannelToggle = (channel: any) => {
    if (
      ChannelOptions.filter((c) => c.isActivated).length <= 1 &&
      channelValues[`${channel}`]?.isActivated == true
    ) {
      if (channel === "livechat") {
        setEnableChannelError(channel);
        return;
      } else {
        let newActivatedChannel = { name: "" };
        const isSetDefaultChannel = [
          "whatsapp",
          "facebook",
          "line",
          "wechat",
          "instagram",
        ].includes(channel);
        if (isSetDefaultChannel) {
          newActivatedChannel = ChannelOptions.find(
            (c) => c.key === channel
          )?.activatedChannel;
        }
        setChannelValues({
          ...channelValues,
          livechat: {
            ...channelValues.livechat,
            isActivated: !channelValues.livechat.isActivated,
          },
          [channel]: {
            ...channelValues[`${channel}`],
            isActivated: !channelValues[`${channel}`].isActivated,
            activatedChannel: isSetDefaultChannel
              ? newActivatedChannel
              : channelValues[`${channel}`].activatedChannel,
          },
        });
      }
      setEnableChannelError("");
      return;
    } else {
      setEnableChannelError("");
      let newActivatedChannel = { name: "" };
      const isSetDefaultChannel = [
        "whatsapp",
        "facebook",
        "line",
        "wechat",
        "instagram",
      ].includes(channel);
      if (isSetDefaultChannel) {
        newActivatedChannel = ChannelOptions.find(
          (c) => c.key == channel
        )?.activatedChannel;
      }

      setChannelValues({
        ...channelValues,
        [channel]: {
          ...channelValues[`${channel}`],
          isActivated: !channelValues[`${channel}`]?.isActivated,
          activatedChannel: isSetDefaultChannel
            ? newActivatedChannel
            : channelValues[`${channel}`]?.activatedChannel,
        },
      });
    }
  };

  const [numOfActivatedChannels, setNumOfActivatedChannels] = useState(0);

  useEffect(() => {
    const { whatsapp, facebook, wechat, line, instagram } = channelValues;
    const channels = [whatsapp, facebook, wechat, line, instagram];
    const activatedChannels = channels.reduce(
      (num, channel) => (channel?.isActivated ? num + 1 : num + 0),
      0
    );
    setNumOfActivatedChannels(activatedChannels);
  }, [channelValues]);

  const handleChannelSelect = (channel: any, options: any) => {
    if (options.length > 0) {
      if (options[0].type === "instagram") {
        const instagram = options.find((o: any) => o.value === channel);
        setChannelValues({
          ...channelValues,
          instagram: {
            ...channelValues.instagram,
            activatedChannel: instagram,
          },
        });
      }
      if (options[0].type === "facebook") {
        const facebook = options.find((o: any) => o.value === channel);
        setChannelValues({
          ...channelValues,
          facebook: {
            ...channelValues.facebook,
            activatedChannel: facebook,
          },
        });
      }
      if (options[0].type === "whatsapp") {
        const whatsapp = options.find((o: any) => o.value === channel);
        setChannelValues({
          ...channelValues,
          whatsapp: {
            ...channelValues.whatsapp,
            activatedChannel: whatsapp,
          },
        });
      }
    }
  };

  const formatValuesToParams = (ValObj: object, customFieldName: string) => {
    return {
      category: "LiveChat",
      type: "SingleLineText",
      fieldName: customFieldName,
      value: JSON.stringify(ValObj),
    };
  };

  const handleUpdateCustomField = async (
    fieldValues: object,
    field: string
  ) => {
    setIsLoading(true);
    let formattedParams = formatValuesToParams(fieldValues, field);
    if (field == "channels") {
      const formattedValues = {
        ...channelValues,
        facebook: {
          ...channelValues.facebook,
          isActivated: channelValues.facebook.activatedChannel.pageName
            ? channelValues.facebook.isActivated
            : false,
          activatedChannel: ChannelOptions.find((c) => c.key == "facebook")
            ?.activatedChannel,
        },
        whatsapp: {
          ...channelValues.whatsapp,
          isActivated: channelValues.whatsapp.activatedChannel.name
            ? channelValues.whatsapp.isActivated
            : false,
          activatedChannel: ChannelOptions.find((c) => c.key == "whatsapp")
            ?.activatedChannel,
        },
        instagram: {
          ...channelValues.instagram,
          isActivated: channelValues.instagram?.activatedChannel?.name
            ? channelValues.instagram?.isActivated
            : false,
          activatedChannel: ChannelOptions.find((c) => c.key == "instagram")
            ?.activatedChannel,
        },
      };

      formattedParams = formatValuesToParams(formattedValues, field);
    }
    if (field == "advanced") {
      if (!checkBusinessHour()) {
        flash(t("livechat.advanced.businessHourError"));
        setIsLoading(false);
        return;
      }
    }

    try {
      const companyUpdated = await post(POST_COMPANY_FIELD, {
        param: [formattedParams],
      });
      loginDispatch({ type: "UPDATE_COMPANY_INFO", company: companyUpdated });
      flash(t("livechat.toastSuccess"));
      handleRefreshCompany();
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [fieldStatusTracking, setFieldStatusTracking] = useState({
    blogURLs: {
      originalValue: "",
    },
    welcomeMessage: {
      originalValue: "",
    },
    tagLine: {
      originalValue: "",
    },
    autoReply: {
      originalValue: "",
    },
    companyBackgroundColor: {
      originalValue: "",
    },
    companyFontColor: {
      originalValue: "",
    },
    pageTitle: {
      originalValue: "",
    },
    liveChatTitle: {
      originalValue: "",
    },
    socialConversationTitle: {
      originalValue: "",
    },
    liveChatGreeting: {
      originalValue: "",
    },
    liveChatIconColor: {
      originalValue: "",
    },
  });

  const popUpDisplayOptions = [
    { text: t("livechat.popup.show"), value: "show" },
    { text: t("livechat.popup.hide"), value: "hide" },
  ];

  const popUpConditionOptions = [
    { text: t("livechat.popup.contains"), value: "contains" },
    { text: t("livechat.popup.exactMatch"), value: "exact" },
  ];

  const addNewPopupCondition = () => {
    const listToUpdate = [...popupInput.conditions];
    listToUpdate.push({
      display: "show",
      condition: "contains",
      url: "",
    });
    setPopupInput({
      ...popupInput,
      conditions: listToUpdate,
    });
  };

  const addNewBusinessHour = () => {
    const newBusinessHours = [...advancedValues.businessHoursCondition];
    newBusinessHours.push({
      businessDay: JSON.stringify([1, 2, 3, 4, 5]),
      startingBusinessHour: "9:00",
      endingBusinessHour: "17:00",
    });
    setAdvancedValues({
      ...advancedValues,
      businessHoursCondition: newBusinessHours,
    });
  };

  const deleteBusinessHour = (index: number) => {
    const newBusinessHours = [...advancedValues.businessHoursCondition];
    newBusinessHours.splice(index, 1);
    setAdvancedValues({
      ...advancedValues,
      businessHoursCondition: newBusinessHours,
    });
  };

  const checkBusinessHour = () => {
    let isValid = true;
    advancedValues.businessHoursCondition.forEach((bh: any) => {
      if (
        !bh.businessDay ||
        !bh.startingBusinessHour ||
        !bh.endingBusinessHour
      ) {
        isValid = false;
      }
    });
    return isValid;
  };

  const { refreshCompany } = useFetchCompany();
  const handleRefreshCompany = async () => {
    setIsLoading(true);
    refreshCompany();
    setIsLoading(false);
  };

  const handleUpdatePopup = (isActivated: boolean) => {
    if (!popupInput.name) {
      setEmptyPopupError(true);
      return;
    }
    const formattedConditions = popupInput.conditions.filter((c) => c.url);

    setPopupInput({
      ...popupInput,
      conditions: formattedConditions,
    });

    let newPopupValues: any[] = [];
    if (!currentPopup.name) {
      newPopupValues = [
        ...popupValues,
        {
          ...popupInput,
          conditions: formattedConditions,
          isActivated,
          lastEditTime: moment(),
          id: uuid(),
        },
      ];
    } else {
      const popupValuesToUpdate = [...popupValues];
      newPopupValues = popupValuesToUpdate.map((popup) => {
        if (popup.id == currentPopup.id) {
          const edittedPopup = {
            ...popupInput,
            conditions: formattedConditions,
            isActivated,
            lastEditTime: moment(),
            id: currentPopup.id,
          };
          return edittedPopup;
        }
        return popup;
      });
    }
    handleUpdateCustomField(newPopupValues, "popup");
  };

  const handleDeletePopup = async () => {
    const popupList = [...popupValues];
    const newPopupValues = popupList.filter(
      (popup: any) => popup.id !== currentPopup.id
    );
    await handleUpdateCustomField(newPopupValues, "popup");
    setDeleteModalOpen(false);
  };

  const handleTogglePopup = (popup: any) => {
    const popupList = [...popupValues];
    const newPopupValues = popupList.map((p) => {
      if (p.id == popup.id) {
        p.isActivated = !p.isActivated;
      }
      return p;
    });
    handleUpdateCustomField(newPopupValues, "popup");
  };

  const handleEditPopup = (popup: any) => {
    setPopupInput(popup);
    setCurrentPopup(popup);
    setIsCreatePopup(true);
  };

  const WidgetPreview = () => {
    return (
      <div>
        <PreviewTabContainer>
          <PreviewTab
            isActive={previewTab == "start"}
            onClick={() => setPreviewTab("start")}
          >
            {t("livechat.startScreen")}
          </PreviewTab>
          <PreviewTab
            isActive={previewTab == "contactForm"}
            onClick={() => setPreviewTab("contactForm")}
          >
            {t("livechat.contactForm")}
          </PreviewTab>
          <PreviewTab
            isActive={previewTab == "chat"}
            onClick={() => setPreviewTab("chat")}
          >
            {t("livechat.chatScreen")}
          </PreviewTab>
        </PreviewTabContainer>
        {previewTab === "start" ? (
          <WidgetContainer
            numOfActivatedChannels={numOfActivatedChannels}
            isLivechatOn={channelValues.livechat.isActivated}
          >
            <WidgetHeader background={generalValues.widgetBgColor}>
              <PreviewCompanyPicContainer>
                <Image src={companyPicUrl} alt="" />
              </PreviewCompanyPicContainer>
            </WidgetHeader>
            <StartChatContainer
              buttonColor={generalValues.widgetButtonColor}
              buttonTextColor={getTextColor(generalValues.widgetButtonColor)}
              isShow={channelValues.livechat.isActivated}
            >
              <WidgetHeaderText>
                {t("livechat.home.startConvo")}
              </WidgetHeaderText>
              <div>
                <ExpectReply>
                  {t("livechat.home.expectReply")}&nbsp;
                </ExpectReply>
                <ReplyTimeText>
                  {t(`livechat.advanced.${advancedValues.replyTime}`)}
                </ReplyTimeText>
              </div>
              <Button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                {t("livechat.home.startChat")}
              </Button>
            </StartChatContainer>
            <ChannelsContainer
              buttonColor={generalValues.widgetButtonColor}
              isLivechatOn={channelValues.livechat.isActivated}
              isNoOtherChannel={numOfActivatedChannels == 0}
            >
              <WidgetHeaderText style={{ marginBottom: 8 }}>
                {t("livechat.home.chatOnFavoriteChannel")}
              </WidgetHeaderText>
              {ChannelOptions.filter((o) => o.key !== "livechat").map(
                (channel) => (
                  <PreviewChannelContainer
                    isShow={channelValues[`${channel.key}`]?.isActivated}
                  >
                    <div>
                      <img src={channel.img} alt=""></img>
                    </div>
                    <div>{channel.name}</div>
                  </PreviewChannelContainer>
                )
              )}
            </ChannelsContainer>
          </WidgetContainer>
        ) : (
          ""
        )}
        {previewTab === "contactForm" ? (
          <ContactFormContainer>
            <ShortWidgerHeader background={generalValues.widgetBgColor}>
              <PreviewCompanyPicContainer>
                <Image src={companyPicUrl} alt="" />
              </PreviewCompanyPicContainer>
            </ShortWidgerHeader>
            <div style={{ fontWeight: 500, color: "#3c4257", padding: 21 }}>
              {t("livechat.infoPrompt.intro")}
            </div>
            <ContactFormBox
              buttonColor={generalValues.widgetButtonColor}
              buttonTextColor={getTextColor(generalValues.widgetButtonColor)}
            >
              <div style={{ marginBottom: 16 }}>
                {t("livechat.infoPrompt.basicInfo")}
              </div>
              <StyledInput placeholder={t("livechat.infoPrompt.name")} />
              <StyledInput placeholder={t("livechat.infoPrompt.email")} />
              <StyledInput placeholder={t("livechat.infoPrompt.phone")} />
              <Button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                {t("livechat.home.startChat")}
              </Button>
            </ContactFormBox>
            <div
              style={{
                color: "#9aa8bd",
                fontSize: 14,
                display: "flex",
                justifyContent: "center",
                marginTop: 21,
              }}
            >
              {t("livechat.infoPrompt.orLeaveMessageOn")}
            </div>
            <OtherChannelsIconContainer>
              {ChannelOptions.filter((c) => c.key !== "livechat")
                .filter((c) => c.isActivated)
                .map((channel) => (
                  <img src={channel.img} alt={htmlEscape(channel.name)} />
                ))}
            </OtherChannelsIconContainer>
          </ContactFormContainer>
        ) : (
          ""
        )}
        {previewTab === "chat" ? (
          <ContactFormContainer style={{ paddingBottom: 0 }}>
            <ShortWidgerHeader background={generalValues.widgetBgColor}>
              <PreviewCompanyPicContainer>
                <Image src={companyPicUrl} alt="" />
              </PreviewCompanyPicContainer>
            </ShortWidgerHeader>
            <ChatScreenContainer>
              <div>
                <ChatBubble>
                  Welcome to SleekFlow 👋 , How can I help you today?
                </ChatBubble>
                <UserChatBubble
                  background={generalValues.widgetBgColor}
                  bgTextColor={getTextColor(generalValues.widgetBgColor)}
                >
                  May I know how chatbot works in SleekFlow?
                </UserChatBubble>
              </div>
              <div>
                <div>{t("livechat.typeMessage")}</div>
              </div>
            </ChatScreenContainer>
          </ContactFormContainer>
        ) : (
          ""
        )}
      </div>
    );
  };
  const panes = [
    {
      menuItem: t("livechat.general.title"),
      render: () => (
        <Tab.Pane attached={false} key="general">
          <div>
            <Label>{t("livechat.general.widgetName")}</Label>
            <HelperText style={{ marginBottom: 0 }}>
              {t("livechat.general.widgetNameDescription")}
            </HelperText>
            <StyledInput
              disabled={!canEditChannels}
              placeholder={t("livechat.general.widgetNamePlaceholder")}
              value={generalValues.widgetName}
              onChange={(e: any) =>
                setGeneralValues({
                  ...generalValues,
                  widgetName: e.target.value,
                })
              }
            />
            <Label style={{ marginTop: 16 }}>
              {t("livechat.general.chatBotName")}
            </Label>
            <HelperText style={{ marginBottom: 0 }}>
              {t("livechat.general.chatBotNameDescription")}
            </HelperText>
            <StyledInput
              disabled={!canEditChannels}
              placeholder={t("livechat.general.chatBotNamePlaceholder")}
              value={generalValues.botName}
              onChange={(e: any) =>
                setGeneralValues({ ...generalValues, botName: e.target.value })
              }
            />
            <Label style={{ marginTop: 16, marginBottom: 8 }}>
              {t("livechat.general.headerLogo")}
            </Label>
            <div className="livechat-pic-settings">
              <SettingProfilePic
                userName={company && company.companyName}
                staffId={(company && company.id) || ""}
                profilePicId={
                  (company &&
                    company.companyIconFile &&
                    company.companyIconFile.profilePictureId) ||
                  ""
                }
                type={"company"}
                updatePicUrl={setCompanyPicUrl}
              />
            </div>
            <ColorInputContainer>
              <div>
                <Label>{t("livechat.general.bgColor")}</Label>
                <TrackingCodeColour
                  disabled={!canEditChannels}
                  colorPos={"bg"}
                  setPropsColor={(color: any) =>
                    setGeneralValues({ ...generalValues, widgetBgColor: color })
                  }
                  currentColor={generalValues.widgetBgColor}
                />
              </div>
              <div>
                <Label>{t("livechat.general.buttonColor")}</Label>
                <TrackingCodeColour
                  disabled={!canEditChannels}
                  colorPos={"button"}
                  setPropsColor={(color: any) =>
                    setGeneralValues({
                      ...generalValues,
                      widgetButtonColor: color,
                    })
                  }
                  currentColor={generalValues.widgetButtonColor}
                />
              </div>
            </ColorInputContainer>
            <SaveChangesButton>
              {canEditChannels && (
                <Button
                  onClick={() =>
                    handleUpdateCustomField(generalValues, "general")
                  }
                  loading={isLoading}
                >
                  {t("livechat.saveChanges")}
                </Button>
              )}
            </SaveChangesButton>
          </div>
          <div>
            <Label>{t("livechat.preview")}</Label>
            <WidgetPreview />
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("livechat.advanced.title"),
      render: () => (
        <Tab.Pane attached={false} key="advanced">
          <div>
            <WidgetSectionHeader>
              {t("livechat.advanced.title")}
            </WidgetSectionHeader>
            <WidgetSectionHelperText style={{ marginBottom: 21 }}>
              {t("livechat.advanced.advancedDescription")}
            </WidgetSectionHelperText>
            <Label>{t("livechat.advanced.shareReplyTime")}</Label>
            <HelperText>
              {t("livechat.advanced.shareReplyTimeDescription")}
            </HelperText>
            {replyTimeOptions.map((o) => (
              <CheckBoxContainer>
                <Checkbox
                  key={o.name}
                  label={o.name}
                  checked={o.value === advancedValues.replyTime}
                  disabled={!canEditChannels}
                  onChange={() => {
                    if (o.value === advancedValues.replyTime) {
                      setAdvancedValues({
                        ...advancedValues,
                        replyTime: "",
                      });
                    } else {
                      setAdvancedValues({
                        ...advancedValues,
                        replyTime: o.value,
                      });
                    }
                  }}
                />
              </CheckBoxContainer>
            ))}
            <Divider />
            <Label>{t("livechat.advanced.businessHours")}</Label>
            <HelperText style={{ marginBottom: "0px" }}>
              {t("livechat.advanced.businessHoursDescription")}
            </HelperText>
            {company?.timeZoneInfo?.displayName && (
              <HelperText
                style={{
                  textDecoration: "underline",
                  cursor: "pointer",
                  width: "fit-content",
                }}
                onClick={() => window.open("/settings/generalinfo", "_blank")}
              >
                {t("livechat.advanced.currentTimezone", {
                  timezone: company?.timeZoneInfo?.displayName,
                })}
              </HelperText>
            )}
            {advancedValues.businessHoursCondition?.map(
              (bh: any, index: number) => (
                <BusinessHoursListContainer style={{ marginBottom: 14 }}>
                  <div>
                    <Form>
                      <Dropdown
                        disabled={!canEditChannels}
                        options={BusinessDay(t)}
                        value={bh.businessDay}
                        selection
                        closeOnBlur
                        upward={false}
                        onChange={(_, data) => {
                          const businessHoursToUpdate = [
                            ...advancedValues.businessHoursCondition,
                          ];
                          businessHoursToUpdate[index]["businessDay"] =
                            data.value as string;
                          setAdvancedValues({
                            ...advancedValues,
                            businessHoursCondition: businessHoursToUpdate,
                          });
                        }}
                      />
                      <Dropdown
                        disabled={!canEditChannels}
                        options={[...BusinessHours].splice(
                          0,
                          BusinessHours.length - 1
                        )}
                        value={bh.startingBusinessHour}
                        selection
                        closeOnBlur
                        upward={false}
                        onChange={(_, data) => {
                          const businessHoursToUpdate = [
                            ...advancedValues.businessHoursCondition,
                          ];
                          businessHoursToUpdate[index]["startingBusinessHour"] =
                            data.value as string;
                          const availableEndingHours = [...BusinessHours]
                            .splice(
                              BusinessHours.findIndex(
                                (b) => b.value == data.value
                              ) + 1
                            )
                            .map((bh) => bh.value);
                          if (
                            availableEndingHours.includes(bh.endingBusinessHour)
                          ) {
                            setAdvancedValues({
                              ...advancedValues,
                              businessHoursCondition: businessHoursToUpdate,
                            });
                          } else {
                            businessHoursToUpdate[index]["endingBusinessHour"] =
                              "";
                            setAdvancedValues({
                              ...advancedValues,
                              businessHoursCondition: businessHoursToUpdate,
                            });
                          }
                        }}
                      />
                      <Dropdown
                        disabled={!canEditChannels}
                        options={[...BusinessHours].splice(
                          BusinessHours.findIndex(
                            (b) => b.value == bh.startingBusinessHour
                          ) + 1
                        )}
                        value={bh.endingBusinessHour}
                        selection
                        closeOnBlur
                        upward={false}
                        onChange={(_, data) => {
                          const businessHoursToUpdate = [
                            ...advancedValues.businessHoursCondition,
                          ];
                          businessHoursToUpdate[index]["endingBusinessHour"] =
                            data.value as string;
                          setAdvancedValues({
                            ...advancedValues,
                            businessHoursCondition: businessHoursToUpdate,
                          });
                        }}
                      />
                    </Form>
                  </div>
                  <div>
                    {canEditChannels && (
                      <DeletePopupIconContainer
                        stroke="#cc3333"
                        onClick={() => {
                          deleteBusinessHour(index);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </DeletePopupIconContainer>
                    )}
                  </div>
                </BusinessHoursListContainer>
              )
            )}
            <AddBusinessHoursButton onClick={() => addNewBusinessHour()}>
              {t("livechat.advanced.addBusinessHours")}
            </AddBusinessHoursButton>
            <div style={{ marginTop: 14 }}>
              <Checkbox
                checked={advancedValues.isHideLivechatDuringOffhours}
                label={t("livechat.advanced.isHideLivechatDuringOffhours")}
                disabled={!canEditChannels}
                onChange={() => {
                  setAdvancedValues({
                    ...advancedValues,
                    isHideLivechatDuringOffhours:
                      !advancedValues.isHideLivechatDuringOffhours,
                  });
                }}
              />
            </div>
            <Divider />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Label>{t("livechat.advanced.contactForm")}</Label>
            </div>
            <HelperText>
              {t("livechat.advanced.contactFormDescription")}
            </HelperText>
            <div
              style={{
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Label style={{ fontWeight: 400, marginRight: 14 }}>
                {t("livechat.advanced.requireInfo")}
              </Label>
              <Checkbox
                checked={contactFormEnabled}
                className="toggle-checkbox"
                toggle
                disabled={!canEditChannels}
                onChange={() => {
                  if (contactFormEnabled) {
                    setAdvancedValues({
                      ...advancedValues,
                      isContactFormOn: false,
                      isContactFormOnDuringOffHours: false,
                      isPhoneOptional: false,
                    });
                  } else {
                    setAdvancedValues({
                      ...advancedValues,
                      isContactFormOn: true,
                      isContactFormOnDuringOffHours: false,
                      isPhoneOptional: false,
                    });
                  }
                  setContactFormEnabled(!contactFormEnabled);
                }}
              />
            </div>
            <PreviewTabContainer style={{ width: "50%", marginBottom: 14 }}>
              <PreviewTab
                isActive={advancedValues.isContactFormOn}
                isDisabled={!contactFormEnabled || !canEditChannels}
                onClick={() => {
                  if (!contactFormEnabled) return;
                  setAdvancedValues({
                    ...advancedValues,
                    isContactFormOn: !advancedValues.isContactFormOn,
                    isContactFormOnDuringOffHours: false,
                  });
                }}
              >
                {t("livechat.advanced.allTime")}
              </PreviewTab>
              <PreviewTab
                isActive={advancedValues.isContactFormOnDuringOffHours}
                isDisabled={!contactFormEnabled || !canEditChannels}
                onClick={() => {
                  if (!contactFormEnabled) return;
                  setAdvancedValues({
                    ...advancedValues,
                    isContactFormOn: false,
                    isContactFormOnDuringOffHours:
                      !advancedValues.isContactFormOnDuringOffHours,
                  });
                }}
              >
                {t("livechat.advanced.requireInfoDuringOffHours")}
              </PreviewTab>
            </PreviewTabContainer>
            <div className={styles.optionalContactInfoWrapper}>
              <Checkbox
                checked={advancedValues.isPhoneOptional}
                disabled={!contactFormEnabled || !canEditChannels}
                label={t("livechat.advanced.setPhoneOptional")}
                onChange={() => {
                  setAdvancedValues({
                    ...advancedValues,
                    isPhoneOptional: !advancedValues.isPhoneOptional,
                  });
                }}
              />
              <Checkbox
                checked={advancedValues.isEmailOptional}
                disabled={!contactFormEnabled || !canEditChannels}
                label={t("livechat.advanced.setEmailOptional")}
                onChange={() => {
                  setAdvancedValues({
                    ...advancedValues,
                    isEmailOptional: !advancedValues.isEmailOptional,
                  });
                }}
              />
            </div>
            {featureGuard.canUseAnalytics() && (
              <>
                <Divider />
                <Label>{t("livechat.advanced.hidePowerBy")}</Label>
                <PreviewTabContainer style={{ width: "50%", marginBottom: 14 }}>
                  <PreviewTab
                    isActive={
                      featureGuard.canUseAnalytics() &&
                      !advancedValues.isHidePowerBy
                    }
                    isDisabled={!canEditChannels}
                    onClick={() => {
                      if (!featureGuard.canUseAnalytics()) return;
                      setAdvancedValues({
                        ...advancedValues,
                        isHidePowerBy: false,
                      });
                    }}
                  >
                    {t("livechat.advanced.show")}
                  </PreviewTab>
                  <PreviewTab
                    isActive={
                      featureGuard.canUseAnalytics() &&
                      advancedValues.isHidePowerBy
                    }
                    isDisabled={!canEditChannels}
                    onClick={() => {
                      if (!featureGuard.canUseAnalytics()) return;
                      setAdvancedValues({
                        ...advancedValues,
                        isHidePowerBy: true,
                      });
                    }}
                  >
                    {t("livechat.advanced.hide")}
                  </PreviewTab>
                </PreviewTabContainer>
              </>
            )}
            <SaveChangesButton>
              {canEditChannels && (
                <Button
                  onClick={() =>
                    handleUpdateCustomField(advancedValues, "advanced")
                  }
                  loading={isLoading}
                >
                  {t("livechat.saveChanges")}
                </Button>
              )}
            </SaveChangesButton>
          </div>
          <div>
            <Label>{t("livechat.preview")}</Label>
            <WidgetPreview />
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("livechat.languages.title"),
      render: () => (
        <Tab.Pane attached={false} key="languages">
          <div>
            <WidgetSectionHeader>
              {t("livechat.languages.title")}
            </WidgetSectionHeader>
            <WidgetSectionHelperText style={{ marginBottom: 21 }}>
              {t("livechat.languages.languageDescription1")}
              <br />
              <br />
              {t("livechat.languages.languageDescription2")}
            </WidgetSectionHelperText>
            {WidgetLanguageOptions.map((lang) => (
              <WidgetItemContainer
                key={lang.value}
                onMouseEnter={() => setHoverLanguage(lang.value)}
                onMouseLeave={() => setHoverLanguage("")}
              >
                <LanguageContainer>
                  <div>{lang.name}</div>
                  <div>{lang.value}</div>
                </LanguageContainer>
                <LanguageSwitchContainer>
                  <div>
                    {lang.value === languageValues.defaultLang ? (
                      <div
                        style={{
                          background: "#6078ff",
                          borderRadius: 50,
                          color: "white",
                          padding: "2px 16px",
                          fontSize: 13,
                        }}
                      >
                        {t("livechat.languages.default")}
                      </div>
                    ) : (
                      <>
                        {canEditChannels && (
                          <SetDefaultButton
                            isHoverItem={
                              lang.value === hoverLanguage &&
                              languageValues.activatedLang.includes(lang.value)
                            }
                            onClick={() =>
                              setLanguageValues({
                                ...languageValues,
                                defaultLang: lang.value,
                              })
                            }
                          >
                            {t("livechat.languages.setAsDefault")}
                          </SetDefaultButton>
                        )}
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: 21,
                    }}
                  >
                    <Checkbox
                      className="toggle-checkbox"
                      fitted
                      toggle
                      checked={languageValues.activatedLang.includes(
                        lang.value
                      )}
                      disabled={!canEditChannels}
                      onChange={() => {
                        if (
                          lang.value === languageValues.defaultLang &&
                          languageValues.activatedLang.includes(lang.value)
                        ) {
                          return;
                        }
                        if (languageValues.activatedLang.includes(lang.value)) {
                          const newActivatedLang = [
                            ...languageValues.activatedLang,
                          ].filter((l) => l !== lang.value);
                          setLanguageValues({
                            ...languageValues,
                            activatedLang: newActivatedLang,
                          });
                        } else {
                          setLanguageValues({
                            ...languageValues,
                            activatedLang: [
                              ...languageValues.activatedLang,
                              lang.value,
                            ],
                          });
                        }
                      }}
                    />
                  </div>
                </LanguageSwitchContainer>
              </WidgetItemContainer>
            ))}
            <SaveChangesButton>
              {canEditChannels && (
                <Button
                  onClick={() =>
                    handleUpdateCustomField(languageValues, "languages")
                  }
                  loading={isLoading}
                >
                  {t("livechat.saveChanges")}
                </Button>
              )}
            </SaveChangesButton>
          </div>
          <div>
            <Label>{t("livechat.preview")}</Label>
            <WidgetPreview />
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("livechat.popup.title"),
      render: () => (
        <Tab.Pane attached={false} key="pop-up">
          {isCreatePopup ? (
            <div>
              <WidgetSectionHeader style={{ marginBottom: 21 }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  onClick={() => {
                    setIsCreatePopup(false);
                    resetPopupInput();
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {t("livechat.popup.editPopup")}
              </WidgetSectionHeader>
              <Label>{t("livechat.popup.name")}</Label>
              <StyledInput
                placeholder={t("livechat.popup.namePlaceholder")}
                value={popupInput.name}
                onChange={(e: any) => {
                  if (e.target.value) {
                    setEmptyPopupError(false);
                  }
                  setPopupInput({
                    ...popupInput,
                    name: e.target.value,
                  });
                }}
              />
              <ErrorText isShow={emptyPopupError}>
                {t("livechat.popup.emptyPopupError")}
              </ErrorText>
              <Label style={{ marginTop: 16 }}>
                {t("livechat.popup.conditions")}
              </Label>
              <HelperText style={{ marginBottom: 8 }}>
                {t("livechat.popup.conditionDescription")}
              </HelperText>
              {popupInput.conditions.map((condition, index) => (
                <PopupConditionContainer key={index}>
                  <div>
                    <Form>
                      <Dropdown
                        options={popUpDisplayOptions}
                        value={condition.display}
                        selection
                        closeOnBlur
                        upward={false}
                        onChange={(_, data) => {
                          const popupListToUpdate = [...popupInput.conditions];
                          popupListToUpdate[index]["display"] =
                            data.value as string;
                          setPopupInput({
                            ...popupInput,
                            conditions: popupListToUpdate,
                          });
                        }}
                      />
                      <Dropdown
                        options={popUpConditionOptions}
                        value={condition.condition}
                        selection
                        closeOnBlur
                        upward={false}
                        onChange={(_, data) => {
                          const popupListToUpdate = [...popupInput.conditions];
                          popupListToUpdate[index]["condition"] =
                            data.value as string;
                          setPopupInput({
                            ...popupInput,
                            conditions: popupListToUpdate,
                          });
                        }}
                      />
                    </Form>
                  </div>
                  <div>
                    <StyledInput
                      placeholder={t("livechat.popup.enterUrl")}
                      value={condition.url}
                      onChange={(e: any) => {
                        const popupListToUpdate = [...popupInput.conditions];
                        popupListToUpdate[index]["url"] = e.target
                          .value as string;
                        setPopupInput({
                          ...popupInput,
                          conditions: popupListToUpdate,
                        });
                      }}
                    />
                  </div>
                  <DeletePopupIconContainer
                    stroke="#cc3333"
                    onClick={() => {
                      setCurrentConditionIndex(index);
                      setDeleteConditionModalOpen(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </DeletePopupIconContainer>
                </PopupConditionContainer>
              ))}
              <Modal open={isDeleteConditionModalOpen} size="tiny">
                <CodeModalContainer>
                  <CodeModalHeader>
                    <div>{t("livechat.popup.deletePopupCondition")}</div>
                    <div onClick={() => setDeleteConditionModalOpen(false)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </CodeModalHeader>
                  <div>
                    <span>
                      <Trans
                        i18nKey={"livechat.popup.deletePopupConditionText"}
                        values={{ popup: currentPopup.name }}
                      >
                        Are you sure you want to delete
                        <span style={{ color: "#6078ff", fontWeight: 500 }}>
                          {currentPopup.name}
                        </span>
                        ? This can’t be reversed.
                      </Trans>
                    </span>
                    <DeleteModalButtonContainer>
                      <SaveChangesButton
                        onClick={() => {
                          const newPopupInputConditions = popupInput.conditions;
                          newPopupInputConditions.splice(
                            currentConditionIndex,
                            1
                          );
                          setPopupInput({
                            ...popupInput,
                            conditions: newPopupInputConditions,
                          });
                          setDeleteConditionModalOpen(false);
                        }}
                      >
                        <Button loading={isLoading}>
                          {t("livechat.popup.confirm")}
                        </Button>
                      </SaveChangesButton>
                      <AddConditionButton
                        onClick={() => {
                          setDeleteConditionModalOpen(false);
                        }}
                      >
                        {t("livechat.popup.cancel")}
                      </AddConditionButton>
                    </DeleteModalButtonContainer>
                  </div>
                </CodeModalContainer>
              </Modal>
              <AddConditionButton onClick={() => addNewPopupCondition()}>
                {t("livechat.popup.addCondition")}
              </AddConditionButton>
              <Label style={{ marginBottom: 8 }}>
                {t("livechat.popup.message")}
              </Label>
              <Textarea
                minRows={5}
                maxRows={5}
                placeholder={t("livechat.popup.msgPlaceholder")}
                value={popupInput.message}
                onChange={(e: any) =>
                  setPopupInput({
                    ...popupInput,
                    message: e.target.value,
                  })
                }
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
              />
              <DelayPopupContainer>
                <div>{t("livechat.popup.delayPopupText1")}</div>
                <StyledInput
                  placeholder={"0"}
                  value={popupInput.delaySecond}
                  onChange={(e: any) => {
                    const delaySecond = e.target.value as string;
                    if (parseInt(delaySecond) || delaySecond == "") {
                      setPopupInput({
                        ...popupInput,
                        delaySecond,
                      });
                    }
                  }}
                  style={{ width: "60px" }}
                />
                <div>{t("livechat.popup.delayPopupText2")}</div>
              </DelayPopupContainer>
              <div style={{ marginTop: 21, display: "flex" }}>
                <AddConditionButton
                  loading={isLoading}
                  disabled={isLoading}
                  style={{ marginRight: 16 }}
                  onClick={() => {
                    handleUpdatePopup(false);
                  }}
                >
                  {t("livechat.popup.saveAsDraft")}
                </AddConditionButton>
                <SaveChangesButton style={{ marginTop: 0 }}>
                  <Button
                    loading={isLoading}
                    disabled={isLoading}
                    onClick={() => {
                      handleUpdatePopup(true);
                    }}
                  >
                    {t("livechat.popup.publish")}
                  </Button>
                </SaveChangesButton>
              </div>
            </div>
          ) : (
            <div>
              <WidgetSectionHeader>
                {t("livechat.popup.title")}
              </WidgetSectionHeader>
              <WidgetSectionHelperText style={{ marginBottom: 21 }}>
                {t("livechat.popup.popupDescription")}
              </WidgetSectionHelperText>
              <CreatePopupButton style={{ marginBottom: 21 }}>
                <Button onClick={() => setIsCreatePopup(true)}>
                  {t("livechat.popup.createPopup")}
                </Button>
              </CreatePopupButton>
              <Modal open={isDeleteModalOpen} size="tiny">
                <CodeModalContainer>
                  <CodeModalHeader>
                    <div>{t("livechat.popup.deletePopup")}</div>
                    <div onClick={() => setDeleteModalOpen(false)}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </CodeModalHeader>
                  <div>
                    <span>
                      <Trans
                        i18nKey={"livechat.popup.deletePopupText"}
                        values={{ popup: currentPopup.name }}
                      >
                        Are you sure you want to delete{" "}
                        <span style={{ color: "#6078ff", fontWeight: 500 }}>
                          {currentPopup.name}
                        </span>
                        ? This can’t be reversed.
                      </Trans>
                    </span>
                    <DeleteModalButtonContainer>
                      <SaveChangesButton
                        onClick={() => {
                          handleDeletePopup();
                        }}
                      >
                        <Button loading={isLoading}>
                          {t("livechat.popup.confirm")}
                        </Button>
                      </SaveChangesButton>
                      <AddConditionButton
                        onClick={() => {
                          setDeleteModalOpen(false);
                          setCurrentPopup({});
                        }}
                      >
                        {t("livechat.popup.cancel")}
                      </AddConditionButton>
                    </DeleteModalButtonContainer>
                  </div>
                </CodeModalContainer>
              </Modal>
              {popupValues.map((popup: any) => (
                <WidgetItemContainer key={popup.value}>
                  <LanguageContainer>
                    <div
                      onClick={() => {
                        handleEditPopup(popup);
                      }}
                      style={{ color: "#6078ff", cursor: "pointer" }}
                    >
                      {popup.name}
                    </div>
                    <div>
                      {`${t("livechat.popup.lastEditedOn")} ${moment(
                        popup.lastEditTime
                      ).format("MMM DD, YYYY")}` ||
                        `Last edited on April 21, 2021`}
                    </div>
                  </LanguageContainer>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: 21,
                    }}
                  >
                    {canEditChannels && (
                      <>
                        <PopupIconContainer
                          onClick={() => {
                            handleEditPopup(popup);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </PopupIconContainer>
                        <PopupIconContainer
                          stroke="#cc3333"
                          onClick={() => {
                            setCurrentPopup(popup);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </PopupIconContainer>
                      </>
                    )}

                    <Checkbox
                      className="toggle-checkbox"
                      fitted
                      toggle
                      disabled={!canEditChannels}
                      checked={popup.isActivated}
                      onChange={() => {
                        handleTogglePopup(popup);
                      }}
                    />
                  </div>
                </WidgetItemContainer>
              ))}
            </div>
          )}
          <div>
            <Label>{t("livechat.preview")}</Label>
            <WidgetPreview />
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("livechat.channels.title"),
      render: () => (
        <Tab.Pane attached={false} key="channels">
          <div>
            <WidgetSectionHeader>
              {t("livechat.channels.title")}
            </WidgetSectionHeader>
            <WidgetSectionHelperText>
              {t("livechat.channels.channelDescription")}
            </WidgetSectionHelperText>
            <div
              style={{
                marginTop: 8,
                color: "#6078ff",
                display: "flex",
                marginBottom: 21,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: 8,
                }}
              >
                {t("livechat.channels.addChannelAlready")}
              </div>
              <RefreshCompanyButton
                loading={isLoading}
                onClick={() => handleRefreshCompany()}
              >
                {t("livechat.channels.refreshChannel")}
              </RefreshCompanyButton>
            </div>
            {ChannelOptions?.map((channel) => (
              <WidgetItemContainer key={channel.name}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ height: 40 }}>
                    <img
                      src={channel.img}
                      alt={channel.name}
                      style={{ width: 40, height: 40, marginRight: 21 }}
                    />
                  </div>
                  <div>
                    <LanguageContainer>
                      <div>{channel.name}</div>
                      <div>
                        {channel.isFacebook
                          ? channel.activatedChannel?.pageName
                          : channel.activatedChannel?.name}
                      </div>
                    </LanguageContainer>
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <ErrorText isShow={channel.key === enableChannelError}>
                    {t("livechat.channels.needOneChannel")}
                  </ErrorText>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {canEditChannels &&
                    channel.canSelect &&
                    channel.channels.length > 0 ? (
                      <Dropdown
                        upward={false}
                        open={channel.isOpen}
                        onBlur={() => channel.setOpen(false)}
                        icon={false}
                        direction={"left"}
                        options={channel.channels}
                        onChange={(_, data) => {
                          handleChannelSelect(data.value, data.options);
                          channel.setOpen(false);
                        }}
                        trigger={
                          <span
                            className="channel-menu"
                            onClick={() => channel.setOpen(!channel.isOpen)}
                          >
                            {t("livechat.channels.switch")}{" "}
                            <Icon name="chevron down" />
                          </span>
                        }
                      />
                    ) : (
                      ""
                    )}
                    {channel.channels.length > 0 ? (
                      <Checkbox
                        className="toggle-checkbox"
                        checked={channel.isActivated}
                        fitted
                        toggle
                        disabled={!canEditChannels}
                        onChange={() => {
                          handleChannelToggle(channel.key);
                        }}
                      />
                    ) : (
                      <AddChannelButton
                        onClick={() => window.open("/channels", "_blank")}
                      >
                        {t("livechat.channels.add")}
                      </AddChannelButton>
                    )}
                  </div>
                </div>
              </WidgetItemContainer>
            ))}
            <SaveChangesButton>
              {canEditChannels && (
                <Button
                  onClick={() =>
                    handleUpdateCustomField(channelValues, "channels")
                  }
                  loading={isLoading}
                >
                  {t("livechat.saveChanges")}
                </Button>
              )}
            </SaveChangesButton>
          </div>
          <div>
            <Label>{t("livechat.preview")}</Label>
            <WidgetPreview />
          </div>
        </Tab.Pane>
      ),
    },
  ];

  useEffect(() => {
    if (company) {
      const blogURLs = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "blogurls"
      );
      const welcomeMessage = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "welcomemessage"
      );
      fieldStatusTracking["welcomeMessage"].originalValue =
        welcomeMessage?.value || "";
      const tagLine = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatdescription"
      );
      fieldStatusTracking["tagLine"].originalValue = tagLine?.value || "";
      const autoReply = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "autoreplymessage"
      );
      fieldStatusTracking["autoReply"].originalValue = autoReply?.value || "";
      const companyBackgroundColor = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() ===
          "livechatbackgroundcolor"
      );
      fieldStatusTracking["companyBackgroundColor"].originalValue =
        companyBackgroundColor?.value || "";
      const companyFontColor = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatfontcolor"
      );
      fieldStatusTracking["companyFontColor"].originalValue =
        companyFontColor?.value || "";
      const pageTitle = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatpagetitle"
      );
      fieldStatusTracking["pageTitle"].originalValue = pageTitle?.value || "";
      const liveChatTitle = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatlivechattitle"
      );
      fieldStatusTracking["liveChatTitle"].originalValue =
        liveChatTitle?.value || "";
      const socialConversationTitle = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() ===
          "livechatsocialconversationtitle"
      );
      fieldStatusTracking["socialConversationTitle"].originalValue =
        socialConversationTitle?.value || "";
      const liveChatGreeting = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatgreeting"
      );
      fieldStatusTracking["liveChatGreeting"].originalValue =
        liveChatGreeting?.value || "";
      const liveChatIconColor = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechaticoncolor"
      );
      fieldStatusTracking["liveChatIconColor"].originalValue =
        liveChatIconColor?.value || "";
      let customLinks = ["", "", ""];
      if (blogURLs && blogURLs.value) {
        const blogLinks: BlogURLType[] = JSON.parse(
          blogURLs.value.replace("\n", "")
        );
        if (blogLinks) {
          if (blogLinks.length < 3) {
            const remainLinks = 3 - blogLinks.length;
            let emptyFields: string[] = [];
            for (let i = 0; i < remainLinks; i++) {
              emptyFields = [...emptyFields, ""];
            }
            customLinks = [
              ...blogLinks.map((blogLink) => blogLink.blogUrl),
              ...emptyFields,
            ];
          } else {
            customLinks = blogLinks.map((blogLink) => blogLink.blogUrl);
          }
          fieldStatusTracking["blogURLs"].originalValue = customLinks.join(",");
        }
      }
      setIconColor((liveChatIconColor && liveChatIconColor.value) || iconColor);
      setFontColor((companyFontColor && companyFontColor.value) || fontColor);
      setBgColor(
        (companyBackgroundColor && companyBackgroundColor.value) || bgColor
      );
      setWebsiteManagerInfo({
        ...websiteManagerInfo,
        customLink: [...customLinks],
        tagline: (tagLine && tagLine.value) || "",
        welcomeMessage: (welcomeMessage && welcomeMessage.value) || "",
        autoReply: (autoReply && autoReply.value) || "",
        pageTitle: (pageTitle && pageTitle.value) || "",
        liveChatTitle: (liveChatTitle && liveChatTitle.value) || "",
        socialConversationTitle:
          (socialConversationTitle && socialConversationTitle.value) || "",
        greeting: (liveChatGreeting && liveChatGreeting.value) || "",
      });
      setFieldStatusTracking({ ...fieldStatusTracking });
    }
  }, [JSON.stringify(props)]);

  const pageTitle = t("nav.menu.settings.liveChat");

  const handleCopyCode = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="website-management content no-scrollbars">
      <Helmet title={t("livechat.liveChatWidget", { page: pageTitle })} />
      <div className="grid-header">
        <HeaderContainer>
          <div className="title">{t("livechat.liveChatWidget")}</div>
          <div>
            {/* <div style={{ display: "flex"}}>
            <Checkbox
              className="toggle-checkbox"
              fitted
              toggle
              onChange={() => ""} />
            </div> */}
            {company?.id ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <RefreshCompanyButton
                  style={{ height: 30 }}
                  onClick={() =>
                    window.open(
                      `https://preview.sleekflow.io/?companyId=${company?.id}`,
                      "_blank"
                    )
                  }
                >
                  {t("onboarding.livechat.preview")}
                </RefreshCompanyButton>
              </div>
            ) : (
              ""
            )}
            <CodeButton>
              {canConnectChannels && (
                <Modal
                  open={isCodeModalOpen}
                  trigger={
                    <Button
                      onClick={() => setIsCodeModalOpen(true)}
                      content={t("livechat.getCodeSnippet")}
                    />
                  }
                >
                  <CodeModalContainer>
                    <CodeModalHeader>
                      <div>{t("livechat.addWidgetText")}</div>
                      <div onClick={() => setIsCodeModalOpen(false)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </CodeModalHeader>
                    <div>
                      <CodeDescription>
                        {t("livechat.copyText")}
                        <br />
                        {t("livechat.copyText2")}
                      </CodeDescription>
                      <CodeDescription>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(liveChatSnippet);
                            handleCopyCode();
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          {isCopied
                            ? t("livechat.copied")
                            : t("livechat.copyCode")}
                        </Button>
                        <CodeBlock
                          text={liveChatSnippet}
                          language="html"
                          showLineNumbers
                          theme={nord}
                        />
                      </CodeDescription>
                      <CodeDescription>
                        {t("livechat.completeText")}.
                      </CodeDescription>
                      <CodeDescription>
                        {t("livechat.testText")}
                      </CodeDescription>
                    </div>
                  </CodeModalContainer>
                </Modal>
              )}
            </CodeButton>
          </div>
        </HeaderContainer>
        <fieldset
          style={{ padding: 0, margin: 0, border: "none" }}
          disabled={!canEditChannels}
        >
          <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
        </fieldset>
      </div>
    </div>
  );
};
