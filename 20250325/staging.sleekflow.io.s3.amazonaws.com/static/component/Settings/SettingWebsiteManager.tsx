import React, { Suspense, useCallback, useEffect, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import SettingProfilePic from "./SettingProfilePic/SettingProfilePic";
import Textarea from "react-textarea-autosize";
import BlogURLType from "../../types/BlogUrlType";
import CompanyType, { CompanyCustomFieldsType } from "../../types/CompanyType";
import { post } from "../../api/apiRequest";
import {
  POST_COMPANY_FETCH_MATADATA,
  POST_COMPANY_FIELD,
} from "../../api/apiPath";
import Helmet from "react-helmet";
import TrackingCodeScript from "../TrackingCodeScript";
import TrackingCodeColour from "../TrackingCodeColour";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";

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

export default (props: SettingWebsiteManageProp) => {
  const company = useAppSelector((s) => s.company);
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
  const [bgColor, setBgColor] = useState("rgba(48,80,140,1)");
  const [fontColor, setFontColor] = useState("rgba(255,255,255,1)");
  const [iconColor, setIconColor] = useState("rgba(48,80,140,1)");
  const loginDispatch = useAppDispatch();
  const [loading, isLoading] = useState(false);
  const [updated, isUpdated] = useState<string[]>([]);
  const flash = useFlashMessageChannel();

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

  const updateCustomLink = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const { value } = e.target;
    websiteManagerInfo.customLink[index] = value;
    updateStatusChecking("blogURLs", websiteManagerInfo.customLink.join(","));
    setWebsiteManagerInfo({
      ...websiteManagerInfo,
      customLink: websiteManagerInfo.customLink,
    });
  };

  const updateInfo = async () => {
    if (company) {
      isLoading(true);
      const blogURLs = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "blogurls"
      );
      const welcomeMessage = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "welcomemessage"
      );
      const tagLine = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatdescription"
      );
      const autoReply = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "autoreplymessage"
      );
      const customLinks = websiteManagerInfo.customLink.filter(
        (customLink) => customLink !== ""
      );
      const pageTitle = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatpagetitle"
      );
      const liveChatTitle = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatlivechattitle"
      );
      const socialConversationTitle = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() ===
          "livechatsocialconversationtitle"
      );
      const companyBackgroundColor = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() ===
          "livechatbackgroundcolor"
      );
      const companyFontColor = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatfontcolor"
      );
      const liveChatGreeting = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechatgreeting"
      );
      const liveChatIconColor = company.companyCustomFields.find(
        (companyCustomField) =>
          companyCustomField.fieldName.toLowerCase() === "livechaticoncolor"
      );
      let linkResult: BlogURLType[] = [];
      let companyUpdated: CompanyType = company;
      let param: CompanyCustomFieldsType[] = [];
      if (liveChatIconColor) {
        if (liveChatIconColor.value !== iconColor) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = liveChatIconColor;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatIconColor",
              companyCustomFieldFieldLinguals: companyCustomFieldFieldLinguals,
              type: type || "SingleLineText",
              value: iconColor,
              isVisible,
              isEditable,
            },
          ];
        }
      } else {
        if (iconColor) {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatIconColor",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: iconColor,
              isVisible: true,
              isEditable: true,
            },
          ];
        } else {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatIconColor",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: "rgba(48,80,140,1)",
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      let greetingParam: any = {
        category: "LiveChat",
        fieldName: "LiveChatGreeting",
        companyCustomFieldFieldLinguals: [],
        type: "SingleLineText",
        value: t("onboarding.field.liveChat.greeting"),
        isVisible: true,
        isEditable: true,
      };
      if (liveChatGreeting) {
        if (liveChatGreeting.value !== websiteManagerInfo.greeting) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = liveChatGreeting;
          greetingParam = {
            category: category || "LiveChat",
            fieldName: fieldName || "LiveChatGreeting",
            companyCustomFieldFieldLinguals: companyCustomFieldFieldLinguals,
            type: type || "SingleLineText",
            value: websiteManagerInfo.greeting,
            isVisible,
            isEditable,
          };
        }
      } else if (websiteManagerInfo.greeting) {
        greetingParam.value = websiteManagerInfo.greeting;
      }
      param = [...param, greetingParam];

      if (companyBackgroundColor) {
        if (companyBackgroundColor.value !== bgColor) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = companyBackgroundColor;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatBackgroundColor",
              companyCustomFieldFieldLinguals: companyCustomFieldFieldLinguals,
              type: type || "SingleLineText",
              value: bgColor,
              isVisible,
              isEditable,
            },
          ];
        }
      } else {
        if (bgColor) {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatBackgroundColor",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: bgColor,
              isVisible: true,
              isEditable: true,
            },
          ];
        } else {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatBackgroundColor",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: "rgba(48,80,140,1)",
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      if (socialConversationTitle) {
        if (
          socialConversationTitle.value !==
          websiteManagerInfo.socialConversationTitle
        ) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = socialConversationTitle;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatSocialConversationTitle",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: websiteManagerInfo.socialConversationTitle,
              isVisible,
              isEditable,
            },
          ];
        }
      } else {
        if (websiteManagerInfo.socialConversationTitle) {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatSocialConversationTitle",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: websiteManagerInfo.socialConversationTitle,
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      if (companyFontColor) {
        if (companyFontColor.value !== fontColor) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = companyFontColor;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatFontColor",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: fontColor,
              isVisible,
              isEditable,
            },
          ];
        }
      } else {
        if (fontColor) {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatFontColor",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: fontColor,
              isVisible: true,
              isEditable: true,
            },
          ];
        } else {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatFontColor",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: "rgba(255,255,255,1)",
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      if (pageTitle) {
        if (websiteManagerInfo.pageTitle !== pageTitle.value) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = pageTitle;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatPageTitle",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: websiteManagerInfo.pageTitle,
              isVisible,
              isEditable,
            },
          ];
        }
      } else {
        if (websiteManagerInfo.pageTitle) {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatPageTitle",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value:
                websiteManagerInfo.pageTitle ||
                t("onboarding.field.liveChat.pageTitle"),
              isVisible: true,
              isEditable: true,
            },
          ];
        } else {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatPageTitle",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: t("onboarding.field.liveChat.pageTitle"),
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      if (liveChatTitle) {
        if (websiteManagerInfo.liveChatTitle !== liveChatTitle.value) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = liveChatTitle;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatLiveChatTitle",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: websiteManagerInfo.liveChatTitle,
              isEditable,
              isVisible,
            },
          ];
        }
      } else {
        if (websiteManagerInfo.liveChatTitle) {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatLiveChatTitle",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: websiteManagerInfo.liveChatTitle,
              isEditable: true,
              isVisible: true,
            },
          ];
        } else {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "LiveChatLiveChatTitle",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: t("onboarding.field.liveChat.socialTitle"),
              isEditable: true,
              isVisible: true,
            },
          ];
        }
      }
      if (welcomeMessage) {
        if (websiteManagerInfo.welcomeMessage !== welcomeMessage.value) {
          const {
            category,
            isVisible,
            isEditable,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = welcomeMessage;
          param = [
            ...param,
            {
              category: category || "Messaging",
              fieldName: fieldName || "WelcomeMessage",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: websiteManagerInfo.welcomeMessage,
              isEditable,
              isVisible,
            },
          ];
        }
      } else {
        if (websiteManagerInfo.welcomeMessage) {
          param = [
            ...param,
            {
              category: "Messaging",
              fieldName: "WelcomeMessage",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: websiteManagerInfo.welcomeMessage,
              isEditable: true,
              isVisible: true,
            },
          ];
        }
      }
      if (tagLine) {
        if (websiteManagerInfo.tagline !== tagLine.value) {
          const { category, fieldName, companyCustomFieldFieldLinguals, type } =
            tagLine;
          param = [
            ...param,
            {
              category: category || "LiveChat",
              fieldName: fieldName || "LiveChatDescription",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: websiteManagerInfo.tagline,
              isEditable: true,
              isVisible: true,
            },
          ];
        } else {
          if (websiteManagerInfo.tagline) {
            param = [
              ...param,
              {
                category: "LiveChat",
                fieldName: "LiveChatDescription",
                companyCustomFieldFieldLinguals: [],
                type: "SingleLineText",
                value: websiteManagerInfo.tagline,
                isEditable: true,
                isVisible: true,
              },
            ];
          }
        }
      }
      if (customLinks && customLinks.length > 0) {
        for (let i = 0; i < customLinks.length; i++) {
          const result: BlogURLType = await post(POST_COMPANY_FETCH_MATADATA, {
            param: { url: customLinks[i] },
          });
          linkResult = [...linkResult, result];
        }
        const linkResultStr = JSON.stringify(linkResult);
        if (blogURLs) {
          if (linkResultStr !== blogURLs.value) {
            const {
              category,
              isVisible,
              isEditable,
              fieldName,
              companyCustomFieldFieldLinguals,
              type,
            } = blogURLs;
            param = [
              ...param,
              {
                category: category || "LiveChat",
                fieldName: fieldName || "BlogURLs",
                companyCustomFieldFieldLinguals:
                  companyCustomFieldFieldLinguals || [],
                type: type || "BlogURLs",
                value: linkResultStr,
                isVisible,
                isEditable,
              },
            ];
          }
        } else {
          param = [
            ...param,
            {
              category: "LiveChat",
              fieldName: "BlogURLs",
              companyCustomFieldFieldLinguals: [],
              type: "BlogURLs",
              value: linkResultStr,
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      if (autoReply) {
        if (websiteManagerInfo.autoReply !== autoReply.value) {
          const {
            category,
            isEditable,
            isVisible,
            fieldName,
            companyCustomFieldFieldLinguals,
            type,
          } = autoReply;
          param = [
            ...param,
            {
              category: category || "Messaging",
              fieldName: fieldName || "AutoReplyMessage",
              companyCustomFieldFieldLinguals:
                companyCustomFieldFieldLinguals || [],
              type: type || "SingleLineText",
              value: websiteManagerInfo.autoReply,
              isVisible,
              isEditable,
            },
          ];
        }
      } else {
        if (websiteManagerInfo.autoReply) {
          param = [
            ...param,
            {
              category: "Messaging",
              fieldName: "AutoReplyMessage",
              companyCustomFieldFieldLinguals: [],
              type: "SingleLineText",
              value: websiteManagerInfo.autoReply,
              isVisible: true,
              isEditable: true,
            },
          ];
        }
      }
      if (param.length > 0) {
        companyUpdated = await post(POST_COMPANY_FIELD, {
          param,
        });
        isUpdated([]);
        loginDispatch({ type: "UPDATE_COMPANY_INFO", company: companyUpdated });
        flash(t("flash.settings.liveChat.saved"));
      }
      isLoading(false);
    }
  };
  const updateStatusChecking = (fieldName: string, updatedValue: string) => {
    if (fieldStatusTracking[fieldName].originalValue !== updatedValue) {
      if (updated.indexOf(fieldName) === -1) {
        isUpdated([...updated, fieldName]);
      }
    } else {
      const foundIndex = updated.indexOf(fieldName);
      if (foundIndex > -1) {
        isUpdated([
          ...updated.slice(0, foundIndex),
          ...updated.slice(foundIndex + 1),
        ]);
      }
    }
  };
  const greetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    updateStatusChecking("liveChatGreeting", value);
    setWebsiteManagerInfo({ ...websiteManagerInfo, greeting: value });
  };
  const taglineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    updateStatusChecking("tagLine", value);
    setWebsiteManagerInfo({ ...websiteManagerInfo, tagline: value });
  };

  const welcomeMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    updateStatusChecking("welcomeMessage", value);
    setWebsiteManagerInfo({ ...websiteManagerInfo, welcomeMessage: value });
  };
  const autoReplyMessageChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    updateStatusChecking("autoReply", value);
    // isUpdated(fieldStatusTracking['autoReply'].originalValue !== value);
    setWebsiteManagerInfo({ ...websiteManagerInfo, autoReply: value });
  };
  const pageTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const { value } = e.target;
    updateStatusChecking("pageTitle", value);
    setWebsiteManagerInfo({ ...websiteManagerInfo, pageTitle: value });
  };
  const socialConversationTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const { value } = e.target;
    updateStatusChecking("socialConversationTitle", value);
    setWebsiteManagerInfo({
      ...websiteManagerInfo,
      socialConversationTitle: value,
    });
  };
  const conversationTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const { value } = e.target;
    updateStatusChecking("liveChatTitle", value);
    setWebsiteManagerInfo({ ...websiteManagerInfo, liveChatTitle: value });
  };
  const colorChange = useCallback((colorCode: string, colorPos: string) => {
    if (colorPos === "bg") {
      updateStatusChecking("companyBackgroundColor", colorCode);
      // isUpdated(fieldStatusTracking['companyBackgroundColor'].originalValue !== colorCode)
      setBgColor(colorCode);
    } else if (colorPos === "fontColor") {
      updateStatusChecking("companyFontColor", colorCode);
      // isUpdated(fieldStatusTracking['companyFontColor'].originalValue !== colorCode)
      setFontColor(colorCode);
    } else if (colorPos === "iconColor") {
      updateStatusChecking("liveChatIconColor", colorCode);
      // isUpdated(fieldStatusTracking['liveChatIconColor'].originalValue !== colorCode)
      setIconColor(colorCode);
    }
  }, []);
  const pageTitle = t("nav.menu.settings.liveChat");

  const TrackingCodeColour = React.lazy(() => import("../TrackingCodeColour"));

  return (
    <div className="website-management content no-scrollbars">
      <Helmet title={t("nav.common.title", { page: pageTitle })} />
      <div className="grid-header">
        <div className="status-text">
          <span className="title">{t("settings.liveChat.title")}</span>
        </div>
        <div className="action-btn">
          <a
            target="_blank"
            className={`ui button ${updated.length === 0 ? "" : "disable"}`}
            href={`https://preview.sleekflow.io?companyId=${
              (company && company.id) || ""
            }`}
          >
            {t("settings.liveChat.button.preview")}
          </a>
          <Button
            className="button1"
            disabled={updated.length === 0}
            loading={loading}
            onClick={updateInfo}
            content={t("settings.liveChat.button.save")}
          />
        </div>
      </div>
      <span className="sub-title">{t("settings.liveChat.subheader")}</span>
      <div className="company-info container">
        <div className="header">{t("settings.liveChat.fieldset.basic")}</div>
        <div className="content">
          <div className="company content">
            <div className="header">
              {t("settings.liveChat.field.pic.label")}
            </div>
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
            />
          </div>
          <div className="color-settings content">
            <div className="color-setting">
              <div className="header">
                {t("settings.liveChat.field.bgColor.label")}
              </div>
              <Suspense fallback={"loading..."}>
                <TrackingCodeColour
                  colorPos={"bg"}
                  setPropsColor={colorChange}
                  currentColor={bgColor}
                />
              </Suspense>
            </div>
            <div className="color-setting">
              <div className="header">
                {t("settings.liveChat.field.fontColor.label")}
              </div>
              <Suspense fallback={"loading..."}>
                <TrackingCodeColour
                  colorPos={"fontColor"}
                  setPropsColor={colorChange}
                  currentColor={fontColor}
                />
              </Suspense>
            </div>
            <div className="color-setting">
              <div className="header">
                {t("settings.liveChat.field.iconColor.label")}
              </div>
              <Suspense fallback={"loading..."}>
                <TrackingCodeColour
                  colorPos={"iconColor"}
                  setPropsColor={colorChange}
                  currentColor={iconColor}
                />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="content">
          <div className="content">
            <div className="header">
              {t("settings.liveChat.field.intro.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.intro.hint")}
            </div>
          </div>
          <div className="content">
            <div className="header">
              {t("settings.liveChat.field.code.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.code.hint")}
            </div>
          </div>
        </div>
        <div className="content">
          <div className="content">
            <Textarea
              minRows={5}
              maxRows={5}
              placeholder={t("settings.liveChat.field.intro.placeholder", {
                name: (company && company.companyName) || "",
              })}
              value={websiteManagerInfo.tagline}
              onChange={taglineChange}
            />
          </div>
          <div className="content">
            <TrackingCodeScript
              bgColor={bgColor}
              fontColor={fontColor}
              showHeader={false}
              showActionBtn={false}
            />
          </div>
        </div>
      </div>
      <div className="container greeting-management">
        <div className="header">{t("settings.liveChat.fieldset.greeting")}</div>
        <div className="content">
          <div className="welcome-message content">
            <div className="header">
              {t("settings.liveChat.field.welcome.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.welcome.hint")}
            </div>
          </div>
          <div className="auto-reply content">
            <div className="header">
              {t("settings.liveChat.field.autoreply.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.autoreply.hint")}
            </div>
          </div>
        </div>
        <div className="content">
          <div className="content">
            <Textarea
              minRows={5}
              maxRows={5}
              placeholder={t("settings.liveChat.field.welcome.placeholder")}
              value={websiteManagerInfo.welcomeMessage}
              onChange={welcomeMessageChange}
            />
          </div>
          <div className="content">
            <Textarea
              minRows={5}
              maxRows={5}
              placeholder={t("settings.liveChat.field.autoreply.placeholder")}
              value={websiteManagerInfo.autoReply}
              onChange={autoReplyMessageChange}
            />
          </div>
        </div>
      </div>
      <div className="container content-management">
        <div className="header">
          {t("settings.liveChat.field.contentManagement.label")}
        </div>
        <div className="sub-header">
          {t("settings.liveChat.field.contentManagement.subheader")}
        </div>
        {websiteManagerInfo.customLink.map((link, index) => (
          <Form.Input
            key={index}
            placeholder={t("settings.liveChat.field.customLink.label", {
              n: index + 1,
            })}
            value={link}
            onChange={(e) => updateCustomLink(e, index)}
          />
        ))}
      </div>
      <div className="container title-customisation">
        <div className="header">{t("settings.liveChat.field.title.label")}</div>
        <div className="sub-header">
          {t("settings.liveChat.field.title.hint")}
        </div>
        <div className="content">
          <div className="content">
            <div className="header">
              {t("settings.liveChat.field.greeting.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.greeting.hint")}
            </div>
            <Form.Input
              value={websiteManagerInfo.greeting}
              placeholder={t("onboarding.field.liveChat.greeting")}
              onChange={greetingChange}
            ></Form.Input>
          </div>
          <div className="content">
            <div className="header">
              {t("settings.liveChat.field.socialTitle.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.socialTitle.hint")}
            </div>
            <Form.Input
              placeholder={t("onboarding.field.liveChat.socialTitle")}
              value={websiteManagerInfo.socialConversationTitle}
              onChange={socialConversationTitleChange}
            />
          </div>
        </div>
        <div className="content">
          <div className="content">
            <div className="header">
              {t("settings.liveChat.field.chatTitle.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.chatTitle.hint")}
            </div>
            <Form.Input
              placeholder={t("settings.liveChat.field.chatTitle.placeholder")}
              value={websiteManagerInfo.liveChatTitle}
              onChange={conversationTitleChange}
            />
          </div>
          <div className="content">
            <div className="header">
              {t("settings.liveChat.field.pageTitle.label")}
            </div>
            <div className="sub-header">
              {t("settings.liveChat.field.pageTitle.hint")}
            </div>
            <Form.Input
              placeholder={t("settings.liveChat.field.pageTitle.placeholder")}
              value={websiteManagerInfo.pageTitle}
              onChange={pageTitleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
