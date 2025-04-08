import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dropdown,
  Form,
  GridRow,
  Icon,
  Image,
  Tab,
} from "semantic-ui-react";
import { post } from "../../api/apiRequest";
import { CodeBlock, nord } from "react-code-blocks";
import SettingProfilePic from "../../component/Settings/SettingProfilePic/SettingProfilePic";
import { useHistory } from "react-router-dom";
import CompanyType from "../../types/CompanyType";
import { POST_COMPANY_FIELD } from "../../api/apiPath";
import Helmet from "react-helmet";
import TrackingCodeColour from "../../component/TrackingCodeColour";
import { useFlashMessageChannel } from "../../component/BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import LiveChatIcon from "../../assets/images/LiveChat.svg";
import FacebookIcon from "../../assets/images/facebook_messenger.svg";
import WhatsappIcon from "../../assets/images/whatsapp.svg";
import WeChatIcon from "../../assets/images/WeChat.svg";
import InstagramIcon from "../../assets/images/channels/Instagram.svg";
import LineIcon from "../../assets/images/line.svg";
import useCompanyChannels from "../../component/Chat/hooks/useCompanyChannels";
import { PostLogin } from "../../component/Header";
import useFetchCompany from "../../api/Company/useFetchCompany";
import moment from "moment";
import uuid from "uuid";
import { Step, Stepper } from "react-form-stepper";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import getTextColor from "../../component/Settings/helpers/getTextColor";

const StepsStyleConfig = {
  activeBgColor: "#6078ff",
  activeTextColor: "white",
  completedBgColor: "#6078ff",
  completedTextColor: "white",
  inactiveBgColor: "#e0e0e0",
  inactiveTextColor: "#ffffff",
  size: "2em",
  circleFontSize: "1em",
  labelFontSize: "16px",
  borderRadius: "50%",
  fontWeight: 500,
};

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
    border-color: transparent !important;
    box-shadow: 0 0 0px 1px #ececec !important;
    border: 0 !important;

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
  display: flex;

  > button {
    padding: 10px 16px !important;
    min-height: 30px !important;
    margin-left: auto !important;
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
const RefreshCompanyButton = styled(Button)`
  padding: 10px 16px !important;
  min-height: 30px !important;
  color: #3c4256 !important;
  background: white !important;
  font-size: 13px !important;
  margin-bottom: 0px !important;
  max-height: 36px !important;
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
}

const PreviewTab = styled.div<PreviewTabProps>`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 4px 8px;
  user-select: none;
  font-weight: 500;
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

const LivechatOnboarding = () => {
  const company = useAppSelector((s) => s.company);
  const history = useHistory();
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
  const [generalValues, setGeneralValues] = useState({
    widgetName: "",
    botName: "",
    widgetBgColor: "#3c4257",
    widgetButtonColor: "#6078ff",
    widgetBgTextColor: "#ffffff",
    widgetButtonTextColor: "#ffffff",
  });
  const [advancedValues, setAdvancedValues] = useState({
    replyTime: "in-mins",
    isContactFormOn: false,
    isPhoneOptional: false,
  });
  const [languageValues, setLanguageValues] = useState({
    defaultLang: "en-us",
    activatedLang: ["en-us"],
  });
  const [popupValues, setPopupValues] = useState<any>([]);
  const [previewTab, setPreviewTab] = useState("start");

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
  const [selectedWhatsapp, setSelectedWhatsapp] = useState({
    value: "",
    pageName: "",
    name: "",
  });
  const [selectedFacebook, setSelectedFacebook] = useState({
    value: "",
    pageName: "",
    name: "",
  });
  const [companyPicUrl, setCompanyPicUrl] = useState("");
  const [isCreatePopup, setIsCreatePopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<any>({});
  const [enableChannelError, setEnableChannelError] = useState<any>("");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

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
  }

  const [newPopupConditionList, setNewPopupConditionList] = useState<
    PopupCondition[]
  >([]);

  const [popupInput, setPopupInput] = useState<PopupMessage>({
    name: "",
    conditions: [],
    message: "",
    isActivated: false,
  });

  const resetPopupInput = () => {
    setPopupInput({
      name: "",
      conditions: [],
      message: "",
      isActivated: false,
    });
    setCurrentPopup({});
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
          ? [allChannels.wechat.channels[0]]
          : [],
      isActivated: channelValues.wechat.isActivated,
      activatedChannel:
        allChannels.wechat.channels.length > 0
          ? allChannels.wechat.channels[0]
          : channelValues.wechat.activatedChannel,
    },
    {
      key: "line",
      name: "Line",
      img: LineIcon,
      channels:
        allChannels.line.channels.length > 0
          ? [allChannels.line.channels[0]]
          : [],
      isActivated: channelValues.line.isActivated,
      activatedChannel:
        allChannels.line.channels.length > 0
          ? allChannels.line.channels[0]
          : channelValues.line.activatedChannel,
    },
  ];

  const mapCompanyChannelsOption = useCallback(() => {
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
  }, [JSON.stringify(company)]);

  useEffect(() => {
    mapCompanyChannelsOption();
  }, [JSON.stringify(company)]);

  useEffect(() => {
    const customFieldList = [
      { name: "general", action: setGeneralValues },
      { name: "advanced", action: setAdvancedValues },
      { name: "languages", action: setLanguageValues },
      { name: "popup", action: setPopupValues },
      { name: "channels", action: setChannelValues },
    ];
    if (company) {
      const companyName = company.companyName;
      const livechatCustomFields = company.companyCustomFields.filter(
        (field) => field.category === "LiveChat"
      );
      const livechatSettings = livechatCustomFields.filter((field) =>
        customFieldList.map((f) => f.name).includes(field.fieldName)
      );
      customFieldList.map((customField) => {
        const fieldObj = livechatSettings.find(
          (field) => field.fieldName == customField.name
        );
        if (fieldObj) {
          customField.action(JSON.parse(fieldObj.value));
        }
      });
    }
    if (company?.id) {
      setLiveChatSnippet(`<!-- Start of SleekFlow Embed Code -->
        <script src="https://chat.sleekflow.io/embed_iframe.js" 
          data-id="travischatwidget"
          data-companyid="${company.id}"
          type="text/javascript">
        </script>
<!-- End of SleekFlow Embed Code -->
      `);
    }
  }, [company]);

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
          activatedChannel: ChannelOptions.find((c) => c.key == "facebook")
            ?.activatedChannel,
        },
        whatsapp: {
          ...channelValues.whatsapp,
          activatedChannel: ChannelOptions.find((c) => c.key == "whatsapp")
            ?.activatedChannel,
        },
        instagram: {
          ...channelValues.instagram,
          activatedChannel: ChannelOptions.find((c) => c.key == "instagram")
            ?.activatedChannel,
        },
      };
      formattedParams = formatValuesToParams(formattedValues, field);
    }
    if (!company) {
      return;
    }
    try {
      const companyUpdated: CompanyType = await post(POST_COMPANY_FIELD, {
        param: [formattedParams],
      });
      loginDispatch({
        type: "UPDATE_COMPANY_INFO",
        company: {
          ...company,
          companyCustomFields: companyUpdated?.companyCustomFields,
        },
      });
      flash(t("livechat.toastSuccess"));
      mapCompanyChannelsOption();
      setActiveStep(activeStep + 1);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
      if (field === "popup") {
        setIsCreatePopup(false);
      }
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

  const { refreshCompany } = useFetchCompany();

  const handleRefreshCompany = async () => {
    setIsLoading(true);
    refreshCompany();
    setIsLoading(false);
  };

  const handleUpdatePopup = (isActivated: boolean) => {
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
    resetPopupInput();
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
                  {t("livechat.home.replyTime.in-mins")}
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
                  <img src={channel.img} alt="channel.name" />
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
  const steps = [
    {
      render: () => (
        <Tab.Pane attached={false}>
          <div>
            <WidgetSectionHeader>
              {t("onboarding.livechat.personalizeHeader")}
            </WidgetSectionHeader>
            <WidgetSectionHelperText style={{ marginBottom: 21 }}>
              {t("onboarding.livechat.personalizeText")}
            </WidgetSectionHelperText>
            <Divider />
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
            <div style={{ marginBottom: 8 }}>
              <Checkbox
                checked={advancedValues.isContactFormOn}
                label={t("livechat.advanced.requireInfo")}
                onChange={() => {
                  setAdvancedValues({
                    ...advancedValues,
                    isContactFormOn: !advancedValues.isContactFormOn,
                  });
                }}
              />
            </div>
            <div
              style={{
                display: advancedValues.isContactFormOn ? "block" : "none",
              }}
            >
              <Checkbox
                checked={advancedValues.isPhoneOptional}
                label={t("livechat.advanced.setPhoneOptional")}
                onChange={() => {
                  setAdvancedValues({
                    ...advancedValues,
                    isPhoneOptional: !advancedValues.isPhoneOptional,
                  });
                }}
              />
            </div>
            <SaveChangesButton>
              <Button
                onClick={() => {
                  handleUpdateCustomField(generalValues, "general");
                  handleUpdateCustomField(advancedValues, "advanced");
                }}
                loading={isLoading}
              >
                {t("onboarding.livechat.saveAndNext")}
              </Button>
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
      render: () => (
        <Tab.Pane attached={false}>
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
                marginBottom: 21,
                color: "#6078ff",
                display: "flex",
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
                onClick={() => {
                  handleRefreshCompany();
                }}
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
                    {channel.canSelect && channel.channels.length > 0 ? (
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
              <Button
                onClick={() => {
                  handleUpdateCustomField(channelValues, "channels");
                }}
                loading={isLoading}
              >
                {t("onboarding.livechat.saveAndNext")}
              </Button>
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
      render: (company: any) => (
        <Tab.Pane attached={false}>
          <div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <WidgetSectionHeader>
                  {t("onboarding.livechat.previewHeader")}
                </WidgetSectionHeader>
                <WidgetSectionHelperText style={{ marginBottom: 21 }}>
                  {t("onboarding.livechat.previewText")}
                </WidgetSectionHelperText>
              </div>
              <RefreshCompanyButton
                onClick={() => {
                  window.open(
                    `https://preview.sleekflow.io/?companyId=${company.id}`,
                    "_blank"
                  );
                }}
              >
                {t("onboarding.livechat.preview")}
              </RefreshCompanyButton>
            </div>
            <Divider />
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
                  {isCopied ? t("livechat.copied") : t("livechat.copyCode")}
                </Button>
                <CodeBlock
                  text={liveChatSnippet}
                  language="markup"
                  showLineNumbers
                  theme={nord}
                />
              </CodeDescription>
              <CodeDescription>{t("livechat.completeText")}.</CodeDescription>
              <CodeDescription>{t("livechat.testText")}</CodeDescription>
            </div>
            <SaveChangesButton>
              <Button
                loading={isLoading}
                onClick={() => {
                  history.push("/settings/livechatwidget");
                }}
              >
                {t("onboarding.livechat.finish")}
              </Button>
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

  const pageTitle = t("nav.menu.settings.liveChat");
  const [activeStep, setActiveStep] = useState(0);

  const handleCopyCode = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="post-login channel-selection">
      <PostLogin selectedItem={""} />
      <Helmet title={t("livechat.liveChatWidget", { page: pageTitle })} />
      <div
        className={`channel-selection__main main getting-started`}
        style={{ minWidth: 1280 }}
      >
        <div className="container">
          <div className="header">{t("onboarding.livechat.header")}</div>
          <div className="livechat-onboarding-header">
            <Stepper
              activeStep={activeStep}
              styleConfig={StepsStyleConfig}
              className="stepper"
            >
              <Step label={t("onboarding.livechat.customize")} />
              <Step label={t("onboarding.livechat.channels")} />
              <Step label={t("onboarding.livechat.goLive")} />
            </Stepper>
          </div>
          <div>{steps[activeStep].render(company)}</div>
        </div>
      </div>
    </div>
  );
};

export default LivechatOnboarding;
