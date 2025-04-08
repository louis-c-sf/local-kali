import React, { useContext, useEffect, useState } from "react";
import {
  DropdownItemProps,
  DropdownProps,
  Icon,
  Image,
  Modal,
} from "semantic-ui-react";
import ChannelWebhook from "./ChannelWebhook";
import ChannelInfoType from "../../types/ChannelInfoType";
import ChannelConfirmModal from "../ChannelConfirmModal";
import FacebookPageType from "../../types/FacebookPageType";
import ChannelWhatsApp from "./Whatsapp/ChannelWhatsApp";
import FacebookForm, { FacebookFormInputType } from "./Forms/FacebookForm";
import { LineForm } from "./Forms/LineForm";
import { WeChatForm } from "./Forms/WeChatForm";
import { ChannelsContext } from "./ChannelsContext";
import { TwilioSmsForm } from "./Forms/TwilioSmsForm";
import { TwilioWhatsAppForm } from "./Forms/TwilioWhatsAppForm";
import {
  FacebookResponseType,
  LineFormInputType,
  SmsFormInputType,
  TwilioWhatsappFormInputType,
  WeChatFormInputType,
  WhatsappFormInputType,
} from "./ChannelSelection";
import ZapierForm from "./Forms/ZapierForm";
import SleekflowAPIForm from "./Forms/SleekflowAPIForm";
import { ChannelType, ZAPIER_CHANNELS } from "../Chat/Messenger/types";
import { useLocation } from "react-router";
import { useAppSelector } from "../../AppRootContext";
import MakeComForm from "./Forms/MakeComForm";
import { SalesforceMarketingCloudForm } from "features/Salesforce/usecases/Channels/SalesforceMarketingCloudForm";
import { equals } from "ramda";

interface ChannelFormsProps {
  channelInfo: ChannelInfoType;
  onConnect: Function;
  facebookChannelData?: FacebookResponseType;
}

export type ChannelFormInputs = {
  facebook: FacebookFormInputType;
  instagram: FacebookFormInputType;
  facebookLeadAds: FacebookFormInputType;
  line: LineFormInputType;
  sms: SmsFormInputType;
  twilio_whatsapp: TwilioWhatsappFormInputType;
  whatsapp: WhatsappFormInputType;
  wechat: WeChatFormInputType;
};

function getInitialFieldsState(): ChannelFormInputs {
  return {
    whatsapp: {
      name: "",
    },
    wechat: {
      wechatId: "",
      appId: "",
      appSecret: "",
      name: "",
    },
    line: {
      basicId: "",
      channelId: "",
      channelSecret: "",
    },
    facebook: {
      businessIntegrationSystemUserAccessToken: "",
      pageTokens: [],
    },
    instagram: {
      businessIntegrationSystemUserAccessToken: "",
      pageTokens: [],
    },
    facebookLeadAds: {
      businessIntegrationSystemUserAccessToken: "",
      pageTokens: [],
    },
    sms: {
      name: "",
      accountSID: "",
      accountSecret: "",
      phoneNumber: "",
    },
    twilio_whatsapp: {
      name: "",
      accountSID: "",
      accountSecret: "",
      phoneNumber: "",
      messagingServiceSid: "",
    },
  };
}

export default ChannelForms;

function ChannelForms(props: ChannelFormsProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [facebookPageList, setFacebookPages] = useState<DropdownItemProps[]>(
    []
  );
  const { channelInfo, onConnect, facebookChannelData } = props;
  const { state, dispatch } = useContext(ChannelsContext);
  const company = useAppSelector((s) => s.company, equals);
  const { image, name, descBrief, descBriefHeader, title, titlePopup } =
    channelInfo;
  const [errMsgList, setErrMsgList] = useState({});
  const [webHookLink, setWebHookLink] = useState("");
  const channelNeedToInstall: string[] = [
    "line",
    "wechat",
    "sms",
    "twilio_whatsapp",
    "facebook",
    "instagram",
    "facebookleadads",
  ];
  const location = useLocation<{ channelName: string }>();
  useEffect(() => {
    if (location.state?.channelName) {
      dispatch({
        type: "CHANNEL_WHATSAPP_FORM_OPEN",
        channelName: location.state.channelName as ChannelType,
      });
    }
  }, [location.state?.channelName]);
  useEffect(() => {
    // Facebook is selected as currently finishing connection
    if (facebookChannelData && facebookChannelData.data.length > 0) {
      if (
        state.channelOpened === channelInfo.name &&
        ["facebook", "facebookLeadAds"].includes(channelInfo.name)
      ) {
        const listPages: DropdownItemProps[] = facebookChannelData.data.map(
          (facebookPage) => {
            return {
              key: facebookPage.id,
              value: facebookPage.access_token,
              text: facebookPage.name,
            };
          }
        );
        setFacebookPages([...listPages]);
        if (listPages.length > 0) {
          changeFormInput({
            ...formInput,
            [channelInfo.name]: {
              businessIntegrationSystemUserAccessToken:
                facebookChannelData.business_integration_system_user_access_token,
              pageTokens: listPages.map((page) => {
                return {
                  id: page.key,
                  access_token: page.value,
                  page_name: page.text,
                };
              }),
            },
          });
        }
      }
    }
  }, [JSON.stringify(props.facebookChannelData)]);

  const [formInput, changeFormInput] = useState(getInitialFieldsState());

  const textFieldChange = (id: string, value: string, channelName: string) => {
    changeFormInput((changeFormInput) => {
      return {
        ...changeFormInput,
        [channelName]: {
          ...changeFormInput[channelName],
          [id]: value,
        },
      };
    });
  };

  const connectChannel = () => {
    onConnect();
  };
  const facebookSelectHandler = (
    e: React.SyntheticEvent,
    data: DropdownProps
  ) => {
    const { value } = data;
    const accessTokenList = value as string[];
    if (facebookChannelData && facebookChannelData.data.length > 0) {
      const foundSelectedPage = facebookChannelData.data
        .filter((page) => accessTokenList.includes(page.access_token))
        .map((page) => ({
          id: page.id,
          access_token: page.access_token,
          page_name: page.name,
        }));
      if (foundSelectedPage.length > 0) {
        changeFormInput({
          ...formInput,
          [channelInfo.name]: {
            businessIntegrationSystemUserAccessToken:
              facebookChannelData.business_integration_system_user_access_token,
            pageTokens: foundSelectedPage,
          },
        });
      }
    }
  };

  const setErrMsgStr = (errMsgListObj: object) => {
    setErrMsgList(errMsgListObj);
  };

  const closeForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setErrMsgList({});
    dispatch({ type: "CHANNEL_FORM_CLOSE" });
    changeFormInput(getInitialFieldsState());
    setFacebookPages([]);
  };
  const uploadFiles = (filesList: File[]) => {
    setFiles([...filesList, ...files]);
  };
  const switchToOfficalWhatsApp = () => {
    dispatch({
      type: "CHANNEL_FORM_OPEN",
      channelName: "twilio_whatsapp" as ChannelType,
    });
  };

  const updatedWhatsappScanStatus = () => {
    dispatch({
      type: "WHATSAPP_SCANNED",
    });
  };

  function backToClick(e: React.MouseEvent) {
    e.stopPropagation();
    dispatch({
      type: "CHANNEL_WHATSAPP_FORM_CLOSE",
    });
  }

  const modalOpen =
    state.showChannelForm && state.channelOpened === channelInfo.name;
  return (
    <Modal
      open={modalOpen}
      className={`
      channel-modal
      channel-modal-${name}
      ${name === "whatsapp" && state.isWhatsappPaid ? "whatsapp-paid" : ""}
      ${
        state.isWhatsappScanned && name === "whatsapp" && state.isWhatsappPaid
          ? "whatsapp-scanned"
          : ""
      }
      `}
    >
      <Modal.Header className="modalHeader">
        <div className="channel-description">
          <div className="logo">
            <Image src={image} />
          </div>
          <div className="channel-details">
            <h3 className={"header-title"}>{titlePopup ?? title}</h3>
            <div className="channel-description-brief">
              {descBriefHeader ?? descBrief}
            </div>
          </div>
        </div>
        <Icon className="close-icon" name="delete" onClick={closeForm} />
      </Modal.Header>
      <Modal.Content className="modalContent channelForm">
        {name !== "whatsapp" && (
          <>
            {/* First Column */}
            <div className="column column-primary">
              <h4>{channelInfo.titleContent}</h4>
              <div className={`description`}>
                {Boolean(channelInfo.longDescription) && (
                  <div>{channelInfo.longDescription}</div>
                )}
              </div>
              <div className="guide-actions">
                <a
                  className="button-secondary ui button"
                  href={`${channelInfo.stepByStepGuideLink}`}
                  target={"_blank"}
                >
                  {channelInfo.stepByStepGuideLinkTitle}
                </a>
              </div>
              <ChannelWebhook
                setWebHookURL={setWebHookLink}
                channelInfo={channelInfo}
              />

              {name === "line" && (
                <LineForm
                  webhookUrl={webHookLink}
                  errMsgList={errMsgList}
                  formInput={formInput[name] ?? {}}
                  onChange={(e) =>
                    textFieldChange(e.target.id, e.target.value, name)
                  }
                />
              )}

              {/* WeChat */}
              {name === "wechat" && (
                <WeChatForm
                  webhookUrl={webHookLink}
                  company={company}
                  errMsgList={errMsgList}
                  formInput={
                    formInput[name] ?? {
                      appId: "",
                      wechatId: "",
                      appSecret: "",
                    }
                  }
                  onChange={(e) =>
                    textFieldChange(e.target.id, e.target.value, name)
                  }
                  files={files}
                  setFiles={setFiles}
                  onUpload={uploadFiles}
                />
              )}

              {/* Twilio SMS */}
              {name === "sms" && (
                <TwilioSmsForm
                  errMsgList={errMsgList}
                  formInput={formInput[name]}
                  onChange={(id, value) => textFieldChange(id, value, name)}
                />
              )}

              {/* Twilio WhatsApp */}
              {name === "twilio_whatsapp" && (
                <TwilioWhatsAppForm
                  errMsgList={errMsgList}
                  formInput={formInput[name]}
                  onChange={(id, value) => textFieldChange(id, value, name)}
                />
              )}

              {["facebook", "instagram"].includes(name) &&
                facebookPageList.length > 0 && (
                  <FacebookForm
                    onChange={facebookSelectHandler}
                    facebookPageList={facebookPageList}
                    formInput={formInput[name]}
                  />
                )}
              {/* zapier */}
              {ZAPIER_CHANNELS.includes(name) && <ZapierForm />}
              {name === "salesforceMarketingCloud" && (
                <SalesforceMarketingCloudForm />
              )}
              {name === "make" && <MakeComForm />}
              {/* sleekflowApi */}
              {name === "sleekflowApi" && <SleekflowAPIForm />}
            </div>
            {/* Second Column */}
            {channelNeedToInstall.includes(name.toLowerCase()) && (
              <div className="column column-secondary">
                <ChannelConfirmModal
                  fileList={files}
                  facebookResponded={
                    facebookPageList && facebookPageList.length > 0
                  }
                  facebookNotStarted={
                    facebookPageList && facebookPageList.length === 0
                  }
                  setErrorMsg={setErrMsgStr}
                  onConnect={connectChannel}
                  channelInfo={channelInfo}
                  formInputs={formInput}
                />
                {/* <TermsFooter/> */}
              </div>
            )}
          </>
        )}
        {/* WhatsApp */}
        {name === "whatsapp" && (
          <ChannelWhatsApp
            channelInfo={channelInfo}
            stepByStepGuideLink={channelInfo.stepByStepGuideLink || ""}
            connectChannel={connectChannel}
            errMsgList={errMsgList}
            setErrorMsg={setErrMsgStr}
            formInput={formInput[name]}
            switchToWhatsApp={switchToOfficalWhatsApp}
            onChange={(id, value) => textFieldChange(id, value, name)}
            isPaid={state.isWhatsappPaid}
            closeForm={closeForm}
            updatedWhatsappScanStatus={updatedWhatsappScanStatus}
          />
        )}
      </Modal.Content>
    </Modal>
  );
}
