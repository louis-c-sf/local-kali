import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  Button,
  Checkbox,
  Dimmer,
  Dropdown,
  Form,
  Image,
  Loader,
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import {
  POST_360DIALOG_OPT_IN,
  POST_OPT_IN,
  PUT_360DIALOG_OPT_IN,
} from "../../../api/apiPath";
import {
  postWithExceptions,
  putMethodWithExceptions,
} from "../../../api/apiRequest";
import { useFlashMessageChannel } from "../../../component/BannerMessage/flashBannerMessage";
import TemplateQuickReplyButton from "../../../component/Settings/SettingTemplates/TemplateQuickReplyButton";
import useRouteConfig from "../../../config/useRouteConfig";
import { LanguagesMapping } from "../../../types/WhatsappTemplateResponseType";
import { useWhatsappTemplates } from "./useWhatsappTemplates";
import { PreviewContent } from "../../../component/Settings/SettingTemplates/PreviewContent";
import { isDemoPlan } from "../../../types/PlanSelectionType";
import { useAppSelector } from "../../../AppRootContext";
import { WhatsApp360DialogConfigsType } from "../../../types/CompanyType";
import styles from "./SettingOptIn.module.css";
import BroadcastChannel from "../../../component/Broadcast/BroadcastChannel/BroadcastChannel";
import { ChannelTabType } from "../../../component/Settings/types/SettingTypes";
import useCompanyChannels, {
  iconFactory,
} from "../../../component/Chat/hooks/useCompanyChannels";
import get360DialogChannel from "../../../features/Whatsapp360/API/get360DialogChannel";
import useInitializeTabs from "./useInitializeTabs";
import {
  NormalizedWhatsAppTemplateType,
  OptInType,
} from "../../../features/Whatsapp360/models/OptInType";
import fetchOptIn from "api/WhatsApp360Dialog/fetchOptIn";
import { useWhatsappTwilioChat } from "features/WhatsappTwilio/usecases/Inbox/useWhatsappTwilioChat";
import submitWabaOptIn from "api/CloudAPI/submitWabaOptIn";
import fetchCloudAPIWaba from "api/Company/fetchCloudAPIWaba";
import { WhatsappCloudAPIConfigType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPIConfigType";
import { isCloudAPIChannelType } from "component/Settings/SettingTemplates/SettingTemplates";
import { WhatsappChannelType } from "component/Chat/Messenger/types";
import {
  extractTemplateName,
  getTemplateResponseKey,
} from "lib/utility/getTemplateResponseKey";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

export default function SettingOptIn() {
  useRequireRBAC([PERMISSION_KEY.channelOptInManage]);

  const isDisabledSelection = useAppSelector((s) => isDemoPlan(s.currentPlan));
  const [loading, isLoading] = useState(true);
  const [toggleLoading, isToggleLoading] = useState(false);
  const [selectedOptIn, setSelectedOptIn] = useState<OptInType>({
    isOptInOn: false,
  });
  const [saveOptInLoading, setSaveOptInLoading] = useState(false);
  const flash = useFlashMessageChannel();
  const [originalMessage, setOriginalMessage] = useState("");
  const [optInTemplates, setOptInTemplates] =
    useState<NormalizedWhatsAppTemplateType>({});
  const [channelTabs, setChannelTabs] = useState<ChannelTabType[]>([]);
  const [selectedChannelTab, setSelectedChannelTab] =
    useState<ChannelTabType>();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  const { fetchWhatsappTemplates, fetch360Templates, fetchCloudApiTemplates } =
    useWhatsappTemplates();
  const twilioChat = useWhatsappTwilioChat();

  const companyChannels = useCompanyChannels();
  const companyId = useAppSelector((s) => s.company?.id);
  const { fetchTabs, hasMultipleWhatsappProviders } = useInitializeTabs();
  useEffect(() => {
    if (!companyId) {
      return;
    }
    async function initializeTabs() {
      const channels = await fetchTabs();
      setChannelTabs(channels);
      if (channels.length > 0) {
        setSelectedChannelTab(channels[0]);
      }
    }

    try {
      initializeTabs();
    } catch (e) {
      console.error(`fetch360DialogWaba error ${e}`);
    }
  }, [companyId]);
  const selectedTemplateKey =
    selectedOptIn.readMoreTemplateId &&
    selectedChannelTab?.channelType !== "whatsappcloudapi"
      ? selectedOptIn.readMoreTemplateId
      : selectedOptIn.templateName ?? Object.keys(optInTemplates)[0];
  const key = getTemplateResponseKey({
    templateName: selectedTemplateKey,
    language: selectedOptIn.language ?? "",
    channel: selectedChannelTab?.channelType as WhatsappChannelType,
  });
  const selectedTemplate =
    optInTemplates[key] ?? optInTemplates[selectedTemplateKey] ?? {};

  const defaultLangOption = selectedTemplate.translations
    ? Object.keys(selectedTemplate.translations).find(
        (lang) =>
          (selectedOptIn.readMoreTemplateMessage ??
            selectedOptIn.templateMessageContent) ===
          selectedTemplate.translations[lang]?.content
      ) ?? Object.keys(selectedTemplate.translations)[0]
    : "en";
  useEffect(() => {
    async function optInHandling() {
      try {
        if (selectedChannelTab?.isCloudAPI && selectedChannelTab?.ids?.[0]) {
          isLoading(true);
          const [optIn, templates] = await Promise.all([
            fetchCloudAPIWaba(),
            fetchCloudApiTemplates(
              selectedChannelTab?.wabaId,
              false,
              false,
              true
            ),
          ]);
          const matchedConfig = optIn.whatsappCloudApiByWabaIdConfigs.find(
            (config) => config.wabaAccountId === selectedChannelTab.wabaId
          );
          const cloudApiConfigFound =
            matchedConfig?.whatsappCloudApiConfigs?.[0];
          const optInConfigFound =
            matchedConfig?.whatsappCloudApiConfigs?.[0]?.optInConfig;
          const [firstTemplateId] = Object.keys(templates);
          const lang =
            optInConfigFound?.language ??
            (firstTemplateId ? templates[firstTemplateId].languages[0] : "");
          if (cloudApiConfigFound) {
            setSelectedOptIn({
              isOptInOn: cloudApiConfigFound.isOptInEnable,
              templateName:
                optInConfigFound?.templateName ??
                extractTemplateName({
                  templateName: firstTemplateId,
                  language: lang,
                  channel: "whatsappcloudapi",
                }),
              language: lang,
              templateMessageContent:
                optInConfigFound?.templateMessageContent ?? "",
              readMoreTemplateButtonMessage:
                optInConfigFound?.readMoreTemplateButtonMessage ?? "",
            });
          } else {
            setSelectedOptIn({
              isOptInOn: false,
            });
          }
          setOptInTemplates(templates);
          isLoading(false);
        } else if (
          selectedChannelTab &&
          !selectedChannelTab?.is360Dialog &&
          !selectedChannelTab?.isCloudAPI &&
          twilioChat.accountSid
        ) {
          isLoading(true);
          const [optIn, templates] = await Promise.all([
            fetchOptIn(),
            fetchWhatsappTemplates({
              accountSID: twilioChat.accountSid,
              isOptIn: true,
            }),
          ]);
          setOriginalMessage(optIn?.readMoreTemplateMessage ?? "");
          if (optIn.isOptInOn) {
            const template = optIn?.readMoreTemplateId
              ? templates[optIn?.readMoreTemplateId]
              : templates[Object.keys(templates)[0]];
            if (
              !Object.keys(template).some(
                (lang) =>
                  template[lang]?.content === optIn?.readMoreTemplateMessage
              )
            ) {
              const templateName = Object.keys(templates).find((name) =>
                Object.keys(templates[name].translations).some(
                  (lang) =>
                    templates[name].translations[lang].content ===
                    optIn?.readMoreTemplateMessage
                )
              );
              const lang =
                optIn?.language ?? Object.keys(template.translations)[0];
              if (templateName) {
                setSelectedOptIn({
                  ...optIn,
                  readMoreTemplateId: templateName,
                  ReadMoreMessageContentSid:
                    template.translations[lang].contentSid ?? "",
                });
              }
            } else {
              setSelectedOptIn(optIn);
            }
          } else {
            setSelectedOptIn(optIn);
          }
          setOptInTemplates(templates);
          isLoading(false);
        } else if (
          selectedChannelTab?.is360Dialog &&
          selectedChannelTab?.ids?.[0]
        ) {
          isLoading(true);
          const templates = await fetch360Templates(
            selectedChannelTab?.ids[0],
            true
          );
          setOptInTemplates(templates);
          if (selectedChannelTab?.config?.[0]?.optInConfig) {
            setSelectedOptIn({
              isOptInOn: selectedChannelTab?.config?.[0]?.isOptInEnable,
              readMoreTemplateId:
                selectedChannelTab?.config?.[0]?.optInConfig?.templateName,
              readMoreTemplateMessage:
                selectedChannelTab?.config?.[0]?.optInConfig
                  ?.templateMessageContent,
              ...selectedChannelTab?.config?.[0]?.optInConfig,
            });
          }
          isLoading(false);
        }
      } catch (error) {
        console.error(`fetchInfo error ${error}`);
      }
    }
    if (selectedChannelTab) {
      optInHandling();
    }
  }, [twilioChat.accountSid, selectedChannelTab]);

  function updateSelectedTemplateId(value: string) {
    const selectedTemplate = optInTemplates[value];
    const language = Object.keys(selectedTemplate.translations)[0];
    const name = extractTemplateName({
      templateName: value,
      language: language,
      channel: selectedChannelTab?.channelType as WhatsappChannelType,
    });
    setSelectedOptIn({
      ...selectedOptIn,
      readMoreTemplateId: name,
      readMoreTemplateMessage: selectedTemplate.translations[language].content,
      language,
      readMoreTemplateButtonMessage:
        selectedTemplate.translations[language].buttons?.[0]?.text ?? "",
      templateMessageContent: selectedTemplate.translations[language].content,
      templateName: name,
      templateNamespace: selectedTemplate.namespace ?? "",
      ReadMoreMessageContentSid:
        selectedTemplate.translations[language].contentSid ?? "",
    });
  }

  async function updateOptInOption() {
    const updatedOptInStatus = !selectedOptIn.isOptInOn;

    if (Object.keys(optInTemplates).length === 0) {
      console.error("No templates found");
      return;
    }
    try {
      isToggleLoading(true);
      if (selectedChannelTab?.isCloudAPI && selectedChannelTab?.ids?.[0]) {
        const defaultTemplateId = Object.keys(optInTemplates)[0];
        const selectedTemplateId =
          getTemplateResponseKey({
            language: selectedOptIn.language,
            templateName: selectedOptIn.templateName ?? "",
            channel: "whatsappcloudapi",
          }) ?? defaultTemplateId;
        const selectedTemplate =
          optInTemplates[selectedTemplateId] ??
          optInTemplates[defaultTemplateId];
        const selectedLang = Object.keys(
          selectedTemplate.translations ?? {}
        )[0];
        const updatedOptIn = {
          ...selectedOptIn,
          isOptInOn: updatedOptInStatus,
          readMoreTemplateId: selectedTemplateId,
          readMoreTemplateMessage:
            selectedTemplate.translations[selectedLang]?.content ?? "",
        };
        const name = extractTemplateName({
          templateName: updatedOptIn.templateName ?? "",
          language: updatedOptIn.language ?? "",
          channel: selectedChannelTab.channelType as WhatsappChannelType,
        });
        const param = updatedOptIn.isOptInOn
          ? {
              wabaId: selectedChannelTab.wabaId,
              isOptInEnable: updatedOptIn.isOptInOn,
              templateName: name,
              templateLanguage: updatedOptIn.language,
            }
          : {
              wabaId: selectedChannelTab.wabaId,
              isOptInEnable: updatedOptIn.isOptInOn,
            };
        setSelectedOptIn(updatedOptIn);
        await submitWabaOptIn(param);
      } else if (!selectedChannelTab?.is360Dialog) {
        const selectedTemplateId =
          selectedOptIn.readMoreTemplateId ?? Object.keys(optInTemplates)[0];
        const selectedLang = Object.keys(
          optInTemplates[selectedTemplateId].translations
        )[0];
        let sidParam = {};
        if (
          optInTemplates[selectedTemplateId].translations[selectedLang]
            .contentSid
        ) {
          sidParam = {
            ReadMoreMessageContentSid:
              optInTemplates[selectedTemplateId].translations[selectedLang]
                .contentSid,
          };
        }
        const updatedOptIn = {
          ...selectedOptIn,
          isOptInOn: updatedOptInStatus,
          readMoreTemplateId: selectedTemplateId,
          readMoreTemplateMessage:
            optInTemplates[selectedTemplateId].translations[selectedLang]
              .content,
          ...sidParam,
        };
        setSelectedOptIn(updatedOptIn);
        await postWithExceptions(POST_OPT_IN, {
          param: {
            ...updatedOptIn,
          },
        });
      } else if (selectedChannelTab?.is360Dialog && selectedChannelTab.ids) {
        setSelectedOptIn({ ...selectedOptIn, isOptInOn: updatedOptInStatus });
        await putMethodWithExceptions(
          PUT_360DIALOG_OPT_IN.replace(
            "{id}",
            String(selectedChannelTab.ids[0])
          ),
          {
            param: {
              isOptInEnable: updatedOptInStatus,
            },
          }
        );
      }
      if (updatedOptInStatus) {
        flash(t("flash.optIn.optInStatus.on"));
      } else {
        flash(t("flash.optIn.optInStatus.off"));
      }
    } catch (error) {
      console.error(`POST_OPT_IN error ${error}`);
    } finally {
      isToggleLoading(false);
    }
  }

  const templateIDOptions = Object.keys(optInTemplates).map((t, index) => {
    return {
      value: t,
      text: t,
      key: index,
    };
  });

  function updateSelectedContent(value: string) {
    if (selectedOptIn.readMoreTemplateId) {
      setSelectedOptIn({
        ...selectedOptIn,
        readMoreTemplateMessage:
          optInTemplates[selectedOptIn.readMoreTemplateId].translations[value]
            .content,
        templateMessageContent:
          optInTemplates[selectedOptIn.readMoreTemplateId].translations[value]
            .content,
        language: value,
        readMoreTemplateButtonMessage:
          optInTemplates[selectedOptIn.readMoreTemplateId].translations[value]
            .buttons?.[0]?.text ?? "",
      });
    } else if (selectedOptIn.templateName) {
      setSelectedOptIn({
        ...selectedOptIn,
        templateMessageContent:
          optInTemplates[selectedOptIn.templateName].translations[value]
            .content,
        readMoreTemplateButtonMessage:
          optInTemplates[selectedOptIn.templateName].translations[value]
            .buttons?.[0]?.text ?? "",
        language: value,
      });
    }
  }

  async function saveOptInSetting() {
    setSaveOptInLoading(true);
    try {
      if (selectedChannelTab?.isCloudAPI) {
        await submitWabaOptIn({
          wabaId: selectedChannelTab.wabaId,
          templateName: extractTemplateName({
            templateName: selectedOptIn.templateName ?? "",
            language: selectedOptIn.language ?? "",
            channel: selectedChannelTab.channelType as WhatsappChannelType,
          }),
          templateLanguage: selectedOptIn.language ?? "",
        });
      } else if (!selectedChannelTab?.is360Dialog) {
        let sidParam = {};
        if (selectedOptIn.ReadMoreMessageContentSid) {
          sidParam = {
            ReadMoreMessageContentSid: selectedOptIn.ReadMoreMessageContentSid,
          };
        }
        await postWithExceptions(POST_OPT_IN, {
          param: {
            isOptInOn: selectedOptIn.isOptInOn,
            readMoreTemplateId: selectedOptIn.readMoreTemplateId,
            readMoreTemplateMessage: selectedOptIn.readMoreTemplateMessage,
            ...sidParam,
          },
        });
      } else if (selectedChannelTab?.is360Dialog && selectedChannelTab?.ids) {
        await postWithExceptions(
          POST_360DIALOG_OPT_IN.replace(
            "{id}",
            String(selectedChannelTab.ids[0])
          ),
          {
            param: {
              optInConfig: {
                language: selectedOptIn.language,
                readMoreTemplateButtonMessage:
                  selectedOptIn.readMoreTemplateButtonMessage,
                templateMessageContent: selectedOptIn.templateMessageContent,
                templateName: extractTemplateName({
                  templateName: selectedOptIn.templateName ?? "",
                  language: selectedOptIn.language ?? "",
                  channel:
                    selectedChannelTab.channelType as WhatsappChannelType,
                }),
                templateNamespace: selectedOptIn.templateNamespace,
              },
            },
          }
        );
      }
      setSaveOptInLoading(false);
      setOriginalMessage(selectedOptIn.readMoreTemplateMessage ?? "");
      flash(t("flash.optIn.optInStatus.updated"));
    } catch (error) {
      console.error(`POST_OPT_IN error ${error}`);
    }
  }
  const langOptions = Object.keys(optInTemplates)
    .filter((t) => t === key)
    .map((t) => {
      return Object.keys(optInTemplates[t].translations).map((lang, index) => ({
        value: lang,
        text: LanguagesMapping.find((l) => l.value === lang)?.label,
        key: index,
      }));
    })
    .flat(1);
  const isUpdated = selectedOptIn?.readMoreTemplateMessage !== originalMessage;

  function updateSelectedChannel(channel: ChannelTabType) {
    if (channel.channel !== selectedChannelTab?.channel) {
      setSelectedChannelTab(channel);
    }
  }

  const whatsapp360DialogChannel = get360DialogChannel(
    selectedChannelTab,
    companyChannels || []
  );

  const cloudAPIChannels =
    selectedChannelTab && isCloudAPIChannelType(selectedChannelTab)
      ? selectedChannelTab.config.filter(
          (c) => c.messagingHubWabaId === selectedChannelTab.wabaId
        )
      : undefined;

  return (
    <div className={"opt-in main-primary-column content"}>
      <div className="ui form">
        <div className="opt-in-header">
          <div className="column">
            <div className="header">
              <span>{t("settings.optIn.header")}</span>
            </div>
            <div className="subHeader">
              {Object.keys(optInTemplates).length === 0 && !loading ? (
                <>
                  <Trans i18nKey={"settings.optIn.noTemplate.label"}>
                    There are currently no message templates created for opt-in
                    buttons. Create your first template to allow opt-in button
                    under
                    <Link to={"/settings/templates"} className="templatesLink">
                      Template Manager
                    </Link>
                  </Trans>
                  <br />
                  <Trans i18nKey={"settings.optIn.noTemplate.info"}>
                    Learn more about how opt-in button works
                    <a
                      className="link"
                      rel="noreferrer noopener"
                      target="_blank"
                      href="https://youtu.be/leT_x9DcaHE"
                    >
                      here
                    </a>
                    .
                  </Trans>
                </>
              ) : (
                <Trans i18nKey={"settings.optIn.subHeader"}>
                  Automatically re-send the last undelivered message with opt-in
                  button.
                  <a
                    className="link"
                    rel="noreferrer noopener"
                    target="_blank"
                    href="https://youtu.be/leT_x9DcaHE"
                  >
                    See how it works.
                  </a>
                </Trans>
              )}
            </div>
            {hasMultipleWhatsappProviders && (
              <div className={styles.content}>
                <div className={styles.channelTabs}>
                  {channelTabs.map((channel, index) => (
                    <BroadcastChannel
                      updatedSelectedChannel={() =>
                        updateSelectedChannel(channel)
                      }
                      isSelected={
                        channel.channel === selectedChannelTab?.channel
                      }
                      index={index}
                      isError={false}
                      channelName={channel.channel}
                      iconFactory={
                        channel.wabaId && iconFactory("whatsapp360dialog")
                      }
                    />
                  ))}
                </div>
                {((selectedChannelTab?.is360Dialog &&
                  whatsapp360DialogChannel?.configs) ||
                  (selectedChannelTab?.isCloudAPI && cloudAPIChannels)) && (
                  <div className={styles.numberWrapper}>
                    <div className={styles.label}>
                      {t("form.channelsIncluded")}
                    </div>
                    <div className={styles.list}>
                      {(
                        whatsapp360DialogChannel?.configs || cloudAPIChannels
                      )?.map(
                        (
                          c:
                            | WhatsApp360DialogConfigsType
                            | WhatsappCloudAPIConfigType
                        ) => (
                          <div className={styles.channel}>
                            <Image src={iconFactory("whatsapp360dialog")} />
                            <div className={styles.name}>{c.channelName}</div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="column">
            <div className="preview"></div>
          </div>
        </div>
        <Dimmer.Dimmable dimmed className={styles.loadingWrapper}>
          {loading ? (
            <Dimmer active={loading} inverted>
              <Loader inverted />
            </Dimmer>
          ) : (
            <div>
              {Object.keys(optInTemplates).length > 0 && (
                <div className="opt-in-header">
                  <div className="column">
                    <Form.Field>
                      <label>{t("settings.optIn.status.label")}</label>
                      <div className="opt-in-field">
                        <Checkbox
                          className="toggle-checkbox"
                          toggle
                          fitted
                          checked={selectedOptIn?.isOptInOn}
                          onChange={updateOptInOption}
                        />
                        <label
                          className={`status-${
                            selectedOptIn?.isOptInOn ? "on" : "off"
                          }`}
                        >
                          {selectedOptIn?.isOptInOn
                            ? t("settings.optIn.status.on")
                            : t("settings.optIn.status.off")}
                        </label>
                      </div>
                    </Form.Field>

                    {!toggleLoading && (
                      <>
                        {selectedOptIn.isOptInOn && (
                          <>
                            <div className="row">
                              <div className="column">
                                <Form.Field>
                                  <label>
                                    {t("settings.optIn.registered.label")}
                                  </label>
                                  <Dropdown
                                    options={templateIDOptions}
                                    scrolling
                                    disabled={isDisabledSelection}
                                    defaultValue={
                                      selectedOptIn?.readMoreTemplateId ??
                                      selectedOptIn?.templateName
                                    }
                                    value={getTemplateResponseKey({
                                      templateName:
                                        selectedOptIn?.templateName ??
                                        selectedOptIn?.readMoreTemplateId ??
                                        "",
                                      language: selectedOptIn.language ?? "",
                                      channel:
                                        selectedChannelTab?.channelType as WhatsappChannelType,
                                    })}
                                    onChange={(_, data) =>
                                      updateSelectedTemplateId(
                                        data.value as string
                                      )
                                    }
                                  />
                                </Form.Field>
                              </div>
                              <div className="column">
                                <Form.Field>
                                  <label>
                                    {t("settings.optIn.language.label")}
                                  </label>
                                  <Dropdown
                                    options={langOptions}
                                    defaultValue={defaultLangOption}
                                    disabled={isDisabledSelection}
                                    value={
                                      selectedChannelTab?.isCloudAPI
                                        ? selectedOptIn.language
                                        : selectedOptIn.readMoreTemplateId &&
                                          selectedTemplate.translations
                                        ? Object.keys(
                                            selectedTemplate.translations
                                          ).find(
                                            (t) =>
                                              selectedTemplate.translations[t]
                                                .content ===
                                              selectedOptIn.readMoreTemplateMessage
                                          ) ?? defaultLangOption
                                        : defaultLangOption
                                    }
                                    onChange={(_, data) =>
                                      updateSelectedContent(
                                        data.value as string
                                      )
                                    }
                                  />
                                </Form.Field>
                              </div>
                            </div>
                            <div className="row">
                              <div className="column">
                                <span className="info-text">
                                  <Trans
                                    i18nKey={
                                      "settings.optIn.registered.infoText"
                                    }
                                  >
                                    Please choose from any templates that were
                                    previously approved with buttons.
                                    <a
                                      className="link"
                                      rel="noreferrer noopener"
                                      target="_blank"
                                      href={routeTo(
                                        selectedChannelTab?.is360Dialog
                                          ? "/settings/templates"
                                          : "/settings/templates/create",
                                        true
                                      )}
                                    >
                                      Register a new template →
                                    </a>
                                  </Trans>
                                </span>
                              </div>
                              <div className="column"></div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <div className="column">
                    <div className="preview"></div>
                  </div>
                </div>
              )}
              {toggleLoading ? (
                <Dimmer.Dimmable dimmed className={styles.loadingWrapper}>
                  <Dimmer active={toggleLoading} inverted>
                    <Loader inverted />
                  </Dimmer>
                </Dimmer.Dimmable>
              ) : (
                <>
                  {selectedOptIn.isOptInOn && (
                    <>
                      <div className="content">
                        <div className="container">
                          <div className="ui form">
                            <div className="template-button">
                              <Form.Field>
                                <label>
                                  {t("settings.template.form.buttonType.label")}
                                </label>
                                <Form.Input
                                  disabled
                                  value={t(
                                    "settings.template.buttonType.quickReply.text"
                                  )}
                                />
                              </Form.Field>
                            </div>
                            <div className="ui form languages">
                              <Form.Field className="language-field">
                                <label>
                                  {t("settings.template.form.language.label")}
                                </label>
                                <Dropdown
                                  search
                                  disabled={true}
                                  onChange={undefined}
                                  scrolling
                                  options={langOptions}
                                  defaultValue={defaultLangOption}
                                  value={
                                    selectedOptIn.language ?? defaultLangOption
                                  }
                                />
                              </Form.Field>
                              <Form.Field>
                                <label>
                                  {t("settings.template.form.message.label")}
                                </label>
                                <textarea
                                  rows={10}
                                  placeholder={t(
                                    "settings.template.form.message.placeholder",
                                    { interpolation: { skipOnVariables: true } }
                                  )}
                                  disabled={true}
                                  readOnly={true}
                                  value={
                                    selectedTemplate?.translations &&
                                    selectedTemplate?.translations[
                                      selectedOptIn.language ??
                                        defaultLangOption
                                    ]
                                      ? selectedTemplate?.translations[
                                          selectedOptIn.language ??
                                            defaultLangOption
                                        ]?.content
                                      : ""
                                  }
                                  onChange={undefined}
                                />
                                {!selectedChannelTab?.is360Dialog &&
                                  !selectedChannelTab?.isCloudAPI && (
                                    <div className="reminder">
                                      {t(
                                        "settings.template.form.message.reminder",
                                        {
                                          interpolation: {
                                            skipOnVariables: true,
                                          },
                                        }
                                      )}
                                    </div>
                                  )}
                              </Form.Field>
                              {selectedTemplate?.translations &&
                                selectedTemplate.translations[
                                  selectedOptIn.language ?? defaultLangOption
                                ] &&
                                selectedTemplate.translations[
                                  selectedOptIn.language ?? defaultLangOption
                                ]?.buttons && (
                                  <div className="button header">
                                    <div className="header">
                                      {t(
                                        "settings.template.form.buttons.header"
                                      )}
                                    </div>
                                    <div className="subHeader">
                                      <Trans
                                        i18nKey={
                                          "settings.template.form.buttons.quickReplyHeader"
                                        }
                                        count={3}
                                      >
                                        Create up to {{ number: 3 }} buttons
                                        that let customers respond to your
                                        message. See{" "}
                                        <a
                                          className="link"
                                          rel="noreferrer noopener"
                                          target="_blank"
                                          href="https://youtu.be/bBRtj1sa6VM"
                                        >
                                          how it works.
                                        </a>
                                      </Trans>
                                    </div>
                                  </div>
                                )}
                              {selectedTemplate.translations &&
                                selectedTemplate.translations[
                                  selectedOptIn.language ?? defaultLangOption
                                ] &&
                                selectedTemplate.translations[
                                  selectedOptIn.language ?? defaultLangOption
                                ]?.buttons?.map((button) => (
                                  <div className="button">
                                    <TemplateQuickReplyButton
                                      error={""}
                                      isReadOnly={true}
                                      buttonText={button.text}
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                        {selectedTemplate.translations &&
                          selectedTemplate.translations[
                            selectedOptIn.language ?? defaultLangOption
                          ] && (
                            <PreviewContent
                              fluid
                              buttons={
                                selectedTemplate.translations[
                                  selectedOptIn.language ?? defaultLangOption
                                ].buttons
                              }
                              value={
                                selectedTemplate.translations[
                                  selectedOptIn.language ?? defaultLangOption
                                ].content
                              }
                            />
                          )}
                      </div>
                      <div className="opt-in-footer">
                        <div className="column">
                          <div className="action-btn">
                            <Button
                              primary
                              onClick={isUpdated ? saveOptInSetting : undefined}
                              disabled={!isUpdated}
                              loading={saveOptInLoading}
                            >
                              {t("settings.optIn.button.save")}
                            </Button>
                          </div>
                        </div>
                        <div className="column">
                          <div className="preview"></div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </Dimmer.Dimmable>
      </div>
    </div>
  );
}
